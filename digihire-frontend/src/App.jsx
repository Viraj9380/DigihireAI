// src/App.jsx
import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import CandidatesPage from "./pages/CandidatesPage";
import AssessmentsPage from "./pages/AssessmentsPage";
import VendorsPage from "./pages/VendorsPage"; // keep friend’s import
import CodingTestPage from "./pages/CodingTestPage";
import CodingQuestionCreatePage from "./pages/CodingQuestionCreatePage";
import CodingQuestionListPage from "./pages/CodingQuestionListPage";
import CodingQuestionSolvePage from "./pages/CodingQuestionSolvePage";
import MyQuestionsPage from "./pages/MyQuestionsPage";
import TestCreationPage from "./pages/TestCreationPage";
import ViewQuestionsPage from "./pages/ViewQuestionsPage";

import "./styles/app.css";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <main className="max-w-6xl mx-auto p-4">
        <Routes>
          {/* ================= BASIC ================= */}
          <Route path="/" element={<Navigate to="/assessments" replace />} />
          <Route path="/login" element={<Login />} />

          {/* ================= CORE PAGES ================= */}
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/assessments" element={<AssessmentsPage />} />

          {/* ================= TEST CREATION ================= */}
          <Route path="/tests" element={<TestCreationPage />} />
          <Route path="/my-questions/:testId" element={<MyQuestionsPage />} />
          <Route path="/view-questions/:testId" element={<ViewQuestionsPage />} />

          {/* ================= CODING ================= */}
          <Route path="/coding/questions" element={<CodingQuestionListPage />} />
          <Route path="/coding/questions/new" element={<CodingQuestionCreatePage />} />
          <Route
            path="/coding/questions/:questionId/solve"
            element={<CodingQuestionSolvePage />}
          />
          <Route path="/coding-test/:questionId" element={<CodingTestPage />} />

          {/* ================= VENDORS ================= */}
          <Route path="/vendor/:assessmentId" element={<VendorsPage />} />

          {/* ================= FALLBACK ================= */}
          <Route
            path="*"
            element={
              <div className="py-20 text-center text-gray-600">
                Page not found
              </div>
            }
          />
        </Routes>
      </main>
    </div>
  );
}
