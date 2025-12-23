
# app/utils/utils_v2.py
"""
JD-first, minimal A1 tech-only skill extraction (Option A1) - final tuned version.
- Extracts only core tech skills from JD (no predefined tech lists) using TF-IDF + heuristics.
- Very aggressive noise removal so only 5-10 core skills are kept.
- Scoring heavily favors skill matches so strong JD-resume matches score 85+.
- Returns only an integer final score (0..100).
Dependencies: sentence-transformers, scikit-learn, numpy, requests, PyPDF2
"""

from typing import List, Tuple
import re, io, os, json
import requests
import numpy as np
from sentence_transformers import SentenceTransformer, util
from sklearn.feature_extraction.text import TfidfVectorizer
import PyPDF2

# Load model once
model = SentenceTransformer("all-MiniLM-L6-v2")

# Generic tokens to remove (non-tech words)
GENERIC_STOP_TOKENS = set([
    "experience", "working", "work", "ability", "abilities", "responsible",
    "required", "years", "year", "role", "knowledge", "skills", "skill",
    "candidate", "preferable", "preferred", "good", "strong", "excellent",
    "system", "systems", "application", "applications", "development", "develop",
    "using", "based", "provide", "ensure", "support", "team", "project", "projects",
    "analysis", "analysis", "level", "performance", "work", "workload", "management"
])

# -------------------------
# IO / Text helpers
# -------------------------
def extract_text_from_pdf(path_or_url: str) -> str:
    try:
        if re.match(r"^https?://", path_or_url):
            resp = requests.get(path_or_url, timeout=20)
            resp.raise_for_status()
            file_bytes = io.BytesIO(resp.content)
        else:
            file_bytes = open(path_or_url, "rb")
        reader = PyPDF2.PdfReader(file_bytes)
        text = ""
        for page in reader.pages:
            t = page.extract_text()
            if t:
                text += t + "\n"
        try:
            if not re.match(r"^https?://", path_or_url):
                file_bytes.close()
        except:
            pass
        return text
    except Exception as e:
        print("extract_text_from_pdf error:", e)
        return ""

def clean_text(text: str) -> str:
    text = (text or "").lower()
    text = re.sub(r"[^a-z0-9\s\-\+\/\.\#\_]", " ", text)
    return " ".join(text.split())

def chunk_text_for_embedding(text: str, max_chunk_chars: int = 1200) -> List[str]:
    text = (text or "").strip()
    if not text:
        return []
    if len(text) <= max_chunk_chars:
        return [text]
    chunks = []
    start = 0
    while start < len(text):
        end = min(len(text), start + max_chunk_chars)
        if end < len(text):
            space = text.rfind(" ", start, end)
            if space > start:
                end = space
        chunk = text[start:end].strip()
        if chunk:
            chunks.append(chunk)
        start = end
    return chunks

def average_embedding_for_text(text: str):
    chunks = chunk_text_for_embedding(text)
    if not chunks:
        return model.encode("", convert_to_numpy=True)
    embs = model.encode(chunks, convert_to_numpy=True)
    if embs.ndim == 1:
        return embs
    return np.mean(embs, axis=0)

# -------------------------
# JD extraction (A1: tech-only minimal)
# -------------------------
def extract_top_tfidf_phrases(text: str, top_n: int = 40, ngram_range=(1,2)) -> List[Tuple[str, float]]:
    text = text or ""
    if not text.strip():
        return []
    try:
        vectorizer = TfidfVectorizer(stop_words="english", ngram_range=ngram_range)
        tfidf = vectorizer.fit_transform([text])
        features = vectorizer.get_feature_names_out()
        scores = tfidf.toarray()[0]
        idx = np.argsort(scores)[::-1]
        out = []
        for i in idx:
            phrase = features[i].strip()
            if not phrase or len(phrase) <= 2:
                continue
            score = float(scores[i])
            if score <= 0.0:
                continue
            out.append((phrase, score))
            if len(out) >= top_n:
                break
        return out
    except Exception as e:
        print("extract_top_tfidf_phrases error:", e)
        return []

