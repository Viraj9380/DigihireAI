import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("");
  const [pwd, setPwd] = useState("");
  const navigate = useNavigate();

  const handleLogin = (e) => {
    e.preventDefault();
    if (!email) return alert("enter email");
    // mock login for now
    navigate("/assessments");
  };

  return (
    <div className="max-w-md mx-auto mt-20">
      <div className="bg-white p-6 rounded shadow">
        <h3 className="text-xl font-semibold mb-4">Sign in</h3>
        <form onSubmit={handleLogin} className="space-y-3">
          <input className="w-full border px-3 py-2 rounded" placeholder="Email" value={email} onChange={(e)=>setEmail(e.target.value)} />
          <input type="password" className="w-full border px-3 py-2 rounded" placeholder="Password" value={pwd} onChange={(e)=>setPwd(e.target.value)} />
          <div className="flex justify-end">
            <button className="px-4 py-2 bg-sky-600 text-white rounded">Sign in</button>
          </div>
        </form>
      </div>
    </div>
  );
}
