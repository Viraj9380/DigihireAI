import React from "react";

export default function AddMcqSourceModal({
  onClose,
  onMyMcqs,
  onDigiHire
}) {
  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white p-6 rounded w-96">
        <h2 className="text-lg font-semibold mb-4">Add MCQ Questions</h2>

        <div className="space-y-3">
          <button
            onClick={onMyMcqs}
            className="w-full border px-4 py-2 rounded"
          >
            My MCQs
          </button>

          <button
            onClick={onDigiHire}
            className="w-full border px-4 py-2 rounded"
          >
            DigiHire MCQs
          </button>
        </div>

        <div className="text-right mt-4">
          <button
            onClick={onClose}
            className="text-sm text-gray-500"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
