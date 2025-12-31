import React, { useEffect, useState } from "react";
import axios from "axios";
import AddQuestionBankModal from "../components/AddQuestionBankModal";

const API = "http://localhost:8000";

export default function QuestionBanksPage() {
  const [questionBanks, setQuestionBanks] = useState([]);
  const [openModal, setOpenModal] = useState(false);

  const loadQuestionBanks = async () => {
    const res = await axios.get(`${API}/question-banks`);
    setQuestionBanks(res.data);
  };

  useEffect(() => {
    loadQuestionBanks();
  }, []);

  return (
    <div className="p-6">
      {/* HEADER */}
      <div className="flex justify-between items-center mb-4">
        <h1 className="text-2xl font-bold">Question Banks</h1>

        <button
          onClick={() => setOpenModal(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded"
        >
          Add Question Bank
        </button>
      </div>

      {/* TABLE */}
      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Question Bank</th>
              <th className="p-3 text-left">Skill</th>
              <th className="p-3 text-left">Type</th>
              <th className="p-3 text-left">Status</th>
              <th className="p-3 text-left">Created On</th>
            </tr>
          </thead>

          <tbody>
            {questionBanks.length === 0 && (
              <tr>
                <td colSpan="5" className="p-4 text-center text-gray-500">
                  No question banks created yet
                </td>
              </tr>
            )}

            {questionBanks.map((qb) => (
              <tr key={qb.id} className="border-t">
                <td className="p-3">{qb.name}</td>
                <td className="p-3">{qb.skill || "-"}</td>
                <td className="p-3">{qb.question_type}</td>
                <td className="p-3">{qb.status}</td>
                <td className="p-3">
                  {new Date(qb.created_at).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* MODAL */}
      {openModal && (
        <AddQuestionBankModal
          onClose={() => setOpenModal(false)}
          onSaved={loadQuestionBanks}
        />
      )}
    </div>
  );
}
