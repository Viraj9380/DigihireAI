//digihire-frontend/src/pages/CodingQuestionSolvePage.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API_BASE = "http://localhost:8000";
const TOTAL_TIME = 30 * 60; // 30 minutes

export default function CodingQuestionSolvePage() {
  const { questionId } = useParams();

  const [question, setQuestion] = useState(null);
  const [code, setCode] = useState("print('Hello World')");
  const [languageId, setLanguageId] = useState(71);

  const [results, setResults] = useState([]);
  const [status, setStatus] = useState("");
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");

  const [customInput, setCustomInput] = useState("");
  const [customTests, setCustomTests] = useState(["", "", ""]);

  const [timeLeft, setTimeLeft] = useState(TOTAL_TIME);
  const [violations, setViolations] = useState(0);

  const timerRef = useRef(null);

  /* ================= LOAD QUESTION ================= */
  useEffect(() => {
    axios
      .get(`${API_BASE}/coding/questions/${questionId}`)
      .then(res => setQuestion(res.data))
      .catch(console.error);
  }, [questionId]);

  /* ================= TIMER ================= */
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          autoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, []);

  const formatTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  /* ================= PROCTORING ================= */
  useEffect(() => {
    const handleViolation = () => setViolations(v => v + 1);
    const handleFullscreenChange = () => {
      if (!document.fullscreenElement) handleViolation();
    };

    window.addEventListener("blur", handleViolation);
    document.addEventListener("fullscreenchange", handleFullscreenChange);

    return () => {
      window.removeEventListener("blur", handleViolation);
      document.removeEventListener("fullscreenchange", handleFullscreenChange);
    };
  }, []);

  /* ================= RUN & COMPILE ================= */
  const runCode = async () => {
    setStatus("Running...");
    setResults([]);
    setOutput("");
    setError("");

    try {
      const res = await axios.post(`${API_BASE}/coding/execute/run`, {
        code,
        language_id: languageId,
        question_id: questionId,
        custom_input: customInput
      });

      setOutput(res.data.stdout || "");
      setError(res.data.stderr || "");
      setResults(res.data.results || []);
      setStatus(res.data.status || "Run Completed");
    } catch (err) {
      setStatus("Execution Error");
      setError(err.response?.data?.detail || "Something went wrong");
    }
  };

  /* ================= SUBMIT ================= */
  const submitCode = async () => {
    setStatus("Submitting...");
    try {
      await axios.post(
        `${API_BASE}/coding/execute/${questionId}/submit`,
        { code, language_id: languageId }
      );
      setStatus("Code Saved Successfully ✅");
    } catch {
      setStatus("Save Failed ❌");
    }
  };

  const autoSubmit = () => {
    submitCode();
    alert("⏰ Time is up! Code auto-saved.");
  };

  /* ================= RESET ================= */
  const resetCode = () => {
    setCode("");
    setCustomInput("");
    setCustomTests(["", "", ""]);
    setResults([]);
    setOutput("");
    setError("");
  };

  if (!question) return <div className="p-6">Loading...</div>;

  return (
    <div className="grid grid-cols-2 h-screen">

      {/* ================= QUESTION PANEL ================= */}
      <div className="p-6 overflow-y-auto border-r space-y-6">

        {/* TITLE */}
        <h1 className="text-3xl font-bold">{question.title}</h1>

        {/* META INFO */}
        <div className="flex justify-between text-sm font-semibold">
          <div>
            ⏱ Time Left: <span className="text-red-600">{formatTime()}</span>
          </div>
          <div>
            🚨 Proctoring Violations: <span className="text-red-600">{violations}</span>
          </div>
        </div>

        {/* PROBLEM STATEMENT */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Problem Statement</h2>
          <p className="whitespace-pre-line text-gray-800">
            {question.description}
          </p>
        </section>

        {/* INPUT FORMAT */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Input Format</h2>
          <pre className="bg-gray-100 p-3 rounded whitespace-pre-wrap">
            {question.input_format || "Refer to problem statement"}
          </pre>
        </section>

        {/* OUTPUT FORMAT */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Output Format</h2>
          <pre className="bg-gray-100 p-3 rounded whitespace-pre-wrap">
            {question.output_format || "Refer to problem statement"}
          </pre>
        </section>

        {/* CONSTRAINTS */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Constraints</h2>
          <pre className="bg-gray-100 p-3 rounded whitespace-pre-wrap">
            {question.constraints}
          </pre>
        </section>

        {/* SAMPLE */}
        <section>
          <h2 className="text-xl font-semibold mb-2">Sample Input</h2>
          <pre className="bg-gray-100 p-3 rounded whitespace-pre-wrap">
            {question.sample_input}
          </pre>

          <h2 className="text-xl font-semibold mt-4 mb-2">Sample Output</h2>
          <pre className="bg-gray-100 p-3 rounded whitespace-pre-wrap">
            {question.sample_output}
          </pre>
        </section>

        {/* EXAMPLES */}
{question.examples && question.examples.length > 0 && (
  <section>
    <h2 className="text-xl font-semibold mb-2">Examples</h2>

    {question.examples.map((ex, idx) => (
      <div key={idx} className="mb-4 border rounded p-3 bg-gray-50">
        <p className="font-semibold">Example {idx + 1}</p>

        <p className="mt-2 text-sm font-medium">Input</p>
        <pre className="bg-white p-2 border rounded whitespace-pre-wrap">
          {ex.input}
        </pre>

        <p className="mt-2 text-sm font-medium">Output</p>
        <pre className="bg-white p-2 border rounded whitespace-pre-wrap">
          {ex.output}
        </pre>

        {ex.explanation && (
          <>
            <p className="mt-2 text-sm font-medium">Explanation</p>
            <p className="text-gray-700 text-sm whitespace-pre-line">
              {ex.explanation}
            </p>
          </>
        )}
      </div>
    ))}
  </section>
)}


        {/* NOTE */}
        <section className="bg-yellow-50 border-l-4 border-yellow-400 p-3">
          <p className="text-sm text-yellow-800">
            ⚠️ Hidden test cases will be used for final evaluation. Your solution
            must handle all edge cases efficiently.
          </p>
        </section>

      </div>

      {/* ================= COMPILER PANEL ================= */}
      <div className="p-6 flex flex-col">

        {/* LANGUAGE */}
        <select
          className="mb-2 p-2 border"
          value={languageId}
          onChange={e => setLanguageId(Number(e.target.value))}
        >
          <option value={71}>Python</option>
          <option value={63}>JavaScript</option>
          <option value={62}>Java</option>
          <option value={54}>C++</option>
        </select>

        {/* CODE EDITOR */}
        <textarea
          className="flex-1 p-3 border font-mono text-sm"
          value={code}
          onChange={e => setCode(e.target.value)}
        />

        {/* CUSTOM INPUT */}
        <textarea
          className="mt-2 p-2 border font-mono text-sm"
          placeholder="Input"
          value={customInput}
          onChange={e => setCustomInput(e.target.value)}
        />


        {/* ACTION BUTTONS */}
        <div className="flex gap-3 mt-4">
          <button onClick={runCode} className="flex-1 bg-blue-600 text-white py-2 rounded">
            Run & Compile
          </button>

          <button onClick={submitCode} className="flex-1 bg-green-600 text-white py-2 rounded">
            Save
          </button>

          <button onClick={resetCode} className="flex-1 bg-gray-600 text-white py-2 rounded">
            Reset
          </button>
        </div>

        {/* OUTPUT */}
        <div className="mt-4">
          <p className="font-semibold">Status: {status}</p>

          {output && (
            <pre className="bg-black text-green-400 p-3 mt-2 rounded">{output}</pre>
          )}

          {error && (
            <pre className="bg-black text-red-400 p-3 mt-2 rounded">{error}</pre>
          )}

          {results.length > 0 && (
            <div className="mt-4">
              <h3 className="font-semibold">Testcase Results</h3>
              {results.map(r => (
                <div
                  key={r.testcase}
                  className={`p-2 mt-2 rounded ${
                    r.passed ? "bg-green-100" : "bg-red-100"
                  }`}
                >
                  Testcase {r.testcase}: {r.passed ? "Passed ✅" : "Failed ❌"}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
