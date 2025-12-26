// digihire-frontend/src/components/CreateTestModal.jsx
import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://127.0.0.1:8000"; // keep your localhost format

export default function CreateTestModal({ onClose }) {
  const [mode, setMode] = useState("job");
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const createTest = async () => {
    if (!title.trim()) {
      alert("Please enter test title");
      return;
    }

    if (mode === "job" && !role) {
      alert("Please select a job role");
      return;
    }

    try {
      setLoading(true);

      const payload = {
        title: title.trim(),
        job_role: mode === "job" ? role : null,
        duration_minutes: duration,
      };

      const res = await axios.post(`${API}/coding/tests/`, payload);

      onClose(true);
      navigate(`/my-questions/${res.data.id}`);
    } catch (err) {
      console.error("Create test failed:", err.response?.data || err.message);
      alert("Failed to create test");
      onClose(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 w-[450px] rounded shadow-lg">
        <h2 className="text-xl font-bold mb-4">Create New Test</h2>

        {/* MODE */}
        <div className="flex gap-4 mb-4">
          <button
            onClick={() => setMode("job")}
            className={mode === "job" ? "font-bold underline" : ""}
          >
            Job Role
          </button>
          <button
            onClick={() => setMode("custom")}
            className={mode === "custom" ? "font-bold underline" : ""}
          >
            Custom
          </button>
        </div>

        {/* TITLE */}
        <input
          className="border p-2 w-full mb-3"
          placeholder="Test Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />

        {/* ROLE */}
        {mode === "job" && (
          <select
            className="border p-2 w-full mb-3"
            value={role}
            onChange={(e) => setRole(e.target.value)}
          >
            <option value="">Select Role</option>
            <option value="Software Developer">Software Developer</option>
            <option value="IoT Engineer">IoT Engineer</option>
            <option value="Backend Engineer">Backend Engineer</option>
          </select>
        )}

        {/* DURATION */}
        <input
          type="number"
          className="border p-2 w-full mb-4"
          min={10}
          value={duration}
          onChange={(e) => setDuration(Number(e.target.value))}
        />

        {/* ACTIONS */}
        <div className="flex gap-3">
          <button
            onClick={onClose}
            className="border px-4 py-2 rounded w-full"
          >
            Cancel
          </button>

          <button
            onClick={createTest}
            disabled={loading}
            className="bg-orange-500 text-white px-4 py-2 rounded w-full hover:bg-orange-600 disabled:opacity-60"
          >
            {loading ? "Creating..." : "Create Test"}
          </button>
        </div>
      </div>
    </div>
  );
}
