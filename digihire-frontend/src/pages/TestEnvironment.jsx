//src/pages/TestEnvironment.jsx
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
  const [snapshots, setSnapshots] = useState([]);
  const snapshotLimit = 3;
  const videoReadyRef = useRef(false);


  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [results, setResults] = useState([]);
  const [customInput, setCustomInput] = useState("");
  const [status, setStatus] = useState("");

  const [allowCopyPaste, setAllowCopyPaste] = useState(true);
  const [terminateOnViolation, setTerminateOnViolation] = useState(false);
  const [maxViolations, setMaxViolations] = useState(1);
  const [shuffleQuestions, setShuffleQuestions] = useState(false);

  const [started, setStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(0);
  const [violations, setViolations] = useState(0);
  const [showWarning, setShowWarning] = useState(false);
  const [showSummary, setShowSummary] = useState(false);

  const [section, setSection] = useState("MCQ"); // MCQ | CODING
  const [mcqQuestions, setMcqQuestions] = useState([]);
  const [codingQuestions, setCodingQuestions] = useState([]);

  const [mcqAnswers, setMcqAnswers] = useState({});
  const [sectionLocked, setSectionLocked] = useState(false);
  const [mcqSectionTime, setMcqSectionTime] = useState(0);
  const [codingSectionTime, setCodingSectionTime] = useState(0);



  const timerRef = useRef(null);

  /* 🔒 PROCTORING REFS (IMPORTANT) */
  const screenStreamRef = useRef(null);
  const videoRef = useRef(null);



  

  /* ================= LOAD TEST ================= */
  useEffect(() => {
    loadTest();
  }, []);

  const loadTest = async () => {
    const testRes = await axios.get(`${API}/coding/tests/${testId}`);
    const test = testRes.data;


  if (!test) return;

  // === Existing settings (UNCHANGED) ===
  setAllowCopyPaste(test.allow_copy_paste !== false);
  setTerminateOnViolation(!!test.terminate_on_violation);
  setMaxViolations(test.max_violations || 1);
  setShuffleQuestions(!!test.shuffle_questions);
  setProctoring(test.proctoring_mode || "NONE");

  // === NEW: Load MCQ questions ===
  let mcqs = [];
  if (test.mcq_question_ids?.length) {
    const mcqRes = await axios.get(`${API}/mcq/questions`);
    mcqs = mcqRes.data.filter(q =>
      test.mcq_question_ids.includes(q.id)
    );

    if (test.shuffle_questions) {
      mcqs = [...mcqs].sort(() => Math.random() - 0.5);
    }
  }

  // === Existing: Load coding questions (UNCHANGED LOGIC) ===
  const qRes = await axios.get(`${API}/coding/questions`);
  let codingMatched = qRes.data.filter(q =>
    test.coding_question_ids.includes(q.id)
  );

  if (test.shuffle_questions) {
    codingMatched = [...codingMatched].sort(() => Math.random() - 0.5);
  }

  // === NEW: Section-wise setup ===
  setMcqQuestions(mcqs);
  setCodingQuestions(codingMatched);

  // Start test with MCQs if present, else Coding
  if (mcqs.length > 0) {
    setSection("MCQ");
    setQuestions(mcqs);
  } else {
    setSection("CODING");
    setQuestions(codingMatched);
  }

  // ===== MCQ TIME =====
const perMcq = Number(test.mcq_time_minutes ?? 1);
const mcqCount = mcqs.length;

const mcqTimeMinutes =
  mcqCount > 0 ? perMcq * mcqCount : 0;


// ===== CODING TIME =====
const config = test.coding_time_config || {
  Easy: 10,
  Medium: 15,
  Hard: 20
};

const codingTimeMinutes = codingMatched.reduce(
  (sum, q) => sum + (config[q.difficulty] || 15),
  0
);


// store section times
setMcqSectionTime(mcqTimeMinutes * 60);
setCodingSectionTime(codingTimeMinutes * 60);

// start with MCQ section timer
if (mcqs.length > 0) {
  setTimeLeft(mcqTimeMinutes * 60);
} else {
  setTimeLeft(codingTimeMinutes * 60);
}

};


  /* ================= PROCTORING INIT (ONCE) ================= */
  /* ================= PROCTORING INIT (ONCE) ================= */
useEffect(() => {
  if (!started) return;

  const initProctoring = async () => {
    try {
      // Camera permission (for IMAGE / VIDEO modes)
      if (["IMAGE", "VIDEO", "VIDEO_SCREEN"].includes(proctoring)) {
        await navigator.mediaDevices.getUserMedia({ video: true });
      }

      // Screen share → MUST be piped into a DOM-mounted <video>
      if (
        ["SCREEN", "VIDEO_SCREEN"].includes(proctoring) &&
        !screenStreamRef.current
      ) {
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: { frameRate: 10 }
        });

        screenStreamRef.current = stream;

        if (videoRef.current) {
  videoRef.current.srcObject = stream;
  videoRef.current.muted = true;
  videoRef.current.playsInline = true;

  videoRef.current.onloadedmetadata = async () => {
    await videoRef.current.play();
    videoReadyRef.current = true; // ✅ CRITICAL
    console.log("✅ Proctoring video ready");
  };
}

      }
    } catch (err) {
      alert("Screen sharing permission is mandatory for this test.");
      window.location.reload();
    }
  };

  initProctoring();
}, [started, proctoring]);


  /* ================= SNAPSHOT (NO PERMISSION REQUEST) ================= */
  const captureSnapshot = (reason) => {
  if (!videoReadyRef.current) {
    console.warn("⏳ Snapshot delayed — video not ready");
    return;
  }

  if (snapshots.length >= snapshotLimit) return;

  const video = videoRef.current;
  if (!video || video.videoWidth === 0) return;

  const canvas = document.createElement("canvas");
  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext("2d");
  ctx.drawImage(video, 0, 0);

  const base64 = canvas.toDataURL("image/png");
  if (!base64.startsWith("data:image")) return;

  setSnapshots(prev => [
    ...prev,
    {
      type: reason,
      timestamp: new Date().toISOString(),
      image: base64
    }
  ]);
};


  /* ================= SINGLE VIOLATION LISTENER ================= */
  useEffect(() => {
    if (!started) return;

    const onBlur = () => {
      setTimeout(() => captureSnapshot("WINDOW_BLUR"), 500);

      setViolations(v => {
        const next = v + 1;
        setShowWarning(true);

        if (
          terminateOnViolation &&
          maxViolations > 0 &&
          next >= maxViolations
        ) {
          submitTest();
        }
        return next;
      });
    };

    window.addEventListener("blur", onBlur);
    return () => window.removeEventListener("blur", onBlur);
  }, [started, terminateOnViolation, maxViolations]);



  // ADD this inside TestEnvironment.jsx
  useEffect(() => {
  if (!started) return;

  const onVisibilityChange = () => {
    if (document.hidden) {
  setTimeout(() => captureSnapshot("TAB_SWITCH"), 500);}

  };

  document.addEventListener("visibilitychange", onVisibilityChange);
  return () =>
    document.removeEventListener("visibilitychange", onVisibilityChange);
}, [started]);


  /* ================= TIMER ================= */
  useEffect(() => {
    if (!started) return;

    timerRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
  clearInterval(timerRef.current);

  // 🔥 MCQ AUTO SUBMIT
  if (section === "MCQ") {
    setSection("CODING");
    setQuestions(codingQuestions);
    setCurrentIndex(0);
    setTimeLeft(codingSectionTime);
    return codingSectionTime;
  }

  // 🔥 CODING AUTO SUBMIT (SAVE CODE)
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

  /* ================= QUESTION NAVIGATION (SECTION LOCK) ================= */
const goToQuestion = (index) => {
  if (index >= 0 && index < questions.length) {
    setCurrentIndex(index);
  }
};




  /* ================= COPY / PASTE BLOCK ================= */
  useEffect(() => {
    if (allowCopyPaste) return;

    const block = e => e.preventDefault();
    document.addEventListener("copy", block);
    document.addEventListener("paste", block);
    document.addEventListener("cut", block);

    return () => {
      document.removeEventListener("copy", block);
      document.removeEventListener("paste", block);
      document.removeEventListener("cut", block);
    };
  }, [allowCopyPaste]);

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

  const resetCode = () => {
    const q = questions[currentIndex];
    setCodeMap({ ...codeMap, [q.id]: "" });
    setCustomInput("");
    setOutput("");
    setError("");
    setResults([]);
  };

  /* ================= SUBMIT ================= */
  const submitTest = async () => {
    try {
      await axios.post(`${API}/test-env/${testId}/submit`, {
        student_id: localStorage.getItem("student_id"),
        // ✅ CRITICAL FIX
      answers: {
        ...codeMap,
        ...mcqAnswers
      },
        proctoring_snapshots: snapshots
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
  const isAnswered = (q) => {
  if (section === "MCQ") {
    return mcqAnswers[q.id] !== undefined;
  }
  return (codeMap[q.id] || "").trim().length > 0;
};

  const answeredCount = questions.filter(q => isAnswered(q)).length;
  const unansweredCount = questions.length - answeredCount;
  // ===== MCQ counts =====
  const totalMcqs = mcqQuestions.length;
  const answeredMcqs = mcqQuestions.filter(q => mcqAnswers[q.id] !== undefined).length;

// ===== Coding counts =====
  const totalCoding = codingQuestions.length;
  const answeredCoding = codingQuestions.filter(q => (codeMap[q.id] || "").trim().length > 0).length;

// ===== Combined =====
  const totalQuestionsAll = totalMcqs + totalCoding;
  const answeredAll = answeredMcqs + answeredCoding;
  const unansweredAll = totalQuestionsAll - answeredAll;

  

  /* ================= INSTRUCTIONS ================= */
  if (!started) {
    return (
      <div className="max-w-3xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-4">Test Details</h1>
        
        
        <p>MCQs: {totalMcqs}</p>
        <p>Coding Questions: {totalCoding}</p>
        <p>Total Questions: {totalQuestionsAll}</p>
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

  /* ================= UI (UNCHANGED) ================= */
  return (
    <div className="h-screen flex flex-col">
      {/* UI remains same as your existing layout */}
      {/* Only logic was fixed */}
      {/* 🔒 Hidden video for snapshot capture */}
      <video
  ref={videoRef}
  style={{ display: "none" }}
  playsInline
  muted
/>


      {/* ================= QUESTION PALETTE ================= */}
      <div className="flex gap-2 p-3 border-b">
        {questions.map((q, i) => (
  <button
    key={q.id}
    onClick={() => goToQuestion(i)}
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
<div
  className={`flex-1 ${
    section === "CODING" ? "grid grid-cols-2" : "flex justify-center"
  }`}
>

  {/* ================= MCQ SECTION ================= */}
        {section === "MCQ" && (
          <div className="p-6 w-full max-w-3xl">
            <h1 className="text-xl font-bold">Question {currentIndex + 1}</h1>
            <p className="mt-4 text-lg">{currentQuestion.question}</p>

            <div className="mt-6 space-y-3">
              {currentQuestion.options.map((opt, idx) => (
                <label key={idx} className="flex gap-3 items-center border p-3 rounded">
                  <input
                    type="radio"
                    disabled={section !== "MCQ"}   // ✅ ADD THIS LINE
                    checked={mcqAnswers[currentQuestion.id] === idx}
                    onChange={() =>
                      setMcqAnswers({ ...mcqAnswers, [currentQuestion.id]: idx })
                    }
                  />
                  {opt}
                </label>
              ))}
            </div>

            {/* NAVIGATION */}
            <div className="flex justify-between mt-6">
              <button
                disabled={currentIndex === 0}
                onClick={() => setCurrentIndex(i => i - 1)}
              >
                ← Prev
              </button>

              {currentIndex === mcqQuestions.length - 1 ? (
                <div className="flex gap-3">
                  <button
                    className="bg-red-600 text-white px-4 py-2 rounded"
                    onClick={() => setShowSummary(true)}
                  >
                    Submit
                  </button>
                  <button
                    className="bg-green-600 text-white px-4 py-2 rounded"
                    onClick={() => {
                      setSection("CODING");
                      setQuestions(codingQuestions);
                      setCurrentIndex(0);
                      setSectionLocked(true);
                      setTimeLeft(codingSectionTime);
                    }}
                  >
                    Proceed to Next Section →
                  </button>
                </div>
              ) : (
                <button onClick={() => setCurrentIndex(i => i + 1)}>Next →</button>
              )}
            </div>
          </div>
        )}


  {/* ================= CODING SECTION ================= */}
  {section === "CODING" && (
    <>
      {/* ================= QUESTION PANEL ================= */}
      <div className="p-6 overflow-y-auto space-y-6 border-r">
        <h1 className="text-2xl font-bold">
          {currentQuestion.title}
        </h1>

        <section>
          <h2 className="font-semibold">Problem Statement</h2>
          <p className="whitespace-pre-line">
            {currentQuestion.description}
          </p>
        </section>

        <section>
          <h2 className="font-semibold">Input Format</h2>
          <pre className="bg-gray-100 p-2">
            {currentQuestion.input_format}
          </pre>
        </section>

        <section>
          <h2 className="font-semibold">Output Format</h2>
          <pre className="bg-gray-100 p-2">
            {currentQuestion.output_format}
          </pre>
        </section>

        <section>
          <h2 className="font-semibold">Constraints</h2>
          <pre className="bg-gray-100 p-2">
            {currentQuestion.constraints}
          </pre>
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

  <button
  disabled={currentIndex === questions.length - 1}
  onClick={() => setCurrentIndex(i => i + 1)}
>
  Next →
</button>

  <button className="bg-red-600 text-white px-4 py-2 rounded" onClick={() => setShowSummary(true)}> Submit </button>

  
</div>


        </div>

    
    </>
  )}

  



        

        
        
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
          <b>Total Questions:</b> {totalQuestionsAll}
        </p>
        <p className="text-green-700">
          <b>Answered:</b> {answeredAll}
        </p>
        <p className="text-red-700">
          <b>Unanswered:</b> {unansweredAll}
        </p>
        <p>

        <p>
          <b>MCQ Section:</b> {answeredMcqs}/{totalMcqs}
        </p>

        <p>
          <b>Coding Section:</b> {answeredCoding}/{totalCoding}
        </p>


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


