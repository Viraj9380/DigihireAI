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

  const totalQuestions =
    (test.coding_question_ids?.length || 0) +
    (test.mcq_question_ids?.length || 0);

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
        <div className="grid grid-cols-3 p-4 font-semibold">
          <span>Section</span>
          <span>Questions</span>
          <span>Time</span>
        </div>
        <div className="grid grid-cols-3 p-4 border-t">
          <span>Coding</span>
          <span>{totalQuestions}</span>
          <span>{test.duration_minutes} minutes</span>
        </div>
      </div>

      {/* INSTRUCTIONS */}
      <h2 className="text-xl font-semibold mb-4">Instructions</h2>
      <ol className="list-decimal ml-6 space-y-3 text-gray-700">
        <li>This is a time-bound test.</li>
        <li>Do not refresh or close the browser.</li>
        <li>Tab switching is monitored.</li>
        <li>Questions are shown one at a time.</li>
        <li>Auto-submit happens when time expires.</li>
        <li>Final submission cannot be undone.</li>
      </ol>

      <div className="text-center mt-12">
        <p className="text-lg mb-4">Are You Ready?</p>
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
