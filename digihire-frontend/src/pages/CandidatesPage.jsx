// src/pages/CandidatesPage.jsx
import React, { useEffect, useState } from "react";
import { fetchCandidates } from "../services/api";
import CandidateList from "../components/CandidatesList";
import AddCandidateModal from "../components/AddCandidateModal";
import "./../styles/app.css";

export default function CandidatesPage() {
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetchCandidates();
      setCandidates(res || []);
    } catch (e) {
      console.error(e);
      setCandidates([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold">Candidates</h2>
          
        </div>

        <button
          className="px-4 py-2 bg-sky-600 text-white rounded shadow hover:bg-sky-700"
          onClick={() => setShowAdd(true)}
        >
          + Add Candidates
        </button>
      </div>

      <CandidateList candidates={candidates}  onDelete={load} />

      {showAdd && (
        <AddCandidateModal
          onClose={() => setShowAdd(false)}
          onSaved={() => {
            setShowAdd(false);
            load();
          }}
        />
      )}
    </div>
  );
}
