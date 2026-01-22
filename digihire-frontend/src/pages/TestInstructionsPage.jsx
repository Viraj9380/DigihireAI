// src/pages/TestInstructionsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import axios from "axios";
import logo from "../assets/digihire-logo.png";

const API = "http://localhost:8000";

export default function TestInstructionsPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [test, setTest] = useState(null);

  useEffect(() => {
    axios.get(`${API}/coding/tests`).then(res => {
      const t = res.data.find(x => x.id === testId);
      setTest(t);
    });
  }, [testId]);

  if (!test) return <div className="p-6">Loading...</div>;

  const mcqCount = test.mcq_question_ids?.length || 0;
  const codingCount = test.coding_question_ids?.length || 0;
  const totalQuestions = mcqCount + codingCount;

  // ✅ FIX: derive duration correctly
  const totalMinutes = mcqCount * 1 + codingCount * 15;

  return (
    <div className="max-w-5xl mx-auto p-10">
      {/* HEADER */}
      <div className="flex items-center gap-4 mb-8">
        <img src={logo} alt="logo" className="h-12" />
        <h1 className="text-2xl font-semibold">
          Test Name : {test.title}
        </h1>
      </div>

      {/* COMPOSITION */}
      <div className="border rounded mb-8">
        <div className="grid grid-cols-3 p-4 font-semibold bg-gray-100">
          <span>Section</span>
          <span>Questions</span>
          <span>Time</span>
        </div>

        {mcqCount > 0 && (
          <div className="grid grid-cols-3 p-4 border-t">
            <span>MCQ</span>
            <span>{mcqCount}</span>
            <span>—</span>
          </div>
        )}

        {codingCount > 0 && (
          <div className="grid grid-cols-3 p-4 border-t">
            <span>Coding</span>
            <span>{codingCount}</span>
            <span>—</span>
          </div>
        )}

        <div className="grid grid-cols-3 p-4 border-t font-semibold">
          <span>Total</span>
          <span>{totalQuestions}</span>
          <span>{totalMinutes} minutes</span>
        </div>
      </div>

      {/* INSTRUCTIONS */}
      <h2 className="text-xl font-semibold mb-4">Test Instructions</h2>
      <ol className="list-decimal ml-6 space-y-3 text-gray-700">
        <li>The test contains MCQ and Coding sections.</li>
        <li>MCQ section must be completed before moving to Coding section.</li>
        <li>Do not refresh or close the browser.</li>
        <li>Tab switching is monitored.</li>
        <li>Questions are shown one at a time.</li>
        <li>Auto-submit happens when time expires.</li>
        <li>Use the question pallete to view current question, Unanswered Questions, and Answered Questions.</li>
      </ol>

      <div className="text-center mt-12">
        <button
          onClick={() => navigate(`/test/${testId}/start`)}
          className="bg-blue-600 text-white px-8 py-3 rounded text-lg"
        >
          Start Test
        </button>
      </div>
    </div>
  );
}
