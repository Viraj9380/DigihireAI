// src/components/AnalyticsInsights.jsx
import { useEffect, useState } from "react";
import axios from "axios";
import { Eye } from "lucide-react";
import QuestionDetailsModal from "./QuestionDetailsModal";

const API = "http://localhost:8000";

export default function AnalyticsInsights({ testId }) {
  const [rows, setRows] = useState([]);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    axios
      .get(`${API}/coding/tests/${testId}/question-insights`)
      .then((res) => setRows(res.data || []));
  }, [testId]);

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border rounded-lg text-sm">
          <thead className="bg-gray-100">
            <tr>
              <th className="p-3 text-left">Question Type</th>
              <th className="p-3 text-left">Difficulty</th>
              <th className="p-3 text-left">Attempted</th>
              <th className="p-3 text-left">Correct</th>
              <th className="p-3 text-left">Incorrect</th>
              <th className="p-3 text-center">Action</th>
            </tr>
          </thead>

          <tbody>
            {rows.map((r, i) => (
              <tr
                key={i}
                className="border-t hover:bg-gray-50"
              >
                <td className="p-3">{r.type}</td>
                <td className="p-3">{r.difficulty}</td>
                <td className="p-3">{r.attempted ? "Yes" : "No"}</td>
                <td className="p-3">{r.correct ? 1 : 0}</td>
                <td className="p-3">{r.correct ? 0 : 1}</td>
                <td className="p-3 text-center">
                  <button
                    onClick={() => setSelected(r)}
                    className="text-blue-600 hover:underline"
                  >
                    <Eye size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selected && (
        <QuestionDetailsModal
          question={selected}
          onClose={() => setSelected(null)}
        />
      )}
    </>
  );
}
