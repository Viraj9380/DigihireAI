import React, { useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";

export default function AddQuestionBankModal({ onClose, onSaved }) {
  const [form, setForm] = useState({
    name: "",
    skill: "",
    question_type: "Coding",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const update = (k, v) => setForm({ ...form, [k]: v });

  const save = async () => {
    if (!form.name.trim()) {
      setError("Question bank name is required");
      return;
    }

    try {
      setLoading(true);
      await axios.post(`${API}/question-banks`, form);
      setLoading(false);
      onSaved && onSaved();
      onClose();
    } catch (err) {
      setLoading(false);
      setError("Failed to create question bank");
    }
  };

  return (
    <div className="fixed inset-0 bg-black/30 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-[420px] p-6">
        <h2 className="text-xl font-semibold mb-4">Add Question Bank</h2>

        {error && (
          <p className="text-red-600 text-sm mb-3">{error}</p>
        )}

        {/* Question Bank Name */}
        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Question Bank Name"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
        />

        {/* Skill */}
        <input
          className="w-full border p-2 rounded mb-3"
          placeholder="Skill / Technology (optional)"
          value={form.skill}
          onChange={(e) => update("skill", e.target.value)}
        />

        {/* Question Type */}
        <select
          className="w-full border p-2 rounded mb-5"
          value={form.question_type}
          onChange={(e) => update("question_type", e.target.value)}
        >
          <option value="Coding">Coding</option>
          <option value="MCQ">MCQ</option>
        </select>

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 border rounded"
            disabled={loading}
          >
            Cancel
          </button>

          <button
            onClick={save}
            className="px-4 py-2 bg-blue-600 text-white rounded"
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
