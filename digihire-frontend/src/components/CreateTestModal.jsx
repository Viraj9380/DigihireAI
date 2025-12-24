import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API = "http://localhost:8000";

export default function CreateTestModal({ onClose }) {
  const [mode, setMode] = useState("job");
  const [title, setTitle] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const createTest = async () => {
    const res = await axios.post(`${API}/coding/tests`, {
      title,
      job_role: mode === "job" ? role : null
    });

    onClose();
    navigate(`/my-questions/${res.data.id}`);
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white p-6 w-[450px] rounded">
        <h2 className="text-xl font-bold mb-4">Create New Test</h2>

        <div className="flex gap-4 mb-4">
          <button onClick={() => setMode("job")} className={mode==="job" ? "font-bold" : ""}>
            Job Role
          </button>
          <button onClick={() => setMode("custom")} className={mode==="custom" ? "font-bold" : ""}>
            Create Your Own
          </button>
        </div>

        <input
          className="border p-2 w-full mb-3"
          placeholder="Test Title"
          value={title}
          onChange={e => setTitle(e.target.value)}
        />

        {mode === "job" && (
          <select
            className="border p-2 w-full mb-3"
            onChange={e => setRole(e.target.value)}
          >
            <option value="">Select Role</option>
            <option>Software Developer</option>
            <option>IoT Engineer</option>
            <option>Backend Engineer</option>
          </select>
        )}

        <button
          onClick={createTest}
          className="bg-orange-500 text-white px-4 py-2 rounded w-full"
        >
          Create New Test
        </button>
      </div>
    </div>
  );
}
