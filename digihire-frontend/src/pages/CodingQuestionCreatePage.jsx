//src/pages/CodingQuestionCreatePage.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

export default function CodingQuestionCreatePage() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    difficulty: "Medium",
    input_format: "",
    output_format: "",
    constraints: "",
    sample_input: "",
    sample_output: "",
    examples: `[
  {"input": "5", "output": "120"},
  {"input": "3", "output": "6"}
]`,
    testcases: `[
  {"input": "4", "output": "24"},
  {"input": "6", "output": "720"}
]`,
  });

  const update = (k, v) => setForm({ ...form, [k]: v });
  const [questionBanks, setQuestionBanks] = useState([]);


  useEffect(() => {
  axios.get(`${API_BASE}/question-banks`)
    .then(res => setQuestionBanks(res.data));
}, []);



  async function saveQuestion() {
    try {
      await axios.post(`${API_BASE}/coding/questions`, {
        ...form,
        examples: JSON.parse(form.examples),
        testcases: JSON.parse(form.testcases),
      });
      alert("✅ Question created successfully");
      window.location.reload();
    } catch (err) {
      alert("❌ Invalid JSON or server error");
    }
  }

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-5">
      <h1 className="text-3xl font-bold">Create Coding Question</h1>

      {/* Title */}
      <input
        className="w-full p-3 border rounded"
        placeholder="Question Title"
        value={form.title}
        onChange={(e) => update("title", e.target.value)}
      />

      {/* Difficulty */}
      <select
        className="w-full p-3 border rounded"
        value={form.difficulty}
        onChange={(e) => update("difficulty", e.target.value)}
      >
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>

    
      <select
  className="w-full p-3 border rounded"
  onChange={(e) => update("question_bank_id", e.target.value)}
>
  <option value="">Select Question Bank</option>
  {questionBanks.map(qb => (
    <option key={qb.id} value={qb.id}>
      {qb.name}
    </option>
  ))}
</select>


      {/* Description */}
      <textarea
        className="w-full p-3 border rounded"
        rows={6}
        placeholder="Problem Description"
        value={form.description}
        onChange={(e) => update("description", e.target.value)}
      />

      {/* Input / Output / Constraints */}
      <textarea
        className="w-full p-3 border rounded"
        placeholder="Input Format"
        value={form.input_format}
        onChange={(e) => update("input_format", e.target.value)}
      />

      <textarea
        className="w-full p-3 border rounded"
        placeholder="Output Format"
        value={form.output_format}
        onChange={(e) => update("output_format", e.target.value)}
      />

      <textarea
        className="w-full p-3 border rounded"
        placeholder="Constraints"
        value={form.constraints}
        onChange={(e) => update("constraints", e.target.value)}
      />

      {/* Samples */}
      <textarea
        className="w-full p-3 border rounded"
        placeholder="Sample Input"
        value={form.sample_input}
        onChange={(e) => update("sample_input", e.target.value)}
      />

      <textarea
        className="w-full p-3 border rounded"
        placeholder="Sample Output"
        value={form.sample_output}
        onChange={(e) => update("sample_output", e.target.value)}
      />

      {/* Examples */}
      <div>
        <p className="font-semibold mb-1">Examples (JSON)</p>
        <textarea
          className="w-full p-3 border rounded font-mono"
          rows={5}
          value={form.examples}
          onChange={(e) => update("examples", e.target.value)}
        />
      </div>

      {/* Testcases */}
      <div>
        <p className="font-semibold mb-1">Hidden Testcases (JSON)</p>
        <textarea
          className="w-full p-3 border rounded font-mono"
          rows={5}
          value={form.testcases}
          onChange={(e) => update("testcases", e.target.value)}
        />
      </div>

      {/* Save */}
      <button
        onClick={saveQuestion}
        className="bg-blue-600 text-white px-8 py-3 rounded text-lg"
      >
        Save Question
      </button>
    </div>
  );
}
