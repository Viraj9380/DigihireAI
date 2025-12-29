// src/pages/CandidateAuth.jsx
import axios from "axios";
import { useParams, useNavigate } from "react-router-dom";
import { useState } from "react";

export default function CandidateAuth() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const proceed = async () => {
    await axios.post("http://localhost:8000/students", {
  full_name: name,
  email,
  test_id: testId
});


    navigate(`/test/${testId}/instructions`);
  };

  return (
    <div className="max-w-md mx-auto mt-20 p-6 border rounded">
      <h2 className="text-xl font-bold mb-4">Authenticate</h2>

      <input
        className="border p-2 w-full mb-3"
        placeholder="Full Name"
        onChange={e => setName(e.target.value)}
      />

      <input
        className="border p-2 w-full mb-3"
        placeholder="Email"
        onChange={e => setEmail(e.target.value)}
      />

      <button
        onClick={proceed}
        className="bg-blue-600 text-white w-full py-2 rounded"
      >
        Proceed to Test
      </button>
    </div>
  );
}
