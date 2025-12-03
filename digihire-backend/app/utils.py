#app/utils.py
import requests
import io
import PyPDF2
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from app.default_jd import DEFAULT_DESCRIPTION

def extract_text_from_pdf(url: str):
    response = requests.get(url)
    file_bytes = io.BytesIO(response.content)

    reader = PyPDF2.PdfReader(file_bytes)
    text = ""
    for page in reader.pages:
        text += page.extract_text() or ""
    return text

def compare_scores(resume_url: str):
    try:
        resume_text = extract_text_from_pdf(resume_url).lower()
        jd_text = DEFAULT_DESCRIPTION.lower()

        # -------------------------------
        # 1️⃣ TF-IDF Cosine Similarity
        # -------------------------------
        documents = [resume_text, jd_text]
        vectorizer = TfidfVectorizer(stop_words="english")
        vectors = vectorizer.fit_transform(documents)
        base_similarity = cosine_similarity(vectors[0], vectors[1]).flatten()[0]
        base_score = base_similarity * 100  # already 0–100

        # --------------------------------
        # 2️⃣ Keyword Skill Weighting
        # --------------------------------
        KEYWORDS = [
            "microcontroller", "embedded", "iot", "c", "c++", "python",
            "java", "mysql", "blynk", "pcb", "hardware", "firmware",
            "signal processing", "matlab", "sensor", "integration"
        ]

        keyword_hits = sum(1 for k in KEYWORDS if k in resume_text)
        max_keywords = len(KEYWORDS)
        keyword_score = (keyword_hits / max_keywords) * 40  # max +40 bonus

        # --------------------------------
        # 3️⃣ Direct JD Keyword Boost
        # --------------------------------
        jd_keywords = DEFAULT_DESCRIPTION.lower().split()
        jd_overlap = sum(1 for k in jd_keywords if k in resume_text)
        jd_boost = min(jd_overlap * 0.05, 20)  # max +20

        # --------------------------------
        # 4️⃣ Final Weighted Score
        # --------------------------------
        final_score = base_score * 0.55 + keyword_score + jd_boost

        # Ensure final score stays within reasonable bounds
        final_score = max(35, min(final_score, 98))

        return round(final_score, 2)

    except Exception as e:
        print("Scoring error:", e)
        return 0.0
