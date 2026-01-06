// src/pages/MyQuestionPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000";




export default function MyQuestionsPage({ testId: propTestId, isModal }) {
  const params = useParams();
  const testId = propTestId || params.testId;

  const navigate = useNavigate();

  const [allQuestions, setAllQuestions] = useState([]);
  const [addedQuestions, setAddedQuestions] = useState([]);
  const [selected, setSelected] = useState([]);

  const [difficulty, setDifficulty] = useState("");
  const [questionBank, setQuestionBank] = useState("");
  const [questionBanks, setQuestionBanks] = useState([]);

  const [activeTab, setActiveTab] = useState("questions");
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
    <div className="p-6">
      {/* HEADER */}
      {!isModal && ( <h1 className="text-2xl font-bold mb-4">My Questions</h1>)}

      {/* TABS */}
      <div className="flex gap-6 border-b mb-6">
        <button
          onClick={() => setActiveTab("questions")}
          className={`pb-2 ${
            activeTab === "questions"
              ? "border-b-2 border-blue-600 font-semibold"
              : "text-gray-500"
          }`}
        >
          Questions
        </button>

        <button
          onClick={() => setActiveTab("banks")}
          className={`pb-2 ${
            activeTab === "banks"
              ? "border-b-2 border-blue-600 font-semibold"
              : "text-gray-500"
          }`}
        >
          Manage Question Banks
        </button>
      </div>

      <div className="flex gap-6">
        {/* LEFT FILTER PANEL */}
        <div className="w-64 border rounded p-4 space-y-4 h-fit">
          <h3 className="font-semibold text-sm">Filters</h3>

          <select
            className="w-full p-2 border rounded text-sm"
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>

          <select
            className="w-full p-2 border rounded text-sm"
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
        </div>

        {/* MAIN CONTENT */}
        <div className="flex-1">
          {activeTab === "questions" && (
            <>
              {/* ACTION BAR */}
              <div className="flex items-center gap-3 mb-4">
                <button
                  onClick={() => navigate("/coding/questions/new")}
                  className="border border-blue-500 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-50"
                >
                  + Create Question
                </button>

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

                {successMsg && (
                  <span className="text-green-600 text-sm font-medium">
                    ✔ {successMsg}
                  </span>
                )}
              </div>

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
              <h2 className="mt-8 text-lg font-semibold">Added Questions</h2>

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
            </>
          )}

          {activeTab === "banks" && (
            <div className="p-6 border rounded text-center">
              <p className="mb-4 text-gray-600">
                Manage and organize your Question Banks here.
              </p>
              <button
                onClick={() => navigate("/question-banks")}
                className="border px-4 py-2 rounded hover:bg-gray-50"
              >
                Go to Question Banks
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
