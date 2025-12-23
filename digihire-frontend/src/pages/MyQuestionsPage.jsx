import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000";

export default function MyQuestionsPage() {
  const { testId } = useParams();
  const [selected, setSelected] = useState([]);
  const navigate = useNavigate();

  const save = async () => {
    await axios.post(`${API}/coding/tests/${testId}/add-questions`, selected);
    navigate("/tests");
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">My Questions</h1>

      <button
        onClick={() => navigate("/coding/questions")}
        className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
      >
        Add Questions
      </button>

      <button
        onClick={save}
        className="ml-4 bg-green-600 text-white px-4 py-2 rounded"
      >
        Save Test
      </button>
    </div>
  );
}
