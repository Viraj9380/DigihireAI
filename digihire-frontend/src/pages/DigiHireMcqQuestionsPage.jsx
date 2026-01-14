import React, { useEffect, useState } from "react";
import axios from "axios";

const API = "http://localhost:8000";

export default function DigiHireMcqQuestionsPage({ testId, onClose }) {
  const [questions, setQuestions] = useState([]);
  const [selected, setSelected] = useState([]);

  useEffect(() => {
    axios.get(`${API}/mcq/questions?system=true`)
      .then(res => setQuestions(res.data));
  }, []);

  const add = async () => {
    await axios.post(
      `${API}/coding/tests/${testId}/add-questions`,
      { coding_question_ids: [], mcq_question_ids: selected }
    );
    onClose();
  };

  return (
    <Modal title="DigiHire MCQ Library" onClose={onClose}>
      {questions.map(q => (
        <div key={q.id} className="border p-2 flex gap-2">
          <input
            type="checkbox"
            onChange={() =>
              setSelected(p =>
                p.includes(q.id)
                  ? p.filter(i => i !== q.id)
                  : [...p, q.id]
              )
            }
          />
          {q.question}
        </div>
      ))}

      <button onClick={add}
        className="mt-4 bg-orange-500 text-white px-4 py-1 rounded">
        Add Selected
      </button>
    </Modal>
  );
}

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[700px] p-4 rounded">
        <div className="flex justify-between mb-3">
          <h2 className="font-bold">{title}</h2>
          <button onClick={onClose}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}
