import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import CandidatesPage from "./pages/CandidatesPage";
import AssessmentsPage from "./pages/AssessmentsPage";
import VendorsPage from "./pages/VendorsPage";   // ✅ NEW IMPORT

// src/index.js (or src/App.jsx)
import "./styles/app.css";

export default function App() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />
      <main className="max-w-6xl mx-auto p-4">
        <Routes>
          <Route path="/" element={<Navigate to="/assessments" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/candidates" element={<CandidatesPage />} />
          <Route path="/assessments" element={<AssessmentsPage />} />

          {/* ✅ NEW ROUTE FOR VENDORS PAGE */}
          
          <Route path="/vendor/:assessmentId" element={<VendorsPage />} />
          {/* fallback */}
          <Route
            path="*"
            element={<div className="py-20 text-center">Page not found</div>}
          />
        </Routes>
      </main>
    </div>
  );
}
