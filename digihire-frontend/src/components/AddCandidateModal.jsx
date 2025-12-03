// src/components/AddCandidateModal.jsx
import React, { useState } from "react";
import { createMultipleCandidatess, uploadResumeMetadata } from "../services/api";
import { storage } from "../firebase";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";

/**
 * AddCandidateModal
 * - Collects rows with name, email, phone, resume file
 * - Calls createMultipleCandidatess to create candidate rows (POST /candidates/)
 * - For each created candidate, if a resume file was provided, uploads file to Firebase storage,
 *   fetches download URL, then calls POST /candidates/upload?candidate_id=...&resume_url=...
 * - Finally calls onSaved() to let parent reload list.
 */
export default function AddCandidateModal({ onClose, onSaved, maxRows = 10 }) {
  const [rows, setRows] = useState([{ name: "", email: "", phone_number: "", resume_file: null }]);
  const [saving, setSaving] = useState(false);

  const updateRow = (idx, key, val) => {
    const next = [...rows];
    next[idx][key] = val;
    setRows(next);
  };

  const addRow = () => {
    if (rows.length >= maxRows) return;
    setRows([...rows, { name: "", email: "", phone_number: "", resume_file: null }]);
  };

  const removeRow = (i) => setRows(rows.filter((_, idx) => idx !== i));

  const handleSave = async () => {
    // Basic validation
    for (let i = 0; i < rows.length; i++) {
      if (!rows[i].name || !rows[i].email) {
        alert(`Please fill name and email for row ${i + 1}`);
        return;
      }
    }

    setSaving(true);
    try {
      // 1) Create candidate records (no files) using existing backend endpoint
      const created = await createMultipleCandidatess(
        rows.map((r) => ({ name: r.name, email: r.email, phone_number: r.phone_number }))
      );

      // 2) For each created candidate, if resume file exists: upload to Firebase and call backend upload endpoint
      for (let i = 0; i < created.length; i++) {
        const cand = created[i];
        const file = rows[i].resume_file;
        if (!file) continue;

        try {
          const filename = `${cand.candidate_id}_${file.name}`;
          const storageRef = ref(storage, `resumes/${filename}`);
          await uploadBytes(storageRef, file);
          const downloadURL = await getDownloadURL(storageRef);

          // Notify backend (this will trigger scoring and store resume_path + last_score)
          await uploadResumeMetadata(cand.candidate_id, downloadURL);
        } catch (err) {
          console.error(`Failed saving resume for candidate ${cand.email}:`, err);
          // continue for others
        }
      }

      onSaved && onSaved();
      onClose();
    } catch (err) {
      console.error(err);
      alert(err?.response?.data?.detail || "Failed to save candidates");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-4xl p-6">
        <h3 className="text-lg font-semibold mb-3">Add Candidates</h3>

        <div className="space-y-3 max-h-[55vh] overflow-auto">
          {rows.map((r, i) => (
            <div key={i} className="grid grid-cols-12 gap-2 items-center">
              <input
                className="col-span-3 border rounded px-2 py-1"
                placeholder="Name"
                value={r.name}
                onChange={(e) => updateRow(i, "name", e.target.value)}
              />

              <input
                className="col-span-3 border rounded px-2 py-1"
                placeholder="Email"
                value={r.email}
                onChange={(e) => updateRow(i, "email", e.target.value)}
              />

              <input
                className="col-span-2 border rounded px-2 py-1"
                placeholder="Phone"
                value={r.phone_number}
                onChange={(e) => updateRow(i, "phone_number", e.target.value)}
              />

              <input
                type="file"
                accept="application/pdf"
                className="col-span-3 border rounded px-2 py-1"
                onChange={(e) => updateRow(i, "resume_file", e.target.files?.[0] || null)}
              />

              <button className="col-span-1 text-red-600" onClick={() => removeRow(i)}>
                ✕
              </button>
            </div>
          ))}
        </div>

        <div className="flex items-center justify-between mt-4">
          <div className="text-sm text-gray-600">{rows.length}/{maxRows} rows</div>

          <div className="flex gap-2">
            <button className="text-sm text-sky-600" onClick={addRow}>+ Add row</button>
            <button className="px-3 py-1 rounded border" onClick={onClose}>Cancel</button>
            <button className="px-3 py-1 rounded bg-sky-600 text-white" onClick={handleSave} disabled={saving}>
              {saving ? "Saving..." : "Save"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
