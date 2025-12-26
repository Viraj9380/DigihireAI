import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000";

export default function ViewQuestionsPage() {
  const { testId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [toast, setToast] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const testRes = await axios.get(`${API}/coding/tests`);
    const test = testRes.data.find(t => t.id === testId);

    if (!test || !test.coding_question_ids) {
      setQuestions([]);
      return;
    }

    const qRes = await axios.get(`${API}/coding/questions`);
    const matched = qRes.data.filter(q =>
      test.coding_question_ids.includes(q.id)
    );

    setQuestions(matched);
    setSelected([]);
  };

  const toggleSelect = (id) => {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelected(questions.map(q => q.id));
  };

  const deleteSelected = async () => {
    if (selected.length === 0) return;

    await axios.post(
      `${API}/coding/tests/${testId}/remove-questions`,
      selected
    );

    setToast("Questions removed successfully");
    load();

    setTimeout(() => setToast(""), 2500);
  };

  return (
    <div className="p-6 relative">
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Test Questions</h1>

        <div className="flex gap-2 items-center">
          <button
            onClick={selectAll}
            className="border px-3 py-1 rounded text-sm"
          >
            Select All
          </button>

          <button
            onClick={deleteSelected}
            className="bg-red-600 text-white px-4 py-2 rounded"
          >
            Delete Questions
          </button>

          {toast && (
            <span className="ml-3 text-green-600 text-sm whitespace-nowrap">
              ✔ {toast}
            </span>
          )}
        </div>
      </div>

      {questions.length === 0 && (
        <p className="text-gray-500">No questions added yet.</p>
      )}

      {questions.map(q => (
        <div
          key={q.id}
          className="border p-4 rounded mb-3 flex gap-3"
        >
          <input
            type="checkbox"
            checked={selected.includes(q.id)}
            onChange={() => toggleSelect(q.id)}
          />

          <div>
            <h3 className="font-semibold">{q.title}</h3>
            <p className="text-sm text-gray-600 line-clamp-2">
              {q.description}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
