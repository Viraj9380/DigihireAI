// src/components/AnalyticsAnalysis.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart, Bar, LineChart, Line, PieChart, Pie,
  RadarChart, Radar, XAxis, YAxis, Tooltip,
  PolarGrid, PolarAngleAxis, ResponsiveContainer,
  ScatterChart, Scatter
} from "recharts";

const API = "http://localhost:8000";

export default function AnalyticsAnalysis({ testId }) {
  const [data, setData] = useState(null);

  useEffect(() => {
    axios
      .get(`${API}/coding/tests/${testId}/analytics`)
      .then((res) => setData(res.data))
      .catch((err) => {
        console.error("Error fetching analytics:", err);
        setData({});
      });
  }, [testId]);

  if (!data) return <p>Loading analytics…</p>;

  // --- Difficulty Analysis ---
  const difficultyRows = Object.entries(data.difficulty_analysis || {}).map(
    ([level, v]) => ({
      level,
      questions: v?.questions || 0,
      correct: v?.correct || 0,
      percentage: v?.percentage || 0,
    })
  );
  const showDifficultyTable = difficultyRows.length > 0;
  const difficultyChartData =
    difficultyRows.length > 0 ? difficultyRows : [{ level: "N/A", percentage: 0 }];

  // --- Skill Analysis ---
  const skillData = Object.entries(data.skill_analysis || {}).map(([skill, value]) => ({
    skill,
    value: value || 0,
  }));
  const skillChartData = skillData.length > 0 ? skillData : [{ skill: "N/A", value: 0 }];

  // --- Attempt Funnel ---
  const attemptFunnel = data.attempt_funnel || null;
  const attemptData = attemptFunnel
    ? [
        { name: "Total", value: attemptFunnel.total || 0 },
        { name: "Attempted", value: attemptFunnel.attempted || 0 },
        { name: "Correct", value: attemptFunnel.correct || 0 },
      ]
    : [];
  const showAttemptFunnel = attemptFunnel && (attemptFunnel.total || attemptFunnel.attempted || attemptFunnel.correct);

  // --- Time vs Score ---
  const timeScoreMap = Array.isArray(data.time_score_map) ? data.time_score_map : [];

  return (
    <div className="space-y-8">

      {/* Score Summary */}
      <Card title="Score Summary">
        <div className="text-2xl font-bold">
          {data.avg_score ?? 0}% | Avg Time: {data.avg_time ?? 0}s
        </div>
      </Card>

      {/* Difficulty Table */}
      <Card title="Difficulty Level Analysis">
        <table className="w-full text-sm border">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-2">Level</th>
              <th>#Questions</th>
              <th>Correct</th>
              <th>Accuracy</th>
            </tr>
          </thead>
          <tbody>
            {showDifficultyTable ? (
              difficultyRows.map((d) => (
                <tr key={d.level} className="border-t">
                  <td className="p-2">{d.level}</td>
                  <td>{d.questions}</td>
                  <td>{d.correct}</td>
                  <td>{d.percentage}%</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="text-center p-2 text-gray-500">
                  No difficulty data available
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </Card>

      {/* Difficulty Curve */}
      <ChartCard title="Difficulty Curve">
        <LineChart data={difficultyChartData}>
          <XAxis dataKey="level" />
          <YAxis />
          <Tooltip />
          <Line dataKey="percentage" stroke="#8884d8" strokeWidth={2} />
        </LineChart>
      </ChartCard>

      {/* Skill Radar */}
      <ChartCard title="Skill Radar">
        <RadarChart data={skillChartData}>
          <PolarGrid />
          <PolarAngleAxis dataKey="skill" />
          <Radar dataKey="value" fill="#82ca9d" fillOpacity={0.6} />
        </RadarChart>
      </ChartCard>

      {/* Attempt Funnel */}
      <ChartCard title="Attempt Funnel">
        {showAttemptFunnel ? (
          <PieChart>
            <Pie data={attemptData} dataKey="value" label />
            <Tooltip />
          </PieChart>
        ) : (
          <div className="text-center py-10 text-gray-500">No attempt funnel data available</div>
        )}
      </ChartCard>

      {/* Time vs Score */}
      <ChartCard title="Time vs Score">
        {timeScoreMap.length > 0 ? (
          <ScatterChart>
            <XAxis dataKey="time" />
            <YAxis dataKey="score" />
            <Tooltip />
            <Scatter data={timeScoreMap} fill="#8884d8" />
          </ScatterChart>
        ) : (
          <div className="text-center py-10 text-gray-500">No time vs score data available</div>
        )}
      </ChartCard>

      {/* Integrity Score */}
      <Card title="Integrity Score">
        <div className="text-3xl font-bold">{data.integrity_score ?? 0}/100</div>
      </Card>
    </div>
  );
}

// --- Card Components ---
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
