import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";

export default function McqQuestionCreatePage() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [correctIndex, setCorrectIndex] = useState(0);
  const [difficulty, setDifficulty] = useState("Medium");
  const [technology, setTechnology] = useState("");
  const [questionBankId, setQuestionBankId] = useState("");

  const [questionBanks, setQuestionBanks] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/question-banks`)
      .then(res =>
        setQuestionBanks(
          res.data.filter(qb => qb.question_type === "MCQ")
        )
      );
  }, []);

  const updateOption = (i, v) => {
    const copy = [...options];
    copy[i] = v;
    setOptions(copy);
  };

  const addOption = () => setOptions([...options, ""]);

  const save = async () => {
    await axios.post(`${API}/mcq/questions`, {
      question,
      options,
      correct_index: correctIndex,
      difficulty,
      technology,
      question_bank_id: questionBankId || null,
      is_system_generated: false
    });

    alert("✅ MCQ created");
    window.location.reload();
  };

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold">Create MCQ</h1>

      <textarea
        className="border p-3 w-full"
        placeholder="Question"
        value={question}
        onChange={e => setQuestion(e.target.value)}
      />

      {options.map((opt, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="border p-2 flex-1"
            placeholder={`Option ${i + 1}`}
            value={opt}
            onChange={e => updateOption(i, e.target.value)}
          />
          <input
            type="radio"
            checked={correctIndex === i}
            onChange={() => setCorrectIndex(i)}
          />
        </div>
      ))}

      <button onClick={addOption} className="text-blue-600 text-sm">
        + Add Option
      </button>

      <select
        className="border p-2 w-full"
        value={difficulty}
        onChange={e => setDifficulty(e.target.value)}
      >
        <option>Easy</option>
        <option>Medium</option>
        <option>Hard</option>
      </select>

      <input
        className="border p-2 w-full"
        placeholder="Technology"
        value={technology}
        onChange={e => setTechnology(e.target.value)}
      />

      {/* Question Bank */}
      <select
        className="border p-2 w-full"
        value={questionBankId}
        onChange={e => setQuestionBankId(e.target.value)}
      >
        <option value="">Select Question Bank</option>
        {questionBanks.map(qb => (
          <option key={qb.id} value={qb.id}>
            {qb.name}
          </option>
        ))}
      </select>

      <button
        onClick={save}
        className="bg-blue-600 text-white px-6 py-2 rounded"
      >
        Save MCQ
      </button>
    </div>
  );
}
