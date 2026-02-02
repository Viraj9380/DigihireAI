import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

export default function MyCodingQuestionsModal({ testId, onClose }) {
  const navigate = useNavigate();

  const [allQuestions, setAllQuestions] = useState([]);
  const [addedQuestions, setAddedQuestions] = useState([]);
  const [selected, setSelected] = useState([]);

  const [difficulty, setDifficulty] = useState("");
  const [questionBank, setQuestionBank] = useState("");
  const [questionBanks, setQuestionBanks] = useState([]);

  const [successMsg, setSuccessMsg] = useState("");

  /* ---------------- LOADERS ---------------- */

  useEffect(() => {
    loadQuestionBanks();
  }, []);

  useEffect(() => {
    loadQuestions();
    loadAddedQuestions();
  }, [difficulty, questionBank]);

  const loadQuestionBanks = async () => {
    const res = await axios.get(`${API}/question-banks`);
    setQuestionBanks(res.data);
  };

  const loadQuestions = async () => {
    const res = await axios.get(`${API}/coding/questions`, {
      params: {
        difficulty: difficulty || undefined,
        question_bank_id: questionBank || undefined,
        system_only: false,
      },
    });
    setAllQuestions(res.data);
  };

  const loadAddedQuestions = async () => {
    const testRes = await axios.get(`${API}/coding/tests`);
    const test = testRes.data.find((t) => t.id === testId);

    if (!test?.coding_question_ids) return;

    const qRes = await axios.get(`${API}/coding/questions`);
    const matched = qRes.data.filter((q) =>
      test.coding_question_ids.includes(q.id)
    );

    setAddedQuestions(matched);
  };

  /* ---------------- ACTIONS ---------------- */

  const toggleSelect = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelected(allQuestions.map((q) => q.id));
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

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  /* ---------------- UI ---------------- */

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-6xl rounded-lg shadow-lg relative p-6 max-h-[90vh] overflow-y-auto">
        
        {/* CLOSE */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-black text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-semibold mb-4">
          Manage Coding Questions
        </h2>

        {/* TOP ACTION BAR */}
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          {/* LEFT ACTIONS */}
          <div className="flex flex-wrap items-center gap-3">
            <select
              className="p-2 border rounded text-sm"
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value)}
            >
              <option value="">All Difficulties</option>
              <option value="Easy">Easy</option>
              <option value="Medium">Medium</option>
              <option value="Hard">Hard</option>
            </select>

            <select
              className="p-2 border rounded text-sm"
              value={questionBank}
              onChange={(e) => setQuestionBank(e.target.value)}
            >
              <option value="">All Question Banks</option>
              {questionBanks.map((qb) => (
                <option key={qb.id} value={qb.id}>
                  {qb.name}
                </option>
              ))}
            </select>

            <button
              onClick={selectAll}
              className="border px-3 py-1 rounded text-sm"
            >
              Select All
            </button>

            <button
              onClick={addQuestions}
              className="bg-green-600 text-white px-4 py-1.5 rounded text-sm"
            >
              Add
            </button>
          </div>

          {/* RIGHT ACTION */}
          <button
            onClick={() => navigate("/coding/questions/new")}
            className="border border-blue-500 text-blue-600 px-3 py-1.5 rounded text-sm hover:bg-blue-50"
          >
            + Create Question
          </button>
        </div>

        {successMsg && (
          <div className="text-green-600 text-sm mb-3">
            ✔ {successMsg}
          </div>
        )}

        {/* QUESTIONS LIST */}
        <div className="space-y-2">
          {allQuestions.map((q) => (
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
        <h3 className="mt-6 font-semibold">Added Questions</h3>

        {addedQuestions.length === 0 && (
          <p className="text-sm text-gray-500 mt-2">
            No questions added yet.
          </p>
        )}

        {addedQuestions.map((q) => (
          <div key={q.id} className="mt-2 p-2 bg-gray-100 rounded">
            {q.title}
          </div>
        ))}
      </div>
    </div>
  );
}
