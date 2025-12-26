//digihire-frontend/src/pages/CodingQuestioncreatPage.jsx
import React, { useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

export default function CodingQuestionCreatePage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    input_format: "",
    output_format: "",
    constraints: "",
    sample_input: "",
    sample_output: "",
    testcases: `[
  {"input": "2 3", "output": "5"},
  {"input": "10 20", "output": "30"}
]`,
  });

  async function saveQuestion() {
    try {
      await axios.post(`${API_BASE}/coding/questions`, form);
      alert("Question created successfully");
    } catch {
      alert("Failed to create question");
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Create Coding Question</h1>

      {Object.keys(form).map((key) => (
        <textarea
          key={key}
          placeholder={key.replace("_", " ").toUpperCase()}
          value={form[key]}
          onChange={(e) => setForm({ ...form, [key]: e.target.value })}
          className="w-full p-3 border rounded font-mono"
          rows={key === "description" ? 6 : 3}
        />
      ))}

      <button
        onClick={saveQuestion}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        Save Question
      </button>
    </div>
  );
}
