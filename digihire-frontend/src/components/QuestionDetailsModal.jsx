// src/components/QuestionDetailsModal.jsx
import React from "react";
import { X } from "lucide-react";

export default function QuestionDetailsModal({ question, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white w-full max-w-4xl rounded-lg shadow-lg p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">
            {question.title || "Question Details"}
          </h2>
          <button onClick={onClose}>
            <X />
          </button>
        </div>

        <Meta label="Difficulty" value={question.difficulty} />
        <Meta label="Type" value={question.type} />
        <Meta label="Technology" value={question.technology} />

        <Section title="Description" value={question.description} />
        <Section title="Input Format" value={question.input_format} />
        <Section title="Output Format" value={question.output_format} />
        <Section title="Constraints" value={question.constraints} />
        <Section title="Sample Input" value={question.sample_input} />
        <Section title="Sample Output" value={question.sample_output} />

        <div className="grid grid-cols-2 gap-4 mt-4 text-center">
          <Stat title="Attempted" value={question.attempted ? "Yes" : "No"} />
          <Stat title="Correct" value={question.correct ? "Yes" : "No"} />
        </div>

      </div>
    </div>
  );
}

function Section({ title, value }) {
  if (!value) return null;
  return (
    <div className="mb-4">
      <div className="font-medium mb-1">{title}</div>
      <div className="border rounded p-3 text-sm whitespace-pre-wrap">
        {value}
      </div>
    </div>
  );
}

function Meta({ label, value }) {
  if (!value) return null;
  return (
    <div className="text-sm text-gray-600 mb-1">
      <strong>{label}:</strong> {value}
    </div>
  );
}


function Stat({ title, value }) {
  return (
    <div className="border rounded p-3">
      <div className="text-sm text-gray-500">{title}</div>
      <div className="text-xl font-bold">{value}</div>
    </div>
  );
}