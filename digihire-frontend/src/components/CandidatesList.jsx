// src/components/CandidateList.jsx
import React from "react";
import CandidateRow from "./CandidateRow";

export default function CandidateList({ candidates = [], onDelete }) {
  return (
    <div className="mt-4">
      {candidates.length === 0 ? (
        <div className="text-gray-500">No candidates yet</div>
      ) : (
        <table className="w-full border rounded bg-white">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Name</th>
              <th className="p-3 text-left">Email</th>
              <th className="p-3 text-left">Phone</th>
              <th className="p-3 text-left">Score</th>
              <th className="p-3 text-center">Delete</th> {/* NEW COLUMN */}
            </tr>
          </thead>

          <tbody>
            {candidates.map((c) => (
              <CandidateRow
                key={c.candidate_id || c.id}
                candidate={c}
                onDelete={onDelete}  // pass handler
              />
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
