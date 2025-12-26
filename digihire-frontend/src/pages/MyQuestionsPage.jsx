import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000";

export default function MyQuestionsPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [allQuestions, setAllQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [addedQuestions, setAddedQuestions] = useState([]);
  const [difficulty, setDifficulty] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  useEffect(() => {
    loadQuestions();
    loadAddedQuestions();
  }, [difficulty]);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const loadQuestions = async () => {
    const res = await axios.get(`${API}/coding/questions`);
    const filtered = difficulty
      ? res.data.filter(q => q.difficulty === difficulty)
      : res.data;
    setAllQuestions(filtered);
  };

  const loadAddedQuestions = async () => {
    const testRes = await axios.get(`${API}/coding/tests`);
    const test = testRes.data.find(t => t.id === testId);

    if (!test?.coding_question_ids) return;

    const qRes = await axios.get(`${API}/coding/questions`);
    const matched = qRes.data.filter(q =>
      test.coding_question_ids.includes(q.id)
    );

    setAddedQuestions(matched);
  };

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelected(allQuestions.map(q => q.id));
  };

  const addQuestions = async () => {
    await axios.post(
      `${API}/coding/tests/${testId}/add-questions`,
      selected
    );
    setSelected([]);
    loadAddedQuestions();
    showSuccess("Questions added successfully");
  };

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between mb-4 items-center">
        <h1 className="text-2xl font-bold">My Questions</h1>

        <div className="flex items-center gap-3">
          {/* ✅ NEW: Create Question */}
          <button
            onClick={() => navigate("/coding/questions/new")}
            className="border border-blue-500 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-50"
          >
            + Create Question
          </button>

          <button
            onClick={selectAll}
            className="border px-3 py-1 rounded"
          >
            Select All
          </button>

          <button
            onClick={addQuestions}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Add
          </button>

          {successMsg && (
            <span className="text-green-600 text-sm font-medium whitespace-nowrap">
              ✔ {successMsg}
            </span>
          )}
        </div>
      </div>

      {/* FILTER */}
      <select
        className="mb-4 p-2 border rounded"
        value={difficulty}
        onChange={(e) => setDifficulty(e.target.value)}
      >
        <option value="">All Difficulties</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>

      {/* ALL QUESTIONS */}
      <div className="space-y-2">
        {allQuestions.map(q => (
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
            </div>
          </div>
        ))}
      </div>

      {/* ADDED QUESTIONS */}
      <h2 className="mt-8 text-xl font-semibold">Added Questions</h2>

      {addedQuestions.length === 0 && (
        <p className="text-sm text-gray-500 mt-2">
          No questions added yet.
        </p>
      )}

      {addedQuestions.map(q => (
        <div key={q.id} className="mt-2 p-2 bg-gray-100 rounded">
          {q.title}
        </div>
      ))}
    </div>
  );
}
