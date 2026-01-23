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

import McqQuestionsTab from "../components/McqQuestionsTab";
import AddMcqSourceModal from "../components/AddMcqSourceModal";
import MyMcqQuestionsModal from "../components/MyMcqQuestionsModal";
import DigiHireMcqQuestionsModal from "../components/DigiHireMcqQuestionsModal";



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


  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [selectedMcqs, setSelectedMcqs] = useState([]);

  const [showAddMcqSource, setShowAddMcqSource] = useState(false);
  const [showMyMcqs, setShowMyMcqs] = useState(false);
  const [showDigiHireMcqs, setShowDigiHireMcqs] = useState(false);


  const computeDuration = (test, codingQs = [], mcqQs = []) => {
  if (!codingQs.length && !mcqQs.length) return 0;

  const mcqMinutes = mcqQs.length * (test.mcq_time_minutes || 1);


  const config = test.coding_time_config || {
    Easy: 10,
    Medium: 15,
    Hard: 20
  };

  const codingMinutes = codingQs.reduce(
    (sum, q) => sum + (config[q.difficulty] || 15),
    0
  );

  return mcqMinutes + codingMinutes;
};



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

  useEffect(() => {
  if (!selectedTest || detailTab !== "mcq") return;

  const loadMcqs = async () => {
    const [testRes, mcqRes] = await Promise.all([
      
      axios.get(`${API}/coding/tests/${selectedTest.id}`),
      axios.get(`${API}/mcq/questions`)
    ]);

    const test = testRes.data;

    setMcqQuestions(
      mcqRes.data.filter(q =>
        test.mcq_question_ids?.includes(q.id)
      )
    );
    setSelectedMcqs([]);
  };

  loadMcqs();
}, [detailTab, selectedTest]);


  const saveSettings = async () => {
  const res = await axios.put(
    `${API}/coding/tests/${selectedTest.id}`,
    selectedTest
  );

  // 🔥 IMPORTANT: refresh selectedTest from backend
  setSelectedTest(res.data);

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
  {["questions", "mcq", "invite", "reports", "analytics", "settings"].map((t) => (
    <button
      key={t}
      onClick={() => setDetailTab(t)}
      className={`pb-2 capitalize ${
        detailTab === t
          ? "border-b-2 border-blue-600 font-semibold"
          : "text-gray-500"
      }`}
    >
      {t === "mcq" ? "MCQ Questions" : t}
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

        {detailTab === "mcq" && (
  <McqQuestionsTab
    selectedTest={selectedTest}
    mcqQuestions={mcqQuestions}
    setMcqQuestions={setMcqQuestions}
    selectedMcqs={selectedMcqs}
    setSelectedMcqs={setSelectedMcqs}
    onAddClick={() => setShowAddMcqSource(true)}
  />
)}


        {detailTab === "invite" && (
  <div>
    <button
      onClick={() => setInviteTest({ test: selectedTest, mode: "invite" })}
      className="bg-indigo-600 text-white px-4 py-2 rounded mb-4"
    >
      Invite Candidate
    </button>

    <InviteList
      testId={selectedTest.id}
      onReinvite={(email) =>
        setInviteTest({
          test: selectedTest,
          mode: "reinvite",
          email,
        })
      }
    />
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

            <div className="border rounded p-4 space-y-3">
  <h3 className="font-semibold">Coding Question Timing (minutes)</h3>

  {["Easy", "Medium", "Hard"].map(level => (
    <div key={level} className="flex justify-between items-center">
      <span>{level}</span>
      <input
        type="number"
        className="border p-1 w-20"
        value={selectedTest.coding_time_config?.[level] ?? (
          level === "Easy" ? 10 : level === "Medium" ? 15 : 20
        )}
        onChange={e =>
          setSelectedTest({
            ...selectedTest,
            coding_time_config: {
              ...selectedTest.coding_time_config,
              [level]: Number(e.target.value)
            }
          })
        }
      />
    </div>
  ))}
</div>
            <div className="border rounded p-4 space-y-2">
  <h3 className="font-semibold">MCQ Timing</h3>

  <div className="flex justify-between items-center">
    <span>Time per MCQ (minutes)</span>
    <input
      type="number"
      min={1}
      className="border p-1 w-20"
      value={selectedTest.mcq_time_minutes ?? 1}
      onChange={(e) =>
        setSelectedTest({
          ...selectedTest,
          mcq_time_minutes: Number(e.target.value)
        })
      }
    />
  </div>
</div>



            

            

            <div className="border rounded p-4 space-y-3">
  <p className="font-medium">Terminate on Violation</p>

  <label className="mr-4">
    <input
      type="radio"
      checked={selectedTest.terminate_on_violation === true}
      onChange={() =>
        setSelectedTest({
          ...selectedTest,
          terminate_on_violation: true,
          max_violations: selectedTest.max_violations ?? 1
        })
      }
    />{" "}
    Yes
  </label>

  <label>
    <input
      type="radio"
      checked={selectedTest.terminate_on_violation === false}
      onChange={() =>
        setSelectedTest({
          ...selectedTest,
          terminate_on_violation: false,
          max_violations: null
        })
      }
    />{" "}
    No
  </label>

  {/* 🔥 SHOW ONLY WHEN YES */}
  {selectedTest.terminate_on_violation && (
    <div className="mt-3">
      <label className="text-sm text-gray-700 block mb-1">
        Number of violations after which test should terminate
      </label>

      <input
        type="number"
        min={1}
        className="border p-2 w-32"
        value={selectedTest.max_violations ?? 1}
        onChange={(e) =>
          setSelectedTest({
            ...selectedTest,
            max_violations: Number(e.target.value)
          })
        }
      />
    </div>
  )}
</div>

            <SettingRadio
              label="Allow Copy/Paste"
              value={selectedTest.allow_copy_paste}
              onChange={(v) =>
                setSelectedTest({ ...selectedTest, allow_copy_paste: v })
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
    test={inviteTest.test}
    mode={inviteTest.mode}
    presetEmail={inviteTest.email}
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


{showAddMcqSource && (
  <AddMcqSourceModal
    onClose={() => setShowAddMcqSource(false)}
    onMyMcqs={() => {
      setShowAddMcqSource(false);
      setShowMyMcqs(true);
    }}
    onDigiHire={() => {
      setShowAddMcqSource(false);
      setShowDigiHireMcqs(true);
    }}
  />
)}

{showMyMcqs && (
  <MyMcqQuestionsModal
    testId={selectedTest.id}
    onClose={() => setShowMyMcqs(false)}
    onAdded={() => setDetailTab("mcq")}
  />
)}

{showDigiHireMcqs && (
  <DigiHireMcqQuestionsModal
    testId={selectedTest.id}
    onClose={() => setShowDigiHireMcqs(false)}
    onAdded={() => setDetailTab("mcq")}
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
  {" | "}
  Duration:{" "}
  {(
    (t.mcq_question_ids?.length || 0) * (t.mcq_time_minutes || 1) +   
    (t.coding_question_ids?.length || 0) * 15 // avg coding time
  )} min
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

function InviteList({ testId, onReinvite }) {
  const [rows, setRows] = useState([]);

  const load = () => {
    axios
      .get(`${API}/coding/tests/${testId}/invites`)
      .then((res) => setRows(res.data));
  };

  useEffect(load, [testId]);

  return (
    <table className="w-full border">
      <thead className="bg-gray-100">
        <tr>
          <th className="p-2">Candidate Email</th>
          <th>Submitted At</th>
          <th>Access Time</th>
          <th>Proctoring</th>
          <th>Reinvite</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r, i) => (
          <tr key={i} className="border-t">
            <td className="p-2">{r.email}</td>
            <td>{r.submitted_at || "-"}</td>
            <td>{r.access_time}</td>
            <td>{r.proctoring ? "Yes" : "No"}</td>
            <td className="text-center">
              <button
                onClick={() => onReinvite(r.email)}
                className="text-blue-600 underline text-sm"
              >
                Reinvite
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

