// digihire-frontend/src/pages/MyQuestionsPage.jsx
import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = "http://127.0.0.1:8000";

export default function MyQuestionsPage() {
  const { testId } = useParams();

  const [test, setTest] = useState(null);

  const [codingLibrary, setCodingLibrary] = useState([]);
  const [mcqLibrary, setMcqLibrary] = useState([]);

  const [selectedCoding, setSelectedCoding] = useState([]);
  const [selectedMCQ, setSelectedMCQ] = useState([]);

  // 🔹 NEW: difficulty filters
  const [codingDifficulty, setCodingDifficulty] = useState("All");
  const [mcqDifficulty, setMcqDifficulty] = useState("All");

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
      axios.get(`${API}/mcq/questions/`)
    ]);

    setCodingLibrary(codingRes.data);
    setMcqLibrary(mcqRes.data);
  };

  useEffect(() => {
    loadTest();
    loadLibraries();
  }, [testId]);

  // ================= FILTERED LISTS =================
  const filteredCoding = codingLibrary.filter(q =>
    codingDifficulty === "All" ? true : q.difficulty === codingDifficulty
  );

  const filteredMCQ = mcqLibrary.filter(q =>
    mcqDifficulty === "All" ? true : q.difficulty === mcqDifficulty
  );

  // ================= TOGGLES =================
  const toggleCoding = (id) => {
    const sid = String(id);
    setSelectedCoding(prev =>
      prev.includes(sid)
        ? prev.filter(x => x !== sid)
        : [...prev, sid]
    );
  };

  const toggleMCQ = (id) => {
    const sid = String(id);
    setSelectedMCQ(prev =>
      prev.includes(sid)
        ? prev.filter(x => x !== sid)
        : [...prev, sid]
    );
  };

  // ================= SAVE =================
  const saveCoding = async () => {
    await axios.put(`${API}/coding/tests/${testId}/coding-questions`, {
      coding_question_ids: selectedCoding,
    });
    alert("Coding questions saved");
  };

  const saveMCQ = async () => {
    await axios.put(`${API}/coding/tests/${testId}/mcq-questions`, {
      mcq_question_ids: selectedMCQ,
    });
    alert("MCQ questions saved");
  };

  if (!test) return <div className="p-6">Loading...</div>;

  return (
    <div className="p-6 space-y-12">

      {/* HEADER */}
      <div>
        <h1 className="text-2xl font-bold">{test.title}</h1>
        <p className="text-sm text-gray-500">
          Duration: {test.duration_minutes} mins
        </p>
      </div>

      {/* ================= CODING ================= */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">Coding Questions</h2>

          {/* 🔹 Difficulty Filter */}
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

        {filteredCoding.map(q => {
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
                <p className="text-xs text-gray-500">
                  Difficulty: {q.difficulty}
                </p>
              </div>
            </div>
          );
        })}

        <button
          onClick={saveCoding}
          className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
        >
          Save Coding Questions
        </button>
      </section>

      {/* ================= MCQ ================= */}
      <section>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-semibold">MCQ Questions</h2>

          {/* 🔹 Difficulty Filter */}
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

        {filteredMCQ.map(q => {
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
                <p className="text-xs text-gray-500">
                  Difficulty: {q.difficulty}
                </p>
              </div>
            </div>
          );
        })}

        <button
          onClick={saveMCQ}
          className="mt-4 bg-green-600 text-white px-4 py-2 rounded"
        >
          Save MCQ Questions
        </button>
      </section>

    </div>
  );
}
