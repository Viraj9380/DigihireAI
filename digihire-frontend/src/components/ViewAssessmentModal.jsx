import React from "react";

export default function ViewAssessmentModal({ open, onClose, assessment, assignedCount }) {
  if (!open || !assessment) return null;

  // Determine progress values
  const completed = assessment.completed_questions || 0;
  const total = assessment.total_questions || 0;

  // Avoid divide-by-zero
  const progressPercent = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white w-full max-w-lg p-6 rounded-lg shadow-lg space-y-4">
        <h2 className="text-xl font-semibold">{assessment.job_role}</h2>

        <div>
          <p className="text-sm text-gray-700 whitespace-pre-line">
            {assessment.job_description}
          </p>
        </div>

        <div className="text-sm text-gray-800 space-y-1">
          <p><strong>Duration:</strong> {assessment.duration} mins</p>
          <p><strong>Required Experience:</strong> {assessment.work_experience}</p>

          {assessment.total_questions && (
            <p><strong>Total Questions:</strong> {assessment.total_questions}</p>
          )}

          {assessment.skills && (
            <p><strong>Skills:</strong> {assessment.skills}</p>
          )}

          <p><strong>Assigned Vendors:</strong> {assignedCount}</p>
        </div>

        {/* ✅ Progress Bar Section */}
        <div className="mt-4">
          <p className="text-sm font-medium text-gray-700 mb-1">
            {completed}/{total} Completed
          </p>

          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className="bg-green-500 h-3 transition-all"
              style={{ width: `${progressPercent}%` }}
            ></div>
          </div>
        </div>

        <div className="flex justify-end">
          <button
            className="px-4 py-2 bg-gray-800 text-white rounded hover:bg-black transition"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}
