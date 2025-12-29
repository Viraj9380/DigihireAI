// src/pages/TestCreationPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CreateTestModal from "../components/CreateTestModal";
import InviteModal from "../components/InviteModal";

const API = "http://localhost:8000";

export default function TestCreationPage() {
  const [tests, setTests] = useState([]);
  const [open, setOpen] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [settingsTest, setSettingsTest] = useState(null);
  const [inviteTest, setInviteTest] = useState(null);

  const navigate = useNavigate();

  const fetchTests = async () => {
    const res = await axios.get(`${API}/coding/tests`);
    setTests(res.data);
  };

  useEffect(() => {
    fetchTests();
  }, []);

  /* ✅ FIX: PATCH → PUT */
  const saveSettings = async () => {
    await axios.put(
      `${API}/coding/tests/${settingsTest.id}`,
      settingsTest
    );
    setSettingsTest(null);
    fetchTests();
  };

  

  
  const showSuccess = (msg) => {
    setSuccessMsg(msg);
    setTimeout(() => setSuccessMsg(""), 3000);
  };

  return (
    <div className="p-6">
      {/* HEADER */}
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

      {/* TEST LIST */}
      <div className="space-y-4">
        {tests.map((t) => (
          <div
            key={t.id}
            className="border p-4 rounded flex justify-between items-center"
          >
            <div>
              <h2 className="text-lg font-semibold">{t.title}</h2>

              <p className="text-sm text-gray-500">
                Questions:{" "}
                {(t.coding_question_ids?.length || 0) +
                  (t.mcq_question_ids?.length || 0)}
                {" | "}
                Duration: {t.duration_minutes} min
              </p>

              <p className="text-xs text-gray-400">
                Updated:{" "}
                {new Date(
                  t.updated_at || t.created_at
                ).toLocaleString()}
              </p>
            </div>

            <div className="text-sm text-right space-y-1">
              <span className="px-2 py-1 bg-green-100 rounded block">
                {t.status}
              </span>

              <div>📩 {t.invites || 0} Invites</div>
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

                
                <button
                  onClick={() => setInviteTest(t)}
                  className="bg-indigo-600 text-white px-3 py-1 rounded text-sm"
                >
                  Invite
                </button>


                <button
                  onClick={() => setSettingsTest({ ...t })}
                  className="text-gray-600 text-lg"
                >
                  ⚙️
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* SETTINGS MODAL */}
      {settingsTest && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 w-[520px] rounded space-y-3">
            <h2 className="text-xl font-bold">Test Settings</h2>

            <input
              className="border p-2 w-full"
              value={settingsTest.title}
              onChange={(e) =>
                setSettingsTest({
                  ...settingsTest,
                  title: e.target.value,
                })
              }
            />

            <input
              type="number"
              className="border p-2 w-full"
              value={settingsTest.duration_minutes}
              onChange={(e) =>
                setSettingsTest({
                  ...settingsTest,
                  duration_minutes: Number(e.target.value),
                })
              }
            />

            <SettingRadio
              label="Allow Copy/Paste"
              value={settingsTest.allow_copy_paste}
              onChange={(v) =>
                setSettingsTest({
                  ...settingsTest,
                  allow_copy_paste: v,
                })
              }
            />

            <SettingRadio
              label="Terminate Test on Window Violation"
              value={settingsTest.terminate_on_violation}
              onChange={(v) =>
                setSettingsTest({
                  ...settingsTest,
                  terminate_on_violation: v,
                })
              }
            />

            {settingsTest.terminate_on_violation && (
              <select
                className="border p-2 w-full"
                value={settingsTest.max_violations || 1}
                onChange={(e) =>
                  setSettingsTest({
                    ...settingsTest,
                    max_violations: Number(e.target.value),
                  })
                }
              >
                {[1, 2, 3, 4, 5].map((n) => (
                  <option key={n} value={n}>
                    Auto submit after {n} violations
                  </option>
                ))}
              </select>
            )}

            <SettingRadio
              label="Shuffle Questions"
              value={settingsTest.shuffle_questions}
              onChange={(v) =>
                setSettingsTest({
                  ...settingsTest,
                  shuffle_questions: v,
                })
              }
            />

            <div className="flex gap-3">
              <button
                onClick={() => setSettingsTest(null)}
                className="flex-1 bg-gray-400 text-white py-2 rounded"
              >
                Cancel
              </button>

              <button
                onClick={saveSettings}
                className="flex-1 bg-blue-600 text-white py-2 rounded"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      )}

      {inviteTest && (
  <InviteModal
    test={inviteTest}
    onClose={() => setInviteTest(null)}
  />
)}


      {/* CREATE TEST MODAL */}
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

function SettingRadio({ label, value, onChange }) {
  return (
    <div>
      <p className="font-medium">{label}</p>

      <label className="mr-4">
        <input
          type="radio"
          checked={value === true}
          onChange={() => onChange(true)}
        />{" "}
        Yes
      </label>

      <label>
        <input
          type="radio"
          checked={value === false}
          onChange={() => onChange(false)}
        />{" "}
        No
      </label>
    </div>
  );
}
