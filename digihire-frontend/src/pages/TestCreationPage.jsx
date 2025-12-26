import React, { useEffect, useState } from "react";
import axios from "axios";
import CreateTestModal from "../components/CreateTestModal";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

export default function TestCreationPage() {
  const [tests, setTests] = useState([]);
  const [open, setOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const navigate = useNavigate();

  const fetchTests = async () => {
    const res = await axios.get(`${API}/coding/tests`);
    setTests(res.data);
  };

  useEffect(() => {
    fetchTests();
  }, []);

  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="p-6">
      <div className="flex justify-between mb-6 items-center">
        <h1 className="text-2xl font-bold">My Tests</h1>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="bg-orange-500 text-white px-4 py-2 rounded"
          >
            Create New Test
          </button>

          {successMsg && (
            <span className="text-green-600 text-sm font-medium">
              ✔ {successMsg}
            </span>
          )}
        </div>
      </div>

      <div className="space-y-4">
        {tests.map((t) => (
          <div
            key={t.id}
            className="border p-4 rounded flex justify-between items-center"
          >
            <div>
              <h2 className="text-lg font-semibold">{t.title}</h2>
              <p className="text-sm text-gray-500">
                Questions: {(t.coding_question_ids?.length || 0) + (t.mcq_question_ids?.length || 0)}
                {" | "}Duration: {t.duration_minutes} min
              </p>
              <p className="text-xs text-gray-400">
                Updated: {new Date(t.updated_at || t.created_at).toLocaleString()}
              </p>
            </div>

            <div className="text-sm text-right space-y-1">
              <span className="px-2 py-1 bg-green-100 rounded block">
                {t.status}
              </span>
              <div>📩 {t.invites} Invites</div>
              <div>📊 {t.reports} Reports</div>

              <div className="flex gap-2 mt-2 justify-end">
                <button
                  onClick={() => navigate(`/my-questions/${t.id}`)}
                  className="text-blue-600 underline text-sm"
                >
                  Edit Test
                </button>
                <button
                  onClick={() => navigate(`/view-questions/${t.id}`)}
                  className="text-purple-600 underline text-sm"
                >
                  View Questions
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {open && (
        <CreateTestModal
          onClose={(created) => {
            setOpen(false);
            if (created) {
              fetchTests();
              showSuccess("Test created successfully");
            }
          }}
        />
      )}
    </div>
  );
}
