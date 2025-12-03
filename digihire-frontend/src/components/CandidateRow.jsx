// src/components/CandidateRow.jsx
import React from "react";
import { deleteCandidate } from "../services/api";
import { FaTrash } from "react-icons/fa";

export default function CandidateRow({ candidate, onDelete }) {
  const handleDelete = async () => {
    if (!window.confirm("Delete this candidate?")) return;

    await deleteCandidate(candidate.candidate_id || candidate.id);
    if (onDelete) onDelete();  // refresh list
  };

  return (
    <tr className="border-b">
      <td className="p-3">{candidate.name}</td>
      <td className="p-3">{candidate.email}</td>
      <td className="p-3">{candidate.phone_number}</td>
      <td className="p-3">{candidate.last_score || "-"}</td>

      {/* Delete Icon */}
      <td className="p-3 text-center">
        <button
          className="text-red-600 hover:text-red-800"
          onClick={handleDelete}
        >
          <FaTrash />
        </button>
      </td>
    </tr>
  );
}
