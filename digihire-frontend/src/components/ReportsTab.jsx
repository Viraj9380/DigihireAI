// src/components/ReportsTab.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Download, Flag } from "lucide-react";

const API = "http://localhost:8000";

/* ================= VIOLATION HELPERS ================= */

function getViolationColor(total) {
  if (total >= 5) return "text-red-600";
  if (total >= 3) return "text-yellow-500";
  return "text-green-600";
}

function ViolationFlag({ total }) {
  return <Flag size={16} className={getViolationColor(total)} />;
}

export default function ReportsTab({ testId }) {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/coding/tests/${testId}/reports`)
      .then((res) => setReports(res.data || []))
      .finally(() => setLoading(false));
  }, [testId]);

  const downloadReport = (evaluationId) => {
    window.open(`${API}/reports/${evaluationId}/download`, "_blank");
  };

  if (loading) {
    return <p className="text-sm text-gray-500">Loading reports...</p>;
  }

  if (reports.length === 0) {
    return <p className="text-sm text-gray-500">No reports generated yet.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full border rounded-lg text-sm">
        <thead className="bg-gray-100">
          <tr>
            <th className="p-3 text-left">Candidate Name & Email</th>
            <th className="p-3 text-left">Score</th>
            <th className="p-3 text-left">Test Status</th>
            <th className="p-3 text-left">Proctoring</th>

            {/* 🔴 NEW: VIOLATIONS HEADER */}
            <th className="p-3 text-center relative group">
              <div className="inline-flex items-center gap-1 cursor-default">
                <Flag size={16} />
                Violations
              </div>

              {/* Hover-only tooltip */}
              <div className="absolute hidden group-hover:block bg-white border rounded shadow-md p-3 text-xs w-64 top-10 left-1/2 -translate-x-1/2 z-10">
                <div className="font-semibold mb-2">Violations</div>
                <div className="flex items-center gap-2 mb-1">
                  <Flag size={12} className="text-red-600" />
                  5+ consecutive violation warnings
                </div>
                <div className="flex items-center gap-2 mb-1">
                  <Flag size={12} className="text-yellow-500" />
                  3–5 consecutive violation warnings
                </div>
                <div className="flex items-center gap-2">
                  <Flag size={12} className="text-green-600" />
                  0–2 consecutive violation warnings
                </div>
              </div>
            </th>

            <th className="p-3 text-left">Appeared On</th>
            <th className="p-3 text-center">Actions</th>
          </tr>
        </thead>

        <tbody>
          {reports.map((r) => (
            <tr
              key={r.evaluation_id}
              className="border-t hover:bg-gray-50"
            >
              <td className="p-3">
                <div className="font-medium">{r.name}</div>
                <div className="text-gray-500">{r.email}</div>
              </td>

              <td className="p-3">
                <div className="font-semibold">
                  {r.score?.raw} ({r.score?.percentage}%)
                </div>
              </td>

              <td className="p-3 text-green-600 font-medium">
                {r.status}
              </td>

              <td className="p-3">{r.proctoring}</td>

              {/* 🔴 NEW: VIOLATION FLAG */}
              <td className="p-3 text-center">
                <ViolationFlag total={r.violations?.total || 0} />
              </td>

              <td className="p-3">
                <div className="font-medium">
                  {formatDate(r.appeared_on)}
                </div>
                <div className="text-xs text-gray-500">
                  {formatTime(r.appeared_on)}
                </div>
              </td>

              <td className="p-3 text-center">
                <button
                  onClick={() => downloadReport(r.evaluation_id)}
                  className="inline-flex items-center gap-1 text-blue-600 hover:underline"
                >
                  <Download size={16} />
                  Report
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ================= HELPERS ================= */

function formatDate(dt) {
  return new Date(dt).toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dt) {
  return new Date(dt).toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  });
}