def normalize_token(tok: str) -> str:
    t = (tok or "").lower().strip()
    t = re.sub(r"\bc\s*\+\+\b", "c++", t)
    t = re.sub(r"\bcpp\b", "c++", t)
    t = re.sub(r"\bc\s*\#\b", "c#", t)
    t = re.sub(r"\bjs\b", "javascript", t)
    t = re.sub(r"\bpy\b", "python", t)
    t = re.sub(r"[^\w\+\#\.\-]", " ", t)
    t = re.sub(r"\s+", " ", t).strip()
    return t

def split_and_extract_tokens(phrase: str) -> List[str]:
    if not phrase:
        return []
    phrase = phrase.replace("(", " ( ").replace(")", " ) ")
    tokens = []
    paren_contents = re.findall(r"\((.*?)\)", phrase)
    for p in paren_contents:
        for part in re.split(r"[,/;|]", p):
            part = part.strip()
            if part:
                tokens.append(part)
    phrase_no_paren = re.sub(r"\(.*?\)", " ", phrase)
    for part in re.split(r"[,/;|&]| and | with | using | for ", phrase_no_paren):
        part = part.strip()
        if part:
            tokens.append(part)
    out = []
    for t in tokens:
        t_norm = normalize_token(t)
        for sub in t_norm.split():
            s = sub.strip()
            if s:
                out.append(s)
    seen = set()
    final = []
    for x in out:
        if x not in seen:
            seen.add(x)
            final.append(x)
    return final

def is_tech_like(token: str) -> bool:
    if not token:
        return False
    if token in GENERIC_STOP_TOKENS:
        return False
    if re.search(r"[\+\#\.\/\_]", token):
        return True
    if any(ch.isdigit() for ch in token):
        return True
    if len(token) <= 4:
        return True
    common_english = {"and","or","the","this","that","with","from","into","process","processing"}
    if token in common_english:
        return False
    return True

def extract_core_tech_terms_from_jd(jd_text: str, max_terms: int = 10) -> List[str]:
    jd_text = jd_text or ""
    phrases = extract_top_tfidf_phrases(jd_text, top_n=40, ngram_range=(1,2))
    token_scores = {}
    for idx, (ph, sc) in enumerate(phrases):
        pos_weight = 1.0 / (1 + idx)
        tokens = split_and_extract_tokens(ph)
        for t in tokens:
            t_norm = t.strip().lower()
            if not t_norm:
                continue
            if not is_tech_like(t_norm):
                continue
            paren_bonus = 0.0
            if "(" in ph and ")" in ph and re.search(r"\("+re.escape(t)+r"\)", ph):
                paren_bonus = 1.0
            score = sc * (1.0 + paren_bonus) * pos_weight
            token_scores[t_norm] = token_scores.get(t_norm, 0.0) + score
    if not token_scores:
        paren_contents = re.findall(r"\((.*?)\)", jd_text)
        for p in paren_contents:
            for part in re.split(r"[,/;|]", p):
                t = normalize_token(part.strip())
                if t and is_tech_like(t):
                    token_scores[t] = token_scores.get(t, 0.0) + 1.0
    sorted_tokens = sorted(token_scores.items(), key=lambda x: x[1], reverse=True)
    top_tokens = [t for t,_ in sorted_tokens[:max_terms]]
    return top_tokens

# -------------------------
# Matching & Scoring
# -------------------------
def phrase_in_text_direct(phrase: str, text: str) -> bool:
    if not phrase or not text:
        return False
    pat = r"(?<!\w)"+re.escape(phrase)+r"(?!\w)"
    if re.search(pat, text):
        return True
    tokens = phrase.split()
    if all(tok in text for tok in tokens):
        return True
    return False

