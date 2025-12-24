import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000";

export default function ViewQuestionsPage() {
  const { testId } = useParams();
  const [questions, setQuestions] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const testRes = await axios.get(`${API}/coding/tests`);
    const test = testRes.data.find(t => t.id === testId);

    const qRes = await axios.get(`${API}/coding/questions`);
    const matched = qRes.data.filter(q =>
      test.coding_question_ids.includes(q.id)
    );

    setQuestions(matched);
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Test Questions</h1>

      {questions.map(q => (
        <div key={q.id} className="border p-4 rounded mb-3">
          <h3 className="font-semibold">{q.title}</h3>
          <p className="text-sm text-gray-600">{q.description}</p>
        </div>
      ))}
    </div>
  );
}
