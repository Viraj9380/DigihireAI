import React, { useEffect, useState } from "react";
import axios from "axios";
import CreateTestModal from "../components/CreateTestModal";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

export default function TestCreationPage() {
  const [tests, setTests] = useState([]);
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`${API}/coding/tests`).then(r => setTests(r.data));
  }, []);

  return (
    <div className="p-6">
      <div className="flex justify-between mb-4">
        <h1 className="text-2xl font-bold">My Tests</h1>
        <button onClick={() => setOpen(true)} className="bg-orange-500 text-white px-4 py-2 rounded">
          Create New Test
        </button>
      </div>

      <div className="space-y-4">
        {tests.map(t => (
          <div key={t.id} className="border p-4 rounded flex justify-between">
            <div>
              <h2 className="text-lg font-semibold">{t.name}</h2>
              <p className="text-sm text-gray-500">
                Questions: {t.questions.length} | Duration: {t.duration_minutes} min
              </p>
            </div>
            <div className="text-sm">
              <span className="px-2 py-1 bg-green-100 rounded">{t.status}</span>
              <div>📩 {t.invites} Invites</div>
              <div>📊 {t.reports} Reports</div>
            </div>
          </div>
        ))}
      </div>

      {open && <CreateTestModal onClose={() => setOpen(false)} />}
    </div>
  );
}
