import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8000";

export default function CodingQuestionListPage() {
  const [questions, setQuestions] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API_BASE}/coding/questions`)
      .then(res => setQuestions(res.data))
      .catch(console.error);
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Coding Questions</h1>

      {questions.map(q => (
        <div
          key={q.id}
          onClick={() => navigate(`/coding/questions/${q.id}/solve`)}
          className="p-4 border rounded mb-3 cursor-pointer hover:bg-gray-50"
        >
          <h2 className="font-semibold">{q.title}</h2>
          <p className="text-gray-600 line-clamp-2">{q.description}</p>
        </div>
      ))}
    </div>
  );
}