def phrase_matches_by_embedding(phrase: str, text: str, threshold: float = 0.62) -> bool:
    if not phrase or not text:
        return False
    try:
        if phrase_in_text_direct(phrase, text):
            return True
        phrase_emb = model.encode([phrase], convert_to_numpy=True)[0]
        phrase_emb = phrase_emb / (np.linalg.norm(phrase_emb) + 1e-9)
        chunks = chunk_text_for_embedding(text, max_chunk_chars=1200)
        if not chunks:
            return False
        chunk_embs = model.encode(chunks, convert_to_numpy=True)
        norms = np.linalg.norm(chunk_embs, axis=1, keepdims=True)
        norms[norms==0] = 1.0
        chunk_embs = chunk_embs / norms
        sims = np.dot(chunk_embs, phrase_emb)
        max_sim = float(np.max(sims))
        return max_sim >= threshold
    except Exception:
        return phrase_in_text_direct(phrase, text)

def detect_years_from_text(text: str) -> int:
    nums = []
    for m in re.finditer(r"(\d{1,2})\s*\+?\s*(?:years|year|yrs)", text):
        try:
            nums.append(int(m.group(1)))
        except:
            pass
    words_to_num = {"one":1,"two":2,"three":3,"four":4,"five":5,"six":6,"seven":7,"eight":8,"nine":9,"ten":10}
    for w,n in words_to_num.items():
        if re.search(rf"\b{w}\s+(?:years|year|yrs)\b", text):
            nums.append(n)
    return max(nums) if nums else 0

def extract_required_experience(text: str) -> int:
    if not text:
        return 0
    m = re.search(r"(\d{1,2})\s*\+?\s*(?:years|year|yrs)", text)
    if m:
        try:
            return int(m.group(1))
        except:
            pass
    return detect_years_from_text(text)

def compare_scores(resume_path_or_url: str, job_description: str) -> int:
    try:
        resume_raw = extract_text_from_pdf(resume_path_or_url)
        resume_text = clean_text(resume_raw)
        jd_text = clean_text(job_description or "")

        core_terms = extract_core_tech_terms_from_jd(jd_text, max_terms=10)

        if core_terms:
            matched = 0
            for term in core_terms:
                if phrase_in_text_direct(term, resume_text):
                    matched += 1
                else:
                    if phrase_matches_by_embedding(term, resume_text, threshold=0.62):
                        matched += 1
            ratio = matched / len(core_terms)
            core_score = min(60.0, ratio * 60.0)
        else:
            core_score = 0.0

        phrases = extract_top_tfidf_phrases(jd_text, top_n=30, ngram_range=(1,2))
        if phrases:
            kw = [normalize_token(p[0]) for p in phrases]
            hits = 0
            for p in kw:
                if phrase_in_text_direct(p, resume_text) or phrase_matches_by_embedding(p, resume_text, threshold=0.65):
                    hits += 1
            kw_score = (hits / len(kw)) * 14.0
        else:
            kw_score = 0.0

        emb_r = average_embedding_for_text(resume_text)
        emb_j = average_embedding_for_text(jd_text)
        sim = float(util.cos_sim(emb_r, emb_j).item())
        sim_norm = max(0.0, (sim + 1.0) / 2.0)
        semantic_score = sim_norm * 26.0

        actual_exp = detect_years_from_text(resume_text)
        required_exp = extract_required_experience(job_description or "")
        exp_score = 0.0
        if required_exp:
            if actual_exp >= required_exp:
                exp_score = 10.0
            elif actual_exp >= max(1, int(required_exp * 0.7)):
                exp_score = 6.0
            else:
                exp_score = 0.0
        else:
            if actual_exp >= 7:
                exp_score = 8.0
            elif actual_exp >= 4:
                exp_score = 5.0
            elif actual_exp >= 2:
                exp_score = 2.0
            else:
                exp_score = 0.0

        ats_penalty = 0.0
        if len(resume_text) < 300:
            ats_penalty -= 2.5
        if resume_raw.count("\n\n") > 60 or resume_raw.count("  ") > 80:
            ats_penalty -= 1.5
        if len(resume_raw) < 200:
            ats_penalty -= 1.0
        ats_penalty = max(ats_penalty, -5.0)

        total = core_score + kw_score + semantic_score + exp_score + ats_penalty
        total = max(0.0, min(100.0, total))
        return int(round(total))
    except Exception as e:
        print("compare_scores error:", e)
        return 0
