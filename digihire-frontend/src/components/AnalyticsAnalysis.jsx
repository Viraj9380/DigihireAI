//src/components/AnalyticsAnalysis.jsx
import React, { useEffect, useState } from "react"; 
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Eye, X } from "lucide-react";

const API = "http://localhost:8000";

const LEVEL_COLORS = {
  Beginner: "#ef4444",
  Intermediate: "#f59e0b",
  Experienced: "#3b82f6",
  Proficient: "#10b981"
};

export default function AnalyticsAnalysis({ testId }) {
  const [data, setData] = useState(null);
  const [showSnapshots, setShowSnapshots] = useState(false);

  useEffect(() => {
    axios
      .get(`${API}/coding/tests/${testId}/analytics`)
      .then(res => setData(res.data))
      .catch(() => setData(null));
  }, [testId]);

  if (!data) {
    return <p className="text-sm text-gray-500">Loading analytics…</p>;
  }

  const score = Math.round(data.avg_score || 0);
  const scoreLevel =
    score <= 25 ? "Beginner" :
    score <= 50 ? "Intermediate" :
    score <= 75 ? "Experienced" :
    "Proficient";

  const gaugeData = [{ value: score }, { value: 100 - score }];

  /* ================= FIXED SECTION ANALYSIS ================= */
  const sectionData = Object.entries(data.section_analysis || {}).map(
    ([name, scores]) => {
      const max = scores.reduce(
        (sum, s) => sum + (s === 5 ? 5 : 15),
        0
      );

      return {
        name,
        score: max === 0
          ? 0
          : Math.round(
              (scores.reduce((a, b) => a + b, 0) / max) * 100
            )
      };
    }
  );

  /* ================= FIXED SKILL ANALYSIS ================= */
  const skillData = Object.entries(data.skill_analysis || {}).map(
    ([skill, scores]) => {
      const max = scores.reduce(
        (sum, s) => sum + (s === 5 ? 5 : 15),
        0
      );

      return {
        skill,
        value: max === 0
          ? 0
          : Math.round(
              (scores.reduce((a, b) => a + b, 0) / max) * 100
            )
      };
    }
  );

  const difficultyData = Object.entries(data.difficulty_analysis || {}).map(
    ([level, obj]) => ({
      level,
      accuracy: obj.percentage || 0
    })
  );

  const proctoring = data.proctoring || {};
  const snapshots = proctoring.snapshots || [];
  const testLog = data.test_log || {};

  return (
    <div className="space-y-10">

      {/* SCORE */}
      <Card title="Score Analysis">
        <div className="grid grid-cols-2 gap-6 items-center">
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie
                data={gaugeData}
                startAngle={180}
                endAngle={0}
                innerRadius={70}
                outerRadius={100}
                dataKey="value"
              >
                <Cell fill={LEVEL_COLORS[scoreLevel]} />
                <Cell fill="#e5e7eb" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>

          <div>
            <p className="text-3xl font-bold">{score}%</p>
            <p className="text-sm text-gray-600">{scoreLevel}</p>
            <p className="text-xs text-gray-500 mt-1">
              Avg Time: {data.avg_time}s
            </p>
            <p className="text-xs text-gray-500">
              Integrity Score: {data.integrity_score}%
            </p>
          </div>
        </div>
      </Card>

      <ChartCard title="Section Analysis">
        <BarChart data={sectionData}>
          <XAxis dataKey="name" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="score" fill="#6366f1" />
        </BarChart>
      </ChartCard>

      <ChartCard title="Skill Analysis">
        <RadarChart data={skillData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" />
          <Radar dataKey="value" fill="#22c55e" fillOpacity={0.6} />
        </RadarChart>
      </ChartCard>

      <ChartCard title="Difficulty Analysis">
        <BarChart data={difficultyData}>
          <XAxis dataKey="level" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="accuracy" fill="#f97316" />
        </BarChart>
      </ChartCard>

      <Card title="Proctoring Analysis">
        <div className="flex justify-between">
          <div className="text-sm space-y-1">
            <p><b>Snapshots:</b> {snapshots.length}</p>
            <p><b>Window Violations:</b> {proctoring.window_violations || 0}</p>
            <p><b>Time Violations:</b> {proctoring.time_violations || 0}</p>
          </div>

          {snapshots.length > 0 && (
            <button
              className="flex items-center gap-1 text-blue-600"
              onClick={() => setShowSnapshots(true)}
            >
              <Eye size={16} /> View
            </button>
          )}
        </div>
      </Card>

      <Card title="Test Log">
        <table className="w-full text-sm border">
          <tbody>
            <tr className="border-t">
              <td className="p-2 font-medium">Appeared On</td>
              <td className="p-2">{formatDate(testLog.appeared_on)}</td>
            </tr>
            <tr className="border-t">
              <td className="p-2 font-medium">Completed On</td>
              <td className="p-2">{formatDate(testLog.completed_on)}</td>
            </tr>
          </tbody>
        </table>
      </Card>

      {showSnapshots && (
        <SnapshotDialog
          snapshots={snapshots}
          onClose={() => setShowSnapshots(false)}
        />
      )}
    </div>
  );
}

/* ================= SNAPSHOT DIALOG (FULLSCREEN) ================= */
function SnapshotDialog({ snapshots, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50">
      <div className="absolute inset-0 flex flex-col bg-white">

        <div className="flex items-center justify-between px-6 py-4 border-b">
          <h3 className="text-lg font-semibold">
            Proctoring Snapshots ({snapshots.length})
          </h3>
          <button onClick={onClose}>
            <X size={22} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {snapshots.map((s, i) => (
              <div key={i} className="border rounded-lg overflow-hidden">
                <div className="p-3 text-sm bg-gray-50">
                  <div className="font-medium">{s.type}</div>
                  <div className="text-xs text-gray-500">
                    {new Date(s.timestamp).toLocaleString()}
                  </div>
                </div>

                {s.image?.startsWith("data:image") ? (
                  <img
                    src={s.image}
                    alt="Proctoring Snapshot"
                    className="w-full h-[260px] object-contain bg-black"
                  />
                ) : (
                  <div className="h-[260px] flex items-center justify-center text-gray-500">
                    Snapshot unavailable
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}

/* ================= UI HELPERS ================= */
function Card({ title, children }) {
  return (
    <div className="bg-white border rounded p-6">
      <h3 className="font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function ChartCard({ title, children }) {
  return (
    <div className="bg-white border rounded p-4">
      <h3 className="font-semibold mb-3">{title}</h3>
      <ResponsiveContainer width="100%" height={260}>
        {children}
      </ResponsiveContainer>
    </div>
  );
}

function formatDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-GB");
}
