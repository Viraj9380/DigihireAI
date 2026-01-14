import React from "react";
import axios from "axios";

const API = "http://localhost:8000";

export default function McqQuestionsTab({
  selectedTest,
  mcqQuestions,
  setMcqQuestions,
  selectedMcqs,
  setSelectedMcqs,
  onAddClick
}) {
  const selectAll = () => {
    setSelectedMcqs(mcqQuestions.map(q => q.id));
  };

  const deleteSelected = async () => {
    if (!selectedMcqs.length) return;

    await axios.post(
      `${API}/coding/tests/${selectedTest.id}/remove-mcq-questions`,
      selectedMcqs
    );

    setMcqQuestions(prev =>
      prev.filter(q => !selectedMcqs.includes(q.id))
    );
    setSelectedMcqs([]);
  };

  return (
    <div>
      <div className="flex justify-end gap-3 mb-4">
        <button
          onClick={selectAll}
          className="border px-3 py-1 rounded text-sm"
        >
          Select All
        </button>

        <button
          onClick={deleteSelected}
          className="border px-3 py-1 rounded text-sm text-red-600"
        >
          Delete
        </button>

        <button
          onClick={onAddClick}
          className="bg-orange-500 text-white px-4 py-1 rounded text-sm"
        >
          Add MCQ
        </button>
      </div>

      {mcqQuestions.length === 0 && (
        <p className="text-gray-500 text-sm">No MCQs added to this test.</p>
      )}

      {mcqQuestions.map(q => (
        <div
          key={q.id}
          className="border p-4 rounded mb-3 flex gap-3"
        >
          <input
            type="checkbox"
            checked={selectedMcqs.includes(q.id)}
            onChange={() =>
              setSelectedMcqs(prev =>
                prev.includes(q.id)
                  ? prev.filter(x => x !== q.id)
                  : [...prev, q.id]
              )
            }
          />

          <div>
            <p className="font-semibold">{q.question}</p>
            <p className="text-xs text-gray-500">
              {q.technology} • {q.difficulty}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
