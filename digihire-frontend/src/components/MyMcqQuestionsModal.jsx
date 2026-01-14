import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

export default function MyMcqQuestionsModal({
  testId,
  onClose,
  onAdded
}) {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);

  const [difficulty, setDifficulty] = useState("");
  const [questionBankId, setQuestionBankId] = useState("");
  const [questionBanks, setQuestionBanks] = useState([]);

  const navigate = useNavigate();

  const fetchQuestions = () => {
    const params = {
      system_only: false
    };

    if (difficulty) params.difficulty = difficulty;
    if (questionBankId) params.question_bank_id = questionBankId;

    axios
      .get(`${API}/mcq/questions`, { params })
      .then(res => setQuestions(res.data));
  };

  useEffect(() => {
    fetchQuestions();
  }, [difficulty, questionBankId]);

  useEffect(() => {
    axios
      .get(`${API}/question-banks`)
      .then(res =>
        setQuestionBanks(
          res.data.filter(qb => qb.question_type === "MCQ")
        )
      );
  }, []);

  const addQuestions = async () => {
    await axios.post(
      `${API}/coding/tests/${testId}/add-mcq-questions`,
      selected
    );
    onAdded();
    onClose();
  };

  const goToCreateMcq = () => {
    onClose();
    navigate("/mcq/questions/new");
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded w-[700px] max-h-[80vh] overflow-auto">

        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold">My MCQs</h2>

          <button
            onClick={goToCreateMcq}
            className="text-sm bg-green-600 text-white px-3 py-1 rounded"
          >
            + Create MCQ Question
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-3 mb-4">
          <select
            className="border p-2 text-sm"
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
          >
            <option value="">All Difficulties</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>

          <select
            className="border p-2 text-sm"
            value={questionBankId}
            onChange={e => setQuestionBankId(e.target.value)}
          >
            <option value="">All Question Banks</option>
            {questionBanks.map(qb => (
              <option key={qb.id} value={qb.id}>
                {qb.name}
              </option>
            ))}
          </select>
        </div>

        {/* Questions */}
        {questions.map(q => (
          <div
            key={q.id}
            className="border p-3 rounded mb-2 flex gap-3"
          >
            <input
              type="checkbox"
              checked={selected.includes(q.id)}
              onChange={() =>
                setSelected(prev =>
                  prev.includes(q.id)
                    ? prev.filter(x => x !== q.id)
                    : [...prev, q.id]
                )
              }
            />

            <div>
              <p className="font-medium">{q.question}</p>
              <p className="text-xs text-gray-500">
                {q.technology || "—"} • {q.difficulty}
              </p>
            </div>
          </div>
        ))}

        {/* Footer */}
        <div className="flex justify-end gap-3 mt-4">
          <button onClick={onClose} className="text-sm">
            Cancel
          </button>
          <button
            onClick={addQuestions}
            className="bg-blue-600 text-white px-4 py-1 rounded text-sm"
          >
            Add Selected
          </button>
        </div>
      </div>
    </div>
  );
}
