// src/pages/CandidateAuth.jsx
import axios from "axios";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect, useState } from "react";

export default function CandidateAuth() {
  const { testId } = useParams();
  const [params] = useSearchParams();
  const navigate = useNavigate();

  const token = params.get("token");

  const [email, setEmail] = useState("");
  const [fullName, setFullName] = useState("");
  const [loading, setLoading] = useState(false);

  const handleVerify = () => {
    if (!email) {
      alert("Email is required");
      return;
    }

    setLoading(true);

    axios
      .post("http://localhost:8000/auth/verify", null, {
        params: {
          token,
          email,
          full_name: fullName,
        },
      })
      .then(res => {
        localStorage.setItem("student_id", res.data.student_id);
        localStorage.setItem("student_email", res.data.email);
        localStorage.setItem("student_name", res.data.full_name || fullName);
        navigate(`/test/${testId}/instructions`);
      })
      .catch(err => {
        alert(err?.response?.data?.detail || "❌ Access denied");
      })
      .finally(() => setLoading(false));
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded">
      <h2 className="text-xl font-bold text-center">Candidate Authentication</h2>

      <div className="mt-4">
        <label className="block text-sm mb-1">Full Name</label>
        <input
          type="text"
          className="w-full border p-2 rounded"
          placeholder="Enter your full name"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
        />
      </div>

      <div className="mt-4">
        <label className="block text-sm mb-1">Email</label>
        <input
          type="email"
          className="w-full border p-2 rounded"
          placeholder="Enter invited email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>

      <button
        onClick={handleVerify}
        disabled={loading}
        className="w-full mt-6 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
      >
        {loading ? "Verifying..." : "Verify & Continue"}
      </button>
    </div>
  );
}
