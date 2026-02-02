import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import MyMcqQuestionsModal from "../components/MyMcqQuestionsModal";
import MyCodingQuestionsModal from "../components/MyCodingQuestionsModal";

export default function MyQuestionsPage({ testId: propTestId, isModal }) {
  const params = useParams();
  const testId = propTestId || params.testId;

  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState("questions");
  const [showMcqModal, setShowMcqModal] = useState(false);
  const [showCodingModal, setShowCodingModal] = useState(false);

  return (
    <div className="p-6">
      {!isModal && (
        <h1 className="text-2xl font-bold mb-4">My Questions</h1>
      )}

      {/* TABS */}
      <div className="flex gap-6 border-b mb-6">
        <button
          onClick={() => setActiveTab("questions")}
          className={`pb-2 ${
            activeTab === "questions"
              ? "border-b-2 border-blue-600 font-semibold"
              : "text-gray-500"
          }`}
        >
          Questions
        </button>

        <button
          onClick={() => setActiveTab("mcq")}
          className={`pb-2 ${
            activeTab === "mcq"
              ? "border-b-2 border-blue-600 font-semibold"
              : "text-gray-500"
          }`}
        >
          MCQ Questions
        </button>

        <button
          onClick={() => setActiveTab("banks")}
          className={`pb-2 ${
            activeTab === "banks"
              ? "border-b-2 border-blue-600 font-semibold"
              : "text-gray-500"
          }`}
        >
          Manage Question Banks
        </button>
      </div>

      {/* CONTENT */}
      {activeTab === "questions" && (
        <>
          <div
            onClick={() => setShowCodingModal(true)}
            className="p-8 border rounded cursor-pointer text-center hover:bg-gray-50 transition"
          >
            <h3 className="text-lg font-semibold mb-2">
              Manage Coding Questions
            </h3>
            <p className="text-gray-500 text-sm">
              Click to add, view, and manage coding questions for this test
            </p>
          </div>

          {showCodingModal && (
            <MyCodingQuestionsModal
              testId={testId}
              onClose={() => setShowCodingModal(false)}
            />
          )}
        </>
      )}

      {activeTab === "mcq" && (
        <>
          <div
            onClick={() => setShowMcqModal(true)}
            className="p-8 border rounded cursor-pointer text-center hover:bg-gray-50 transition"
          >
            <h3 className="text-lg font-semibold mb-2">
              Manage MCQ Questions
            </h3>
            <p className="text-gray-500 text-sm">
              Click to add, view, and manage MCQ questions for this test
            </p>
          </div>

          {showMcqModal && (
            <MyMcqQuestionsModal
              testId={testId}
              onClose={() => setShowMcqModal(false)}
            />
          )}
        </>
      )}

      {activeTab === "banks" && (
        <div className="p-6 border rounded text-center">
          <p className="mb-4 text-gray-600">
            Manage and organize your Question Banks here.
          </p>
          <button
            onClick={() => navigate("/question-banks")}
            className="border px-4 py-2 rounded hover:bg-gray-50"
          >
            Go to Question Banks
          </button>
        </div>
      )}
    </div>
  );
}
