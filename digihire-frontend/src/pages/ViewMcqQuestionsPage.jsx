//src/pages/ViewMcqQuestionsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000";

export default function ViewMcqQuestionsPage() {
  const { testId } = useParams();
  const [codingQuestions, setCodingQuestions] = useState([]);
  const [mcqQuestions, setMcqQuestions] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const testRes = await axios.get(`${API}/coding/tests/${testId}`);
    const test = testRes.data;

    const [codingRes, mcqRes] = await Promise.all([
      axios.get(`${API}/coding/questions/`),
      axios.get(`${API}/mcq/questions/`),
    ]);

    const matchedCoding = codingRes.data.filter((q) =>
      test.coding_question_ids?.includes(q.id)
    );

    const matchedMCQ = mcqRes.data.filter((q) =>
      test.mcq_question_ids?.includes(q.id)
    );

    setCodingQuestions(matchedCoding);
    setMcqQuestions(matchedMCQ);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Questions</h1>

      {codingQuestions.length === 0 && (
        <p className="text-gray-500">No coding questions added yet.</p>
      )}

      {codingQuestions.map((q) => (
        <div key={q.id} className="border p-4 rounded mb-3">
          <h3 className="font-semibold">{q.title}</h3>
          <p className="text-sm text-gray-600">{q.description}</p>
        </div>
      ))}

      {/* ================= MCQ QUESTIONS ================= */}
      <h2 className="text-xl font-bold mt-8 mb-2">MCQ Questions</h2>

      {mcqQuestions.length === 0 && (
        <p className="text-gray-500">No MCQs added.</p>
      )}

      {mcqQuestions.map((mcq, idx) => (
        <div key={mcq.id} className="border p-4 rounded mb-3">
          <p className="font-semibold">
            {idx + 1}. {mcq.question}
          </p>

          <p className="text-xs text-gray-500 mb-2">
            Difficulty: {mcq.difficulty}
            {mcq.technology && ` • ${mcq.technology}`}
            {mcq.is_system_generated && " • System Generated"}
          </p>

          <ul className="mt-2 space-y-1">
            {(Array.isArray(mcq.options)
              ? mcq.options
              : Object.values(mcq.options)
            ).map((opt, i) => (
              <li key={i} className="text-sm text-gray-700">
                {String.fromCharCode(65 + i)}. {opt}
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
