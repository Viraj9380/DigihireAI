// src/pages/DigiHireQuestionsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000";

export default function DigiHireQuestionsPage({ testId: propTestId, isModal }) {
  const params = useParams();
  const testId = propTestId || params.testId;


  const [questions, setQuestions] = useState([]);
  const [technology, setTechnology] = useState("");
  const [selected, setSelected] = useState([]);
  const [successMsg, setSuccessMsg] = useState("");

  /* ---------------- LOAD SYSTEM QUESTIONS ---------------- */

  useEffect(() => {
    loadQuestions();
  }, [technology]);

  const loadQuestions = async () => {
    const res = await axios.get(`${API}/coding/questions`, {
      params: {
        system_only: true,
        technology: technology || undefined,
      },
    });

    setQuestions(res.data);
  };

  /* ---------------- ACTIONS ---------------- */

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id)
        ? prev.filter((x) => x !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelected(questions.map((q) => q.id));
  };

  const addQuestions = async () => {
    if (selected.length === 0) return;

    await axios.post(
      `${API}/coding/tests/${testId}/add-questions`,
      selected
    );

    setSelected([]);
    showSuccess("Questions added successfully");
  };

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="p-6">
      {!isModal && ( <h1 className="text-2xl font-bold mb-4">DigiHire Questions</h1> )}


      {/* FILTERS */}
      <div className="flex gap-4 mb-4">
        <select
          className="border p-2 rounded"
          value={technology}
          onChange={(e) => setTechnology(e.target.value)}
        >
          <option value="">All Technologies</option>
          <option value="Java Full Stack">Java Full Stack</option>
          <option value="Python Full Stack">Python Full Stack</option>
          <option value="Compiler Design">Compiler Design</option>
          {/* Newly Added */}
          <option value="Database / SQL">Database / SQL</option>
          <option value="Machine Learning">Machine Learning</option>
          <option value=".NET Fullstack">.NET Fullstack</option>
        </select>

        <button
          onClick={selectAll}
          className="border px-3 py-1 rounded text-sm"
        >
          Select All
        </button>

        <button
          onClick={addQuestions}
          className="bg-green-600 text-white px-4 py-1 rounded text-sm"
        >
          Add
        </button>

        {successMsg && (
          <span className="text-green-600 text-sm font-medium">
            ✔ {successMsg}
          </span>
        )}
      </div>

      {/* QUESTIONS LIST */}
      {questions.length === 0 && (
        <p className="text-gray-500 text-sm">
          No DigiHire questions found.
        </p>
      )}

      <div className="space-y-2">
        {questions.map((q) => (
          <div
            key={q.id}
            className="border p-3 flex gap-3 rounded items-start"
          >
            <input
              type="checkbox"
              checked={selected.includes(q.id)}
              onChange={() => toggleSelect(q.id)}
            />

            <div>
              <h3 className="font-semibold">{q.title}</h3>
              <p className="text-xs text-gray-500">
                Difficulty: {q.difficulty}
              </p>
              <p className="text-xs text-gray-500">
                Technology: {q.technology}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
