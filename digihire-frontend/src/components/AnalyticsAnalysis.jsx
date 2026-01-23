import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer
} from "recharts";
import { Eye, X } from "lucide-react";

const API = "http://localhost:8000";

const STATUS_COLORS = {
  completed: "#22c55e",
  left: "#f59e0b",
  terminated: "#ef4444",
  suspended: "#a855f7"
};

const SKILL_COLORS = {
  Beginner: "#ef4444",
  Intermediate: "#f59e0b",
  Proficient: "#3b82f6",
  Advanced: "#10b981",
  Expert: "#16a34a"
};

export default function AnalyticsAnalysis({ testId }) {
  const [data, setData] = useState(null);
  const [showSnapshots, setShowSnapshots] = useState(false);

  useEffect(() => {
    axios
      .get(`${API}/coding/tests/${testId}/analytics`)
      .then(res => setData(res.data));
  }, [testId]);

  if (!data) return <p>Loading analytics…</p>;

  const pipeline = data.candidate_pipeline || {};
  const statusData = Object.entries(data.test_status || {}).map(
    ([k, v]) => ({ name: k, value: v })
  );

  const skillDist = Object.entries(
    data.candidate_performance?.skill_distribution || {}
  ).map(([k, v]) => ({ name: k, value: v }));

  const sectionData = Object.entries(data.section_analysis || {}).map(
    ([name, obj]) => ({ name, value: obj.percentage || 0 })
  );

  const proctoring = data.proctoring || {};
  const snapshots = proctoring.snapshots || {};
  const testLog = data.test_log || {};

  return (
    <div className="space-y-10">

      {/* ===== PIPELINE + STATUS ===== */}
      <div className="grid grid-cols-2 gap-6">

        {/* ===== FUNNEL PIPELINE ===== */}
        <Card title="Candidate Pipeline">
          <PipelineFunnel
            invited={pipeline.invited}
            appeared={pipeline.appeared}
            completed={pipeline.completed}
          />
        </Card>

        {/* ===== TEST STATUS + LEGEND ===== */}
        <Card title="Test Status">
          <div className="flex gap-6">
            <ResponsiveContainer width="70%" height={220}>
              <PieChart>
                <Pie
                  data={statusData}
                  dataKey="value"
                  innerRadius={60}
                  outerRadius={90}
                >
                  {statusData.map((s, i) => (
                    <Cell key={i} fill={STATUS_COLORS[s.name]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>

            <Legend colors={STATUS_COLORS} />
          </div>
        </Card>

      </div>

      {/* ===== CANDIDATE PERFORMANCE ===== */}
      <Card title="Candidate Performance">
        <p className="font-semibold mb-4">
          Appeared Candidates: {data.candidate_performance.appeared}
        </p>

        <div className="flex gap-6">
          <ResponsiveContainer width="70%" height={240}>
            <PieChart>
              <Pie data={skillDist} dataKey="value" innerRadius={60} outerRadius={100}>
                {skillDist.map((s, i) => (
                  <Cell key={i} fill={SKILL_COLORS[s.name]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>

          <Legend colors={SKILL_COLORS} />
        </div>
      </Card>

      {/* ===== SECTION ANALYSIS ===== */}
      <Card title="Section Analysis">
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={sectionData}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="value" fill="#6366f1" />
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* ===== PROCTORING ===== */}
      <Card title="Proctoring Analysis">
        <p>Window Violations: {proctoring.window_violations || 0}</p>
        <p>Time Violations: {proctoring.time_violations || 0}</p>

        {snapshots.length > 0 && (
          <button
            className="text-blue-600 mt-2"
            onClick={() => setShowSnapshots(true)}
          >
            <Eye size={16} /> View Snapshots
          </button>
        )}
      </Card>

      {/* ===== TEST LOG ===== */}
      <Card title="Test Log">
        <p>Appeared On: {formatDate(testLog.appeared_on)}</p>
        <p>Completed On: {formatDate(testLog.completed_on)}</p>
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

/* ================= COMPONENTS ================= */

function PipelineFunnel({ invited, appeared, completed }) {
  const max = Math.max(invited, appeared, completed) || 1;

  return (
    <svg viewBox="0 0 300 220" className="mx-auto">
      <FunnelStep y={20} value={invited} max={max} label="Invited" color="#3b82f6" />
      <FunnelStep y={90} value={appeared} max={max} label="Appeared" color="#f59e0b" />
      <FunnelStep y={160} value={completed} max={max} label="Completed" color="#22c55e" />
    </svg>
  );
}

function FunnelStep({ y, value, max, label, color }) {
  const width = 220 * (value / max || 0.05);
  const x = (300 - width) / 2;

  return (
    <>
      <polygon
        points={`${x},${y} ${x + width},${y} ${x + width - 30},${y + 40} ${x + 30},${y + 40}`}
        fill={color}
        opacity="0.9"
      />
      <text x="150" y={y + 25} textAnchor="middle" fill="#fff" fontSize="13">
        {label}: {value}
      </text>
    </>
  );
}

function Legend({ colors }) {
  return (
    <div className="space-y-2 text-sm">
      {Object.entries(colors).map(([k, v]) => (
        <div key={k} className="flex items-center gap-2">
          <span
            className="w-3 h-3 rounded-sm"
            style={{ backgroundColor: v }}
          />
          <span className="capitalize">{k}</span>
        </div>
      ))}
    </div>
  );
}

function Card({ title, children }) {
  return (
    <div className="bg-white border rounded p-6">
      <h3 className="font-semibold mb-4">{title}</h3>
      {children}
    </div>
  );
}

function SnapshotDialog({ snapshots, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/80 z-50">
      <div className="bg-white m-10 p-6 rounded">
        <div className="flex justify-between mb-4">
          <h3>Snapshots</h3>
          <button onClick={onClose}><X /></button>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {snapshots.map((s, i) => (
            <img key={i} src={s.image} alt="" />
          ))}
        </div>
      </div>
    </div>
  );
}

function formatDate(dt) {
  if (!dt) return "—";
  return new Date(dt).toLocaleString("en-GB");
}
