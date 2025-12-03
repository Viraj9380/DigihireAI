

// ===== Updated UploadResumeModal.jsx =====
import React, { useState } from "react";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function UploadResumeModal({ open, onClose, candidate, onUploaded }) {
  const [file, setFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  if (!open || !candidate) return null;

  const candidateId = candidate.id || candidate.candidate_id;

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);

      const storageRef = ref(storage, `resumes/${candidateId}_${file.name}`);
      await uploadBytes(storageRef, file);
      const downloadURL = await getDownloadURL(storageRef);

      const res = await fetch(
        `http://127.0.0.1:8000/candidates/upload?candidate_id=${candidateId}&resume_url=${encodeURIComponent(downloadURL)}`,
        { method: "POST" }
      );

      const updatedCandidate = await res.json();
      onUploaded(updatedCandidate);

      setUploading(false);
      onClose();
    } catch (err) {
      console.error("Upload error:", err);
      setUploading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white w-full max-w-md p-6 rounded-lg shadow-lg space-y-4">
        <h2 className="text-xl font-semibold">Upload Resume</h2>

        <p className="text-gray-700">Candidate: <strong>{candidate.name}</strong></p>

        <input type="file" accept="application/pdf" onChange={(e) => setFile(e.target.files[0])} className="border p-2 rounded w-full" />

        <div className="flex justify-end space-x-2 mt-4">
          <button className="px-4 py-2 bg-gray-300 rounded" onClick={onClose} disabled={uploading}>Cancel</button>

          <button className={`px-4 py-2 rounded text-white ${uploading ? "bg-gray-500" : "bg-blue-600 hover:bg-blue-700"}`} onClick={handleUpload} disabled={!file || uploading}>
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>
      </div>
    </div>
  );
}
