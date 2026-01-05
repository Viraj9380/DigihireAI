import React, { useState } from "react";
export default function AddQuestionsModal({ onClose, onProceed }) {
  const [library, setLibrary] = useState("digiHire");
  const [type, setType] = useState("coding");

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center">
      <div className="bg-white w-[500px] rounded p-6">
        <h2 className="text-lg font-semibold mb-4">Add Questions</h2>

        <p className="text-sm font-medium mb-1">
          Which Questions Library would you like to use?
        </p>
        <label>
          <input
            type="radio"
            checked={library === "digiHire"}
            onChange={() => setLibrary("digiHire")}
          /> DigiHire
        </label>
        <br />
        <label>
          <input
            type="radio"
            checked={library === "myQuestions"}
            onChange={() => setLibrary("myQuestions")}
          /> My Questions
        </label>

        <p className="text-sm font-medium mt-4 mb-1">
          Which type of questions?
        </p>
        <select
          className="w-full border p-2 rounded"
          value={type}
          onChange={(e) => setType(e.target.value)}
        >
          <option value="coding">Coding</option>
          <option value="mcq">MCQ</option>
        </select>

        <div className="flex justify-end mt-6 gap-2">
          <button onClick={onClose} className="border px-4 py-1 rounded">
            Cancel
          </button>
          <button
            onClick={() => onProceed({ library, type })}
            className="bg-orange-500 text-white px-4 py-1 rounded"
          >
            Proceed to Select Questions
          </button>
        </div>
      </div>
    </div>
  );
}
