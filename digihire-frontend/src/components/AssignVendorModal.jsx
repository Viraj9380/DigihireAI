// src/components/AssignVendorModal.jsx
import React, { useEffect, useState } from "react";
import { fetchVendors, assignVendorToAssessment, getAssignedVendors } from "../services/api";
import { XMarkIcon } from "@heroicons/react/24/outline";
import "./../styles/app.css";

export default function AssignVendorModal({ open, onClose, assessment, onAssigned }) {
  const [vendors, setVendors] = useState([]);
  const [vendorId, setVendorId] = useState("");
  const [maxCandidates, setMaxCandidates] = useState(5);
  const [assignedCount, setAssignedCount] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    loadVendors();
    loadAssignedCount();
  }, [open, assessment]);

  const loadVendors = async () => {
    try {
      const v = await fetchVendors();
      setVendors(v || []);
    } catch (e) {
      setVendors([]);
    }
  };

  const loadAssignedCount = async () => {
    if (!assessment) return;
    const aid = assessment.assessment_id || assessment.id;
    try {
      const rows = await getAssignedVendors(aid);
      setAssignedCount(Array.isArray(rows) ? rows.length : 0);
    } catch {
      setAssignedCount(0);
    }
  };

  const handleAssign = async () => {
    if (!vendorId) return alert("Select a vendor");

    const aid = assessment?.assessment_id || assessment?.id;
    if (!aid) return alert("Assessment ID missing");

    setLoading(true);
    try {
      await assignVendorToAssessment({
        assessment_id: aid,
        vendor_id: Number(vendorId),
        max_candidates: Number(maxCandidates)
      });

      if (onAssigned) onAssigned();
      onClose();
    } catch (e) {
      alert("Failed to assign vendor");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-white w-full max-w-md rounded-xl shadow-xl p-6 animate-scaleIn">
        
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-semibold">Assign Vendor</h3>
          <button onClick={onClose}>
            <XMarkIcon className="w-6 h-6 text-gray-600 hover:text-black" />
          </button>
        </div>

        <div className="text-sm text-gray-600 mb-4 space-y-1">
          <div><strong>Assessment:</strong> {assessment?.job_role}</div>
          <div><strong>Currently Assigned:</strong> {assignedCount}</div>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium">Vendor</label>
            <select
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring focus:ring-blue-300"
              value={vendorId}
              onChange={(e) => setVendorId(e.target.value)}
            >
              <option value="">Select vendor...</option>
              {vendors.map(v => (
                <option key={v.id} value={v.id}>
                  {v.vendor_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-sm font-medium">Max candidates</label>
            <input
              type="number"
              className="w-full border rounded-lg px-3 py-2 mt-1 focus:ring focus:ring-blue-300"
              value={maxCandidates}
              onChange={(e) => setMaxCandidates(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3 mt-6">
          <button className="px-4 py-2 rounded-lg border hover:bg-gray-100" onClick={onClose}>
            Cancel
          </button>
          <button
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
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
