import React, { useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions, getDocument } from "pdfjs-dist";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

// ✅ Set worker source dynamically
GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjsLib.version}/build/pdf.worker.min.js`;



const ResumeMatcher = () => {
  const [resumeFile, setResumeFile] = useState(null);
  const [resumeUrl, setResumeUrl] = useState("");
  const [jdUrl, setJdUrl] = useState("");
  const [score, setScore] = useState(null);
  const [loading, setLoading] = useState(false);

  // 🔹 Upload Resume to Firebase
  const handleUpload = async () => {
    if (!resumeFile) {
      alert("Please select a file first!");
      return;
    }
    setLoading(true);
    try {
      const fileRef = ref(storage, `resumes/${resumeFile.name}`);
      await uploadBytes(fileRef, resumeFile);
      const url = await getDownloadURL(fileRef);
      setResumeUrl(url);
      alert("✅ Resume uploaded successfully!");
    } catch (error) {
      console.error(error);
      alert("Error uploading resume!");
    }
    setLoading(false);
  };

  // 🔹 Extract text from PDF (URL version)
  const extractTextFromURL = async (url) => {
    const pdf = await pdfjsLib.getDocument(url).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      text += content.items.map((item) => item.str).join(" ");
    }
    return text.toLowerCase();
  };

  // 🔹 Compare Resume & JD
  const handleCompare = async () => {
    if (!resumeUrl || !jdUrl) {
      alert("Please upload resume and enter JD URL!");
      return;
    }
    setLoading(true);
    try {
      const resumeText = await extractTextFromURL(resumeUrl);
      const jdText = await extractTextFromURL(jdUrl);
      const resumeWords = new Set(resumeText.split(/\W+/));
      const jdWords = jdText.split(/\W+/);
      const matched = jdWords.filter((word) => resumeWords.has(word));
      const score = Math.round((matched.length / jdWords.length) * 100);
      setScore(score);
    } catch (error) {
      console.error(error);
      alert("Error comparing PDFs!");
    }
    setLoading(false);
  };

  return (
    <div className="matcher-container">
      <h2>📄 Resume Matcher with Firebase</h2>

      <div className="upload-section">
        <label>Upload Resume (PDF):</label>
        <input type="file" accept="application/pdf" onChange={(e) => setResumeFile(e.target.files[0])} />
        <button onClick={handleUpload} disabled={loading}>Upload Resume</button>
        {resumeUrl && <p>✅ Uploaded! URL saved in Firebase.</p>}

        <label>Enter Job Description PDF URL:</label>
        <input
          type="text"
          placeholder="Paste JD file URL (Firebase / Google Drive link)"
          value={jdUrl}
          onChange={(e) => setJdUrl(e.target.value)}
        />

        <button onClick={handleCompare} disabled={loading}>
          {loading ? "Analyzing..." : "Compare Now"}
        </button>
      </div>

      {score !== null && (
        <div className="result">
          <h3>Match Score: <span style={{ color: score > 70 ? "green" : "red" }}>{score}%</span></h3>
          {score > 70 ? <p>✅ Great match!</p> : <p>⚠️ Try improving your resume for this JD.</p>}
        </div>
      )}
    </div>
  );
};

export default ResumeMatcher;
