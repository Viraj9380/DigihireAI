//src/pages/MyMcqQuestionsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000";

export default function MyMcqQuestionsPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [test, setTest] = useState(null);

  const [codingLibrary, setCodingLibrary] = useState([]);
  const [mcqLibrary, setMcqLibrary] = useState([]);

  const [selectedCoding, setSelectedCoding] = useState([]);
  const [selectedMCQ, setSelectedMCQ] = useState([]);

  const [codingDifficulty, setCodingDifficulty] = useState("All");
  const [mcqDifficulty, setMcqDifficulty] = useState("All");
  const [mcqCategory, setMcqCategory] = useState("All");

  const [successMsg, setSuccessMsg] = useState("");

  // ================= LOAD TEST =================
  const loadTest = async () => {
    const res = await axios.get(`${API}/coding/tests/${testId}`);
    setTest(res.data);
    setSelectedCoding((res.data.coding_question_ids || []).map(String));
    setSelectedMCQ((res.data.mcq_question_ids || []).map(String));
  };

  // ================= LOAD LIBRARIES =================
  const loadLibraries = async () => {
    const [codingRes, mcqRes] = await Promise.all([
      axios.get(`${API}/coding/questions/`),
      axios.get(`${API}/mcq/questions/`),
    ]);

    setCodingLibrary(codingRes.data);
    setMcqLibrary(mcqRes.data);
  };

  useEffect(() => {
    loadTest();
    loadLibraries();
  }, [testId]);

  // ================= FILTERED LISTS =================
  const filteredCoding = codingLibrary.filter(
    (q) => (codingDifficulty === "All" ? true : q.difficulty === codingDifficulty)
  );
  const filteredMCQ = mcqLibrary.filter(q => {
  const difficultyMatch =
    mcqDifficulty === "All" || q.difficulty === mcqDifficulty;

  const categoryMatch =
    mcqCategory === "All" || q.category === mcqCategory;

  return difficultyMatch && categoryMatch;
});


  const mcqCategories = [
  "All",
  ...Array.from(new Set(mcqLibrary.map(q => q.category).filter(Boolean)))
];

  // ================= TOGGLES =================
  const toggleCoding = (id) => {
    const sid = String(id);
    setSelectedCoding((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]
    );
  };

  const toggleMCQ = (id) => {
    const sid = String(id);
    setSelectedMCQ((prev) =>
      prev.includes(sid) ? prev.filter((x) => x !== sid) : [...prev, sid]
    );
  };

  // ================= SAVE =================
  const saveCoding = async () => {
    await axios.put(`${API}/coding/tests/${testId}/coding-questions`, {
      coding_question_ids: selectedCoding,
    });
    setSuccessMsg("Coding questions saved");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  const saveMCQ = async () => {
    await axios.put(`${API}/coding/tests/${testId}/mcq-questions`, {
      mcq_question_ids: selectedMCQ,
    });
    setSuccessMsg("MCQ questions saved");
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  if (!test) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-8">
      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">{test.title}</h1>
          <p className="text-sm text-gray-500">Duration: {test.duration_minutes} mins</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate("/coding/questions/new")}
            className="border border-blue-500 text-blue-600 px-3 py-1 rounded text-sm hover:bg-blue-50"
          >
            + Create Question
          </button>

          <button
            onClick={() => {
              setSelectedCoding(filteredCoding.map((q) => String(q.id)));
              setSelectedMCQ(filteredMCQ.map((q) => String(q.id)));
            }}
            className="border px-3 py-1 rounded"
          >
            Select All
          </button>
        </div>
      </div>

      {successMsg && (
        <div className="text-green-600 text-sm font-medium">{successMsg}</div>
      )}

      {/* ================= CODING ================= */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Coding Questions</h2>
          <select
            className="border p-2 rounded"
            value={codingDifficulty}
            onChange={(e) => setCodingDifficulty(e.target.value)}
          >
            <option>All</option>
            <option>Easy</option>
            <option>Medium</option>
            <option>Hard</option>
          </select>
        </div>

        {filteredCoding.map((q) => {
          const qid = String(q.id);
          return (
            <div key={qid} className="border p-3 rounded flex gap-3 mb-2">
              <input
                type="checkbox"
                checked={selectedCoding.includes(qid)}
                onChange={() => toggleCoding(qid)}
              />
              <div>
                <p className="font-medium">{q.title}</p>
                <p className="text-xs text-gray-500">Difficulty: {q.difficulty}</p>
              </div>
            </div>
          );
        })}

        <button
          onClick={saveCoding}
          className="mt-2 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Coding Questions
        </button>
      </section>

      {/* ================= MCQ ================= */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">MCQ Questions</h2>
           <div className="flex gap-2">
            {/* CATEGORY FILTER */}
          <select
      className="border p-2 rounded"
      value={mcqCategory}
      onChange={(e) => setMcqCategory(e.target.value)}
    >
      {mcqCategories.map(cat => (
        <option key={cat} value={cat}>
          {cat}
        </option>
      ))}
    </select>

    {/* DIFFICULTY FILTER */}
    <select
      className="border p-2 rounded"
      value={mcqDifficulty}
      onChange={(e) => setMcqDifficulty(e.target.value)}
    >
      <option>All</option>
      <option>Easy</option>
      <option>Medium</option>
      <option>Hard</option>
    </select>
  </div>
</div>

        {filteredMCQ.map((q) => {
          const qid = String(q.id);
          return (
            <div key={qid} className="border p-3 rounded flex gap-3 mb-2">
              <input
                type="checkbox"
                checked={selectedMCQ.includes(qid)}
                onChange={() => toggleMCQ(qid)}
              />
              <div>
                <p className="font-medium">{q.question}</p>
                <p className="text-xs text-gray-500">Difficulty: {q.difficulty}</p>
              </div>
            </div>
          );
        })}

        <button
          onClick={saveMCQ}
          className="mt-2 bg-green-600 text-white px-4 py-2 rounded"
        >
          Save MCQ Questions
        </button>
      </section>
    </div>
  );
}