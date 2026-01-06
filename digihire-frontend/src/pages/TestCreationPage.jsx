// src/pages/TestCreationPage.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import CreateTestModal from "../components/CreateTestModal";
import InviteModal from "../components/InviteModal";
import AddQuestionsModal from "../components/AddQuestionsModal";
// NEW imports
import MyQuestionsModal from "../components/MyQuestionsModal";
import DigiHireQuestionsModal from "../components/DigiHireQuestionsModal";
import ReportsTab from "../components/ReportsTab";
import TestAnalytics from "../components/TestAnalytics";


const API = "http://localhost:8000";

export default function TestCreationPage() {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("tests");
  const [tests, setTests] = useState([]);
  const [selectedTest, setSelectedTest] = useState(null);
  const [detailTab, setDetailTab] = useState("questions");
  // NEW state
  const [showMyQuestions, setShowMyQuestions] = useState(false);
  const [showDigiHireQuestions, setShowDigiHireQuestions] = useState(false);


  const [openCreate, setOpenCreate] = useState(false);
  const [inviteTest, setInviteTest] = useState(null);

  const [selectedQuestions, setSelectedQuestions] = useState([]);
  const [questions, setQuestions] = useState([]);

  // 🔹 NEW
  const [showAddModal, setShowAddModal] = useState(false);

  const fetchTests = async () => {
    const res = await axios.get(`${API}/coding/tests`);
    setTests(res.data);
  };

  useEffect(() => {
    fetchTests();
  }, []);

  useEffect(() => {
    if (!selectedTest) return;

    const loadQuestions = async () => {
      const testRes = await axios.get(`${API}/coding/tests`);
      const test = testRes.data.find((t) => t.id === selectedTest.id);

      if (!test) {
        setQuestions([]);
        return;
      }

      const qRes = await axios.get(`${API}/coding/questions`);
      const allIds = [
        ...(test.coding_question_ids || []),
        ...(test.mcq_question_ids || []),
      ];

      const matched = qRes.data.filter((q) => allIds.includes(q.id));

      setQuestions(matched);
      setSelectedQuestions([]);
    };

    loadQuestions();
  }, [selectedTest]);

  const saveSettings = async () => {
    await axios.put(`${API}/coding/tests/${selectedTest.id}`, selectedTest);
    fetchTests();
    alert("Settings saved");
  };

  if (activeTab === "questions") {
    navigate("/my-questions");
    return null;
  }

  /* ================= SELECTED TEST VIEW ================= */

  if (selectedTest) {
    const toggleQuestion = (id) => {
      setSelectedQuestions((prev) =>
        prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
      );
    };

    const selectAll = () => {
      setSelectedQuestions(questions.map((q) => q.id));
    };

    const deleteSelected = async () => {
      if (selectedQuestions.length === 0) return;

      await axios.post(
        `${API}/coding/tests/${selectedTest.id}/remove-questions`,
        selectedQuestions
      );

      const updated = await axios.get(`${API}/coding/tests`);
      const refreshed = updated.data.find(
        (t) => t.id === selectedTest.id
      );

      setSelectedTest(refreshed);
    };

    // REPLACE this function
const handleProceedAddQuestions = ({ library }) => {
  setShowAddModal(false);

  if (library === "myQuestions") {
    setShowMyQuestions(true);
  } else {
    setShowDigiHireQuestions(true);
  }
};


    return (
      <div className="p-6">
        <button
          onClick={() => setSelectedTest(null)}
          className="text-sm text-blue-600 mb-4"
        >
          ← Back to My Tests
        </button>

        <h1 className="text-2xl font-bold mb-4">
          {selectedTest.title}
        </h1>

        <div className="flex gap-6 border-b mb-6">
  {["questions", "invite", "reports", "analytics", "settings"].map((t) => (
    <button
      key={t}
      onClick={() => setDetailTab(t)}
      className={`pb-2 capitalize ${
        detailTab === t
          ? "border-b-2 border-blue-600 font-semibold"
          : "text-gray-500"
      }`}
    >
      {t}
    </button>
  ))}
</div>

        {detailTab === "questions" && (
          <div>
            <div className="flex justify-end gap-3 mb-4">
              <button
                onClick={selectAll}
                className="border px-3 py-1 rounded text-sm"
              >
                Select All
              </button>

              <button
                onClick={deleteSelected}
                className="border px-3 py-1 rounded text-sm text-red-600"
              >
                Delete Question
              </button>

              <button
                onClick={() => setShowAddModal(true)}
                className="bg-orange-500 text-white px-4 py-1 rounded text-sm"
              >
                Add Question
              </button>
            </div>

            {questions.length === 0 && (
              <p className="p-4 text-gray-500 text-sm">
                No questions added yet.
              </p>
            )}

            {questions.map((q) => (
              <div
                key={q.id}
                className="border p-4 rounded mb-3 flex gap-3"
              >
                <input
                  type="checkbox"
                  checked={selectedQuestions.includes(q.id)}
                  onChange={() => toggleQuestion(q.id)}
                />

                <div>
                  <h3 className="font-semibold">{q.title}</h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {q.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}

        {detailTab === "invite" && (
          <div>
            <button
              onClick={() => setInviteTest(selectedTest)}
              className="bg-indigo-600 text-white px-4 py-2 rounded mb-4"
            >
              Invite Candidate
            </button>

            <InviteList testId={selectedTest.id} />
          </div>
        )}

        {detailTab === "settings" && (
          <div className="space-y-3 max-w-md">
            <input
              className="border p-2 w-full"
              value={selectedTest.title}
              onChange={(e) =>
                setSelectedTest({
                  ...selectedTest,
                  title: e.target.value,
                })
              }
            />

            <input
              type="number"
              className="border p-2 w-full"
              value={selectedTest.duration_minutes}
              onChange={(e) =>
                setSelectedTest({
                  ...selectedTest,
                  duration_minutes: Number(e.target.value),
                })
              }
            />

            <SettingRadio
              label="Allow Copy/Paste"
              value={selectedTest.allow_copy_paste}
              onChange={(v) =>
                setSelectedTest({ ...selectedTest, allow_copy_paste: v })
              }
            />

            <SettingRadio
              label="Terminate on Violation"
              value={selectedTest.terminate_on_violation}
              onChange={(v) =>
                setSelectedTest({
                  ...selectedTest,
                  terminate_on_violation: v,
                })
              }
            />

            <SettingRadio
              label="Shuffle Questions"
              value={selectedTest.shuffle_questions}
              onChange={(v) =>
                setSelectedTest({
                  ...selectedTest,
                  shuffle_questions: v,
                })
              }
            />

            <button
              onClick={saveSettings}
              className="bg-blue-600 text-white px-4 py-2 rounded"
            >
              Save Settings
            </button>
          </div>
        )}

        {detailTab === "reports" && (
  <ReportsTab testId={selectedTest.id} />
)}

{detailTab === "analytics" && (
  <TestAnalytics testId={selectedTest.id} />
)}

        {inviteTest && (
          <InviteModal
            test={inviteTest}
            onClose={() => setInviteTest(null)}
          />
        )}

        {showAddModal && (
          <AddQuestionsModal
            onClose={() => setShowAddModal(false)}
            onProceed={handleProceedAddQuestions}
          />
        )}

        
{showMyQuestions && (
  <MyQuestionsModal
    testId={selectedTest.id}
    onClose={() => {
      setShowMyQuestions(false);
      // auto refresh questions
      setSelectedTest({ ...selectedTest });
    }}
  />
)}

{showDigiHireQuestions && (
  <DigiHireQuestionsModal
    testId={selectedTest.id}
    onClose={() => {
      setShowDigiHireQuestions(false);
      // auto refresh questions
      setSelectedTest({ ...selectedTest });
    }}
  />
)}

      </div>
    );
  }

  /* ================= MAIN TEST LIST ================= */

  return (
    <div className="p-6">
      <div className="flex gap-6 mb-6 border-b">
        <button className="pb-2 border-b-2 border-blue-600 font-semibold">
          My Tests
        </button>

        <button
          onClick={() => setActiveTab("questions")}
          className="pb-2 text-gray-500"
        >
          My Questions
        </button>
      </div>

      <div className="flex justify-between mb-6">
        <h1 className="text-2xl font-bold">My Tests</h1>

        <button
          onClick={() => setOpenCreate(true)}
          className="bg-orange-500 text-white px-4 py-2 rounded"
        >
          Create New Test
        </button>
      </div>

      {tests.map((t) => (
        <div
          key={t.id}
          className="border p-4 rounded mb-3 cursor-pointer hover:bg-gray-50"
          onClick={() => setSelectedTest(t)}
        >
          <h2 className="font-semibold">{t.title}</h2>

          <p className="text-sm text-gray-500">
            Questions:{" "}
            {(t.coding_question_ids?.length || 0) +
              (t.mcq_question_ids?.length || 0)}
            {" | "}Duration: {t.duration_minutes} min
          </p>

          <p className="text-sm">
            📩 {t.invites || 0} Invites | 📊 {t.reports} Reports
          </p>
        </div>
      ))}

      {openCreate && (
        <CreateTestModal
          onClose={(created) => {
            setOpenCreate(false);
            if (created) fetchTests();
          }}
        />
      )}
    </div>
  );
}

/* ===================== HELPERS ===================== */

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

function InviteList({ testId }) {
  const [rows, setRows] = useState([]);

  useEffect(() => {
    axios
      .get(`${API}/coding/tests/${testId}/invites`)
      .then((res) => setRows(res.data));
  }, [testId]);

  return (
    <table className="w-full border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2">Candidate Email</th>
          <th>Submitted At</th>
          <th>Access Time</th>
          <th>Proctoring</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t">
            <td className="p-2">{r.email}</td>
            <td>{r.submitted_at || "-"}</td>
            <td>{r.access_time}</td>
            <td>{r.proctoring ? "Yes" : "No"}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}