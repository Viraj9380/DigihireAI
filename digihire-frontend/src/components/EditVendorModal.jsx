import React, { useState } from "react";
import { updateAssignmentMax } from "../services/api";

/**
 * Expecting assignment shape:
 * {
 *   id: <assignment id>,
 *   assessment_id: "...",
 *   assessment_name: "...",
 *   vendor_id: <vendor id>,
 *   vendor_name: "...",
 *   vendor_email: "...",
 *   max_candidates: <number>
 * }
 */
export default function EditVendorModal({ assignment, onClose, onUpdated }) {
  const [maxCandidates, setMaxCandidates] = useState(
    assignment?.max_candidates ?? 0
  );
  const [saving, setSaving] = useState(false);

  async function handleSave() {
    setSaving(true);
    try {
      // Backend schema requires:
      // {
      //   assessment_id: UUID,
      //   vendor_id: number,
      //   max_candidates: number
      // }
      const body = {
        assessment_id: assignment.assessment_id,
        vendor_id: assignment.vendor_id,
        max_candidates: Number(maxCandidates),
      };

      await updateAssignmentMax(body);

      if (onUpdated) await onUpdated();
      onClose();
    } catch (err) {
      console.error("Failed to update assignment", err);
      alert("Update failed. Check console for details.");
    } finally {
      setSaving(false);
    }
  }

  if (!assignment) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white w-full max-w-md rounded shadow-lg p-6">
        <h3 className="text-lg font-semibold mb-3">Edit Assignment</h3>

        <div className="text-sm text-gray-600 mb-4">
          <div>
            <strong>Assessment:</strong>{" "}
            {assignment.assessment_name || assignment.assessment_id}
          </div>
          <div>
            <strong>Vendor:</strong>{" "}
            {assignment.vendor_name} ({assignment.vendor_email})
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Max Candidates</label>
          <input
            type="number"
            className="w-full border rounded px-3 py-2"
            value={maxCandidates}
            onChange={(e) => setMaxCandidates(e.target.value)}
          />
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button
            className="px-4 py-2 rounded border"
            onClick={onClose}
            disabled={saving}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleSave}
            disabled={saving}
          >
            {saving ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}
