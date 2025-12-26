//digihire-frontend/src/pages/CodingTestPage.jsx
import React, { useState } from "react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

export default function CodingTestPage() {
  const [code, setCode] = useState(`print("Hello World")`);
  const [stdin, setStdin] = useState("");
  const [language, setLanguage] = useState(71);
  const [output, setOutput] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function runCode() {
    setLoading(true);
    setStatus("Running...");
    setOutput("");

    try {
      const r = await axios.post(`${API_BASE}/judge0/run`, {
        source_code: code,
        language_id: language,
        stdin,
      });

      setStatus(r.data.status?.description || "Done");
      setOutput(
        r.data.stdout ||
        r.data.stderr ||
        r.data.compile_output ||
        "No output"
      );
    } catch (e) {
      setStatus("Error");
      setOutput("Execution failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="h-screen flex flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-white shadow px-6 py-4 flex justify-between">
        <h1 className="text-xl font-semibold">Coding Assessment</h1>

        <select
          value={language}
          onChange={(e) => setLanguage(Number(e.target.value))}
          className="border px-3 py-1 rounded"
        >
          <option value={71}>Python</option>
          <option value={63}>JavaScript</option>
          <option value={62}>Java</option>
          <option value={50}>C</option>
          <option value={54}>C++</option>
        </select>
      </div>

      {/* Editor */}
      <div className="flex flex-1">
        <textarea
          className="w-2/3 p-4 font-mono text-sm border-r resize-none"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        <div className="w-1/3 flex flex-col">
          <textarea
            placeholder="Input (stdin)"
            className="h-1/3 p-3 border-b font-mono"
            value={stdin}
            onChange={(e) => setStdin(e.target.value)}
          />

          <div className="flex-1 bg-black text-green-400 p-3 font-mono overflow-auto">
            <div>Status: {status}</div>
            <pre>{output}</pre>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="bg-white p-4 flex justify-end">
        <button
          onClick={runCode}
          disabled={loading}
          className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
        >
          {loading ? "Running..." : "Run Code"}
        </button>
      </div>
    </div>
  );
}
