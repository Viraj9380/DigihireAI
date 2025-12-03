// src/components/AssessmentSelector.jsx
import React from "react";

export default function AssessmentSelector({ assessments = [], value, onChange }) {
  return (
    <div>
      <label className="block text-sm font-medium mb-1">Select Assessment</label>
      <select
        className="w-full border rounded px-3 py-2 bg-white"
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
      >
        <option value="">— choose an assessment —</option>

        {assessments.map((a) => {
          // ✅ reliably extract assessment ID
          const id =
            a.assessment_id ||
            a.id ||
            a.assessmentId;

          // ✅ reliable display name
          const title =
            a.title ||
            a.job_role ||
            "Untitled";

          return (
            <option key={id} value={id}>
              {title}
            </option>
          );
        })}
      </select>
    </div>
  );
}
