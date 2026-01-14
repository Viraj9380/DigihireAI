import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";

export default function DigiHireMcqQuestionsModal({
  testId,
  onClose,
  onAdded
}) {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);

  const [technology, setTechnology] = useState("");
  const [difficulty, setDifficulty] = useState("");

  const loadQuestions = async () => {
    const params = new URLSearchParams();
    params.append("system_only", "true");

    if (technology) params.append("technology", technology);
    if (difficulty) params.append("difficulty", difficulty);

    const res = await axios.get(
      `${API}/mcq/questions?${params.toString()}`
    );
    setQuestions(res.data);
  };

  useEffect(() => {
    loadQuestions();
  }, [technology, difficulty]);

  const addQuestions = async () => {
    await axios.post(
      `${API}/coding/tests/${testId}/add-mcq-questions`,
      selected
    );
    onAdded();
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
      <div className="bg-white p-6 rounded w-[700px] max-h-[80vh] overflow-auto">
        
        {/* Header */}
        <h2 className="text-lg font-semibold mb-3">DigiHire MCQs</h2>

        {/* Filters - TOP LEFT */}
        <div className="flex gap-3 mb-4">
          <select
            className="border p-1 text-sm rounded"
            value={technology}
            onChange={e => setTechnology(e.target.value)}
          >
            <option value="">All Technologies</option>
            <option value="Python Full Stack">Python Full Stack</option>
            <option value="Java Full Stack">Java Full Stack</option>
            <option value="Machine Learning">Machine Learning</option>
            <option value="Database / SQL">Database / SQL</option>
          </select>

          <select
            className="border p-1 text-sm rounded"
            value={difficulty}
            onChange={e => setDifficulty(e.target.value)}
          >
            <option value="">All Difficulties</option>
            <option value="Easy">Easy</option>
            <option value="Medium">Medium</option>
            <option value="Hard">Hard</option>
          </select>
        </div>

        {/* Questions List */}
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
                {q.technology} • {q.difficulty}
              </p>
            </div>
          </div>
        ))}

        {questions.length === 0 && (
          <p className="text-sm text-gray-500 mt-4">
            No MCQs found for selected filters.
          </p>
        )}

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
