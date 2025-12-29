import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

export default function CreateTestModal({ onClose }) {
  const [mode, setMode] = useState("job");
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [showProctoring, setShowProctoring] = useState(false);
  const [proctoring, setProctoring] = useState("NONE");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const submitTest = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${API}/coding/tests`, {
        title,
        job_role: mode === "job" ? role : null,
        proctoring_mode: proctoring
      });

      onClose(true);

      if (mode === "custom") {
        navigate(`/my-questions/${res.data.id}`);
      }
    } catch {
      onClose(false);
    }
  };

  return (
    <>
      {/* MAIN CREATE MODAL */}
      {!showProctoring && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white p-6 w-[450px] rounded space-y-4">
            <h2 className="text-xl font-bold">Create New Test</h2>

            <div className="flex gap-4">
              <button onClick={() => setMode("job")} className={mode === "job" ? "font-bold" : ""}>
                Job Role
              </button>
              <button onClick={() => setMode("custom")} className={mode === "custom" ? "font-bold" : ""}>
                Create Your Own
              </button>
            </div>

            <input
              className="border p-2 w-full"
              placeholder="Test Title"
              value={title}
              onChange={e => setTitle(e.target.value)}
            />

            {mode === "job" && (
              <select className="border p-2 w-full" onChange={e => setRole(e.target.value)}>
                <option value="">Select Role</option>
                <option>Software Developer</option>
                <option>IoT Engineer</option>
                <option>Backend Engineer</option>
              </select>
            )}

            <button
              onClick={() => setShowProctoring(true)}
              className="bg-orange-500 text-white w-full py-2 rounded"
            >
              Create New Test
            </button>
          </div>
        </div>
      )}

      {/* PROCTORING MODAL */}
      {showProctoring && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white w-[520px] p-6 rounded space-y-4">
            <h2 className="text-xl font-bold">Proctoring</h2>

            {[
              ["NONE", "No Proctoring"],
              ["IMAGE", "Image Proctoring"],
              ["VIDEO", "Video Proctoring"],
              ["SCREEN", "Screen Recording"],
              ["VIDEO_SCREEN", "Video & Screen Recording"]
            ].map(([val, label]) => (
              <label key={val} className="flex items-center gap-3 border p-3 rounded cursor-pointer">
                <input
                  type="radio"
                  checked={proctoring === val}
                  onChange={() => setProctoring(val)}
                />
                {label}
              </label>
            ))}

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowProctoring(false)}
                className="flex-1 bg-gray-500 text-white py-2 rounded"
              >
                Back
              </button>

              <button
                disabled={loading}
                onClick={submitTest}
                className="flex-1 bg-blue-600 text-white py-2 rounded"
              >
                {loading ? "Creating..." : "Create Test"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
