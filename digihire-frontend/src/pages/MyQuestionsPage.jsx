import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000";

export default function MyQuestionsPage() {
  const { testId } = useParams();

  const [allQuestions, setAllQuestions] = useState([]);
  const [selected, setSelected] = useState([]);
  const [addedQuestions, setAddedQuestions] = useState([]);
  const [difficulty, setDifficulty] = useState("");

  useEffect(() => {
    loadQuestions();
    loadAddedQuestions();
  }, [difficulty]);

  const loadQuestions = async () => {
    const res = await axios.get(`${API}/coding/questions`);
    const filtered = difficulty
      ? res.data.filter(q => q.difficulty === difficulty)
      : res.data;
    setAllQuestions(filtered);
  };

  const loadAddedQuestions = async () => {
    const testRes = await axios.get(`${API}/coding/tests`);
    const test = testRes.data.find(t => t.id === testId);

    if (!test || !test.coding_question_ids) return;

    const qRes = await axios.get(`${API}/coding/questions`);
    const matched = qRes.data.filter(q =>
      test.coding_question_ids.includes(q.id)
    );

    setAddedQuestions(matched);
  };

  const toggleSelect = id => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const selectAll = () => {
    setSelected(allQuestions.map(q => q.id));
  };

  const addQuestions = async () => {
    await axios.post(
      `${API}/coding/tests/${testId}/add-questions`,
      selected
    );
    setSelected([]);
    loadAddedQuestions();
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">My Questions</h1>
        <div className="flex gap-2">
          <button onClick={selectAll} className="border px-3 py-1 rounded">
            Select All
          </button>
          <button onClick={addQuestions} className="bg-green-600 text-white px-4 py-2 rounded">
            Add
          </button>
        </div>
      </div>

      <select
        className="mb-4 p-2 border"
        value={difficulty}
        onChange={e => setDifficulty(e.target.value)}
      >
        <option value="">All Difficulties</option>
        <option value="Easy">Easy</option>
        <option value="Medium">Medium</option>
        <option value="Hard">Hard</option>
      </select>

      <div className="space-y-2">
        {allQuestions.map(q => (
          <div key={q.id} className="border p-3 flex gap-3 rounded">
            <input
              type="checkbox"
              checked={selected.includes(q.id)}
              onChange={() => toggleSelect(q.id)}
            />
            <div>
              <h3 className="font-semibold">{q.title}</h3>
              <p className="text-xs text-gray-500">{q.difficulty}</p>
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-8 text-xl font-semibold">Added Questions</h2>
      {addedQuestions.map(q => (
        <div key={q.id} className="mt-2 p-2 bg-gray-100 rounded">
          {q.title}
        </div>
      ))}
    </div>
  );
}
