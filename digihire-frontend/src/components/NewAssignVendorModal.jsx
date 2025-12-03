// src/components/NewAssignVendorModal.jsx
import React, { useEffect, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import {
  fetchUnassignedVendorsForAssessment,
  assignVendorToAssessment2,
} from "../services/api";
import "./../styles/app.css";

export default function NewAssignVendorModal({
  open,
  onClose,
  onAssigned,
  assessmentId,     // ✅ passed directly from VendorsPage
}) {
  const [vendors, setVendors] = useState([]);
  const [vendorId, setVendorId] = useState("");
  const [maxCandidates, setMaxCandidates] = useState(5);
  const [loading, setLoading] = useState(false);

  // Load vendors ONLY for the selected assessment
  useEffect(() => {
    if (!open || !assessmentId) return;
    loadUnassignedVendors(assessmentId);
  }, [open, assessmentId]);

  async function loadUnassignedVendors(aid) {
    try {
      const list = await fetchUnassignedVendorsForAssessment(aid);
      setVendors(list || []);
      setVendorId("");
    } catch (err) {
      console.error("Failed to load unassigned vendors", err);
      setVendors([]);
    }
  }

  async function handleAssign() {
    if (!assessmentId) return alert("Missing assessment ID.");
    if (!vendorId) return alert("Please select a vendor.");

    setLoading(true);
    try {
      await assignVendorToAssessment2({
        assessment_id: assessmentId,
        vendor_id: Number(vendorId),
        max_candidates: Number(maxCandidates),
      });

      if (onAssigned) await onAssigned();
      onClose();
    } catch (err) {
      console.error("Assign failed", err);
      alert("Assignment failed. Check console.");
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-lg rounded-lg shadow-xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Assign Vendor</h3>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Assessment name removed — we already know which assessment we are assigning */}

        <div className="space-y-4">

          <div>
            <label className="block text-sm font-medium mb-1">
              Vendor (not assigned yet)
            </label>
            <select
              className="w-full border rounded px-3 py-2"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
            >
              <option value="">-- choose vendor --</option>
              {vendors.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.vendor_name} ({v.email})
                </option>
              ))}
            </select>
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

        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button className="px-4 py-2 rounded border" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={handleAssign}
            disabled={loading}
          >
            {loading ? "Assigning..." : "Assign Vendor"}
          </button>
        </div>
      </div>
    </div>
  );
}
