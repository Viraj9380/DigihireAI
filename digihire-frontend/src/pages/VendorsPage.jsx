// src/pages/VendorsPage.jsx
import React, { useEffect, useState } from "react";
import { getAssessments, getAssignedVendors } from "../services/api";
import NewAssignVendorModal from "../components/NewAssignVendorModal";
import EditVendorModal from "../components/EditVendorModal";
import { FaEdit, FaTrash, FaUserPlus } from "react-icons/fa";
import { deleteAssignment } from "../services/api";
import { useParams } from "react-router-dom";

export default function VendorsPage() {
  const { assessmentId } = useParams(); // ✅ get assessment id from URL
  const [assignments, setAssignments] = useState([]);
  const [assessMap, setAssessMap] = useState({});
  const [openAssign, setOpenAssign] = useState(false);
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadAll();
  }, [assessmentId]);

  async function loadAll() {
    setLoading(true);
    try {
      // Load assessments → for name lookup
      const assessments = await getAssessments();
      const map = {};

      (assessments || []).forEach((a) => {
        const id = a.assessment_id || a.id;
        map[id] = a.job_role || a.title || "Unknown Role";
      });

      setAssessMap(map);

      // Load assigned vendors only for **selected assessment**
      if (!assessmentId) {
        setAssignments([]);
        setLoading(false);
        return;
      }

      const vendors = await getAssignedVendors(assessmentId);

      const normalized = (vendors || []).map((v) => ({
        id: v.id,
        assessment_id: assessmentId,
        assessment_name: map[assessmentId],
        vendor_id: v.vendor_id,
        vendor_name: v.vendor_name,
        vendor_email: v.vendor_email,
        max_candidates: Number(v.max_candidates ?? 0),
        assigned_at: v.assigned_at,
      }));

      setAssignments(normalized);
    } catch (err) {
      console.error("Failed to load vendors/assignments", err);
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(aid, vid) {
    if (!window.confirm("Delete this vendor assignment?")) return;

    try {
      await deleteAssignment(aid, vid);
      loadAll();
    } catch (err) {
      console.error("Delete failed", err);
      alert("Delete failed.");
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Vendors Assigned</h2>
          <p className="text-gray-600">
            Showing vendors assigned to this assessment.
          </p>
        </div>

        <button
          onClick={() => setOpenAssign(true)}
          className="px-3 py-2 bg-blue-600 text-white rounded flex items-center gap-2"
        >
          <FaUserPlus /> Assign
        </button>
      </div>

      <div className="overflow-x-auto bg-white rounded shadow">
        <table className="min-w-full text-sm">
          <thead className="bg-gray-100 text-gray-700">
            <tr>
              <th className="px-4 py-3 text-left">Vendor</th>
              <th className="px-4 py-3 text-left">Email</th>

              {/* ✅ NEW COLUMN */}
              <th className="px-4 py-3 text-left">Max Candidates</th>

              <th className="px-4 py-3 text-center">Edit</th>
              <th className="px-4 py-3 text-center">Delete</th>
            </tr>
          </thead>

          <tbody>
            {assignments.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-gray-500">
                  {loading ? "Loading..." : "No assigned vendors found"}
                </td>
              </tr>
            )}

            {assignments.map((row) => (
              <tr key={row.id} className="border-b hover:bg-gray-50">
                <td className="px-4 py-3">{row.vendor_name}</td>
                <td className="px-4 py-3">{row.vendor_email}</td>

                {/* ✅ SHOW CURRENT MAX CANDIDATES */}
                <td className="px-4 py-3">{row.max_candidates}</td>

                <td className="px-4 py-3 text-center">
                  <button
                    className="p-2 hover:bg-gray-100 rounded"
                    onClick={() => setEditing(row)}
                  >
                    <FaEdit className="text-green-600" />
                  </button>
                </td>

                <td className="px-4 py-3 text-center">
                  <button
                    className="p-2 hover:bg-red-100 rounded"
                    onClick={() => handleDelete(row.assessment_id, row.vendor_id)}
                  >
                    <FaTrash className="text-red-600" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {openAssign && (
        <NewAssignVendorModal
          open={openAssign}
          assessmentId={assessmentId} // pass the selected assessment
          onClose={() => setOpenAssign(false)}
          onAssigned={loadAll}
        />
      )}

      {editing && (
        <EditVendorModal
          assignment={editing}
          onClose={() => setEditing(null)}
          onUpdated={loadAll}
        />
      )}
    </div>
  );
}
