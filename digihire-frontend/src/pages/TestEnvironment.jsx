// src/pages/TestEnvironment.jsx
import React, { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";

const API = "http://localhost:8000";

export default function TestEnvironment() {
  const { testId } = useParams();

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [codeMap, setCodeMap] = useState({});
  const [languageId, setLanguageId] = useState(71);
  const [proctoring, setProctoring] = useState("NONE");

  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [status, setStatus] = useState("");
  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const timerRef = useRef(null);

  /* ================= LOAD TEST ================= */
  useEffect(() => {
    loadTest();
  }, []);

  const loadTest = async () => {
    const testsRes = await axios.get(`${API}/coding/tests`);
    const test = testsRes.data.find(t => t.id === testId);
    if (!test) return;
    setProctoring(test.proctoring_mode || "NONE");
    const qRes = await axios.get(`${API}/coding/questions`);
    const matched = qRes.data.filter(q =>
      test.coding_question_ids.includes(q.id)
    );

    setQuestions(matched);
    setTimeLeft(test.duration_minutes * 60);
  };

  /* ================= TIMER ================= */
  useEffect(() => {
    if (!started) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          submitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerRef.current);
  }, [started]);

  const formatTime = () => {
    const m = Math.floor(timeLeft / 60);
    const s = timeLeft % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  /* ================= PROCTORING ================= */
  useEffect(() => {
    if (!started) return;

    const violation = () => {
  setViolations(v => v + 1);
  setShowWarning(true); // ALWAYS show warning
};

    

    window.addEventListener("blur", violation);
    return () => window.removeEventListener("blur", violation);
  }, [started]);

useEffect(() => {
  if (!started) return;

  if (proctoring === "IMAGE" || proctoring === "VIDEO" || proctoring === "VIDEO_SCREEN") {
    navigator.mediaDevices.getUserMedia({ video: true });
  }

  if (proctoring === "SCREEN" || proctoring === "VIDEO_SCREEN") {
    navigator.mediaDevices.getDisplayMedia({ video: true });
  }
}, [started, proctoring]);

  /* ================= RUN CODE ================= */
  const runCode = async () => {
    setStatus("Running...");
    setOutput("");
    setError("");
    setResults([]);

    const q = questions[currentIndex];

    const res = await axios.post(`${API}/coding/execute/run`, {
      code: codeMap[q.id] || "",
      language_id: languageId,
      question_id: q.id,
      custom_input: customInput
    });

    setOutput(res.data.stdout || "");
    setError(res.data.stderr || "");
    setResults(res.data.results || []);
  };
  
  /* ================= RESET ================= */
  const resetCode = () => {
    const q = questions[currentIndex];
    setCodeMap({ ...codeMap, [q.id]: "" });
    setCustomInput("");
    setOutput("");
    setError("");
    setResults([]);
  };

  /* ================= SUBMIT ================= */
  /* ================= SUBMIT ================= */
const submitTest = async () => {
  try {
    await axios.post(`${API}/test-env/${testId}/submit`, {
      student_id: "00000000-0000-0000-0000-000000000001", // valid UUID
      answers: codeMap || {} // can be empty (blank answers allowed)
    });

    alert("✅ Test submitted successfully!");
    window.location.href = "/";
  } catch (err) {
    console.error(err);
    alert("❌ Submission failed");
  }
};

  if (!questions.length) return <div className="p-6">Loading...</div>;

  const currentQuestion = questions[currentIndex];
  const isAnswered = q =>
    (codeMap[q.id] || "").trim().length > 0;
  const answeredCount = questions.filter(q => isAnswered(q)).length;
  const unansweredCount = questions.length - answeredCount;


  /* ================= INSTRUCTIONS ================= */
  if (!started) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Test Instructions</h1>
        <p>Total Questions: {questions.length}</p>
        <p>Duration: {Math.floor(timeLeft / 60)} minutes</p>

        <button
          onClick={() => {
            document.documentElement.requestFullscreen();
            setStarted(true);
          }}
          className="mt-6 bg-blue-600 text-white px-6 py-2 rounded"
        >
          Start Test
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex flex-col">

      {/* ================= QUESTION PALETTE ================= */}
      <div className="flex gap-2 p-3 border-b">
        {questions.map((q, i) => (
          <button
            key={q.id}
            onClick={() => setCurrentIndex(i)}
            className={`w-9 h-9 rounded text-white ${
  i === currentIndex
    ? "bg-blue-600"
    : isAnswered(q)
    ? "bg-green-600"
    : "bg-red-600"
}`}

          >
            {i + 1}
          </button>
        ))}
        <div className="ml-auto font-semibold">⏱ {formatTime()}</div>
      </div>

      {/* ================= MAIN ================= */}
      <div className="grid grid-cols-2 flex-1">

        {/* ================= QUESTION PANEL ================= */}
        <div className="p-6 overflow-y-auto space-y-6 border-r">
          <h1 className="text-2xl font-bold">{currentQuestion.title}</h1>

          <section>
            <h2 className="font-semibold">Problem Statement</h2>
            <p className="whitespace-pre-line">{currentQuestion.description}</p>
          </section>

          <section>
            <h2 className="font-semibold">Input Format</h2>
            <pre className="bg-gray-100 p-2">{currentQuestion.input_format}</pre>
          </section>

          <section>
            <h2 className="font-semibold">Output Format</h2>
            <pre className="bg-gray-100 p-2">{currentQuestion.output_format}</pre>
          </section>

          <section>
            <h2 className="font-semibold">Constraints</h2>
            <pre className="bg-gray-100 p-2">{currentQuestion.constraints}</pre>
          </section>

          {currentQuestion.examples?.length > 0 && (
            <section>
              <h2 className="font-semibold">Examples</h2>
              {currentQuestion.examples.map((ex, i) => (
                <div key={i} className="border p-3 mt-2">
                  <p><b>Input:</b></p>
                  <pre>{ex.input}</pre>
                  <p><b>Output:</b></p>
                  <pre>{ex.output}</pre>
                </div>
              ))}
            </section>
          )}
        </div>

        {/* ================= COMPILER PANEL ================= */}
        <div className="p-6 flex flex-col">

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

          <textarea
            className="flex-1 border p-3 font-mono"
            value={codeMap[currentQuestion.id] || ""}
            onChange={e =>
              setCodeMap({
                ...codeMap,
                [currentQuestion.id]: e.target.value
              })
            }
          />

          <textarea
            placeholder="Custom Input"
            className="border mt-2 p-2 font-mono"
            value={customInput}
            onChange={e => setCustomInput(e.target.value)}
          />

          <div className="flex gap-2 mt-3">
            <button onClick={runCode} className="bg-blue-600 text-white flex-1 py-2 rounded">Run</button>
            <button onClick={resetCode} className="bg-gray-600 text-white flex-1 py-2 rounded">Reset</button>
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

          <div className="flex justify-between mt-4">
  <button
    disabled={currentIndex === 0}
    onClick={() => setCurrentIndex(i => i - 1)}
  >
    ← Prev
  </button>

  <div className="flex gap-3">
    <button
  onClick={() => setShowSummary(true)}
  className="bg-red-600 text-white px-4 py-2 rounded"
>
  Submit Test
</button>


    {currentIndex < questions.length - 1 && (
      <button onClick={() => setCurrentIndex(i => i + 1)}>
        Next →
      </button>
    )}
  </div>
</div>

        </div>
      </div>
      {/* ================= WARNING MODAL ================= */}
      {showWarning && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center">
          <div className="bg-white p-6 rounded w-96">
            <h2 className="text-xl font-bold mb-2">⚠️ Warning</h2>
            <p>
              During the test, you are not allowed to leave the test window.
              <br />
              Your test will be discontinued if you try to leave the test window again.
            </p>
            <button
              onClick={() => setShowWarning(false)}
              className="mt-4 bg-blue-600 text-white px-4 py-2 rounded"
            >
              OK
            </button>
          </div>
        </div>
      )}


      {/* ================= SUBMISSION SUMMARY ================= */}
{showSummary && (
  <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
    <div className="bg-white rounded-lg w-[420px] p-6 space-y-4">

      <h2 className="text-2xl font-bold text-center">
        Submission Summary
      </h2>

      <div className="space-y-2 text-sm">
        <p>
          <b>Total Questions:</b> {questions.length}
        </p>
        <p className="text-green-700">
          <b>Answered:</b> {answeredCount}
        </p>
        <p className="text-red-700">
          <b>Unanswered:</b> {unansweredCount}
        </p>
        <p>
          <b>Time Remaining:</b> {formatTime()}
        </p>
        <p className="text-orange-600">
          <b>Violations:</b> {violations}
        </p>
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 text-sm">
        ⚠️ Once submitted, you cannot return to the test.
      </div>

      <div className="flex justify-between gap-3 mt-4">
        <button
          onClick={() => setShowSummary(false)}
          className="flex-1 bg-gray-500 text-white py-2 rounded"
        >
          Go Back
        </button>

        <button
          onClick={submitTest}
          className="flex-1 bg-red-600 text-white py-2 rounded"
        >
          Confirm & Submit
        </button>
      </div>
    </div>
  </div>
)}

    </div>
  );
}
