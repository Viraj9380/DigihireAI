import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import ViewQuestionsPage from "./ViewQuestionsPage";

const API = "http://localhost:8000";

export default function TestDetailsPage() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("questions");
  const [invites, setInvites] = useState([]);
  const [test, setTest] = useState(null);

  useEffect(() => {
    loadTest();
    loadInvites();
  }, []);

  const loadTest = async () => {
    const res = await axios.get(`${API}/coding/tests`);
    setTest(res.data.find(t => t.id === testId));
  };

  const loadInvites = async () => {
    const res = await axios.get(`${API}/coding/tests/${testId}/invites`);
    setInvites(res.data);
  };

  if (!test) return null;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">{test.title}</h1>

      {/* Tabs */}
      <div className="flex gap-6 border-b mb-6">
        {["questions", "invite", "settings"].map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`pb-2 capitalize ${
              activeTab === tab
                ? "border-b-2 border-blue-600 font-semibold"
                : "text-gray-500"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* QUESTIONS */}
      {activeTab === "questions" && (
        <>
          <button
            onClick={() => navigate(`/my-questions/${testId}`)}
            className="mb-4 bg-blue-600 text-white px-4 py-2 rounded"
          >
            + Add Question
          </button>

          <ViewQuestionsPage />
        </>
      )}

      {/* INVITES */}
{activeTab === "invite" && (
  <div>
    <button
      onClick={() => navigate(`/invite/${testId}`)}
      className="mb-4 bg-orange-500 text-white px-4 py-2 rounded"
    >
      Invite Candidate
    </button>

    <table className="w-full border text-sm">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2 text-left">Email</th>
          <th className="p-2 text-left">Submitted At</th>
          <th className="p-2 text-left">Access Time</th>
          <th className="p-2 text-left">Proctoring</th>
        </tr>
      </thead>

      <tbody>
        {invites.map((i, idx) => (
          <tr key={idx} className="border-t">
            <td className="p-2">{i.email}</td>

            <td className="p-2">
              {i.submitted_at
                ? new Date(i.submitted_at).toLocaleString()
                : "-"}
            </td>

            <td className="p-2">{i.access_time}</td>

            <td className="p-2">
              {i.proctoring ? "Yes" : "No"}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}


      {/* SETTINGS */}
      {activeTab === "settings" && (
        <div className="space-y-4 max-w-lg">
          <input
            className="border p-2 w-full"
            value={test.title}
            onChange={e => setTest({ ...test, title: e.target.value })}
          />

          <input
            type="number"
            className="border p-2 w-full"
            value={test.duration_minutes}
            onChange={e =>
              setTest({ ...test, duration_minutes: Number(e.target.value) })
            }
          />

          <button
            onClick={async () => {
              await axios.put(`${API}/coding/tests/${testId}`, test);
              alert("Settings saved");
            }}
            className="bg-green-600 text-white px-4 py-2 rounded"
          >
            Save Settings
          </button>
        </div>
      )}
    </div>
  );
}
