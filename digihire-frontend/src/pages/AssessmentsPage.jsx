import React, { useEffect, useState } from "react";
import { getAssessments, getAssignedVendors } from "../services/api";
import "./../styles/app.css";
import { FaEye, FaEdit, FaTrash, FaUserPlus } from "react-icons/fa";
import ViewAssessmentModal from "../components/ViewAssessmentModal";
import { useNavigate } from "react-router-dom";

export default function AssessmentsPage() {
  const [assessments, setAssessments] = useState([]);
  const [assignedCounts, setAssignedCounts] = useState({});
  const [loading, setLoading] = useState(true);
  const [viewOpen, setViewOpen] = useState(false);
  const [selectedAssessment, setSelectedAssessment] = useState(null);

  const navigate = useNavigate();

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    try {
      const data = await getAssessments();
      setAssessments(data || []);

      for (const a of data) {
        const vendors = await getAssignedVendors(a.id || a.assessment_id);
        setAssignedCounts((prev) => ({
          ...prev,
          [a.id || a.assessment_id]: vendors.length,
        }));
      }
    } catch (e) {
      console.error(e);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔥 NEW — redirect with assessment_id
  const handleAssign = (assessment) => {
    const id = assessment.assessment_id || assessment.id;
    navigate("/vendor/" + id);
  };

  const handleView = (assessment) => {
    setSelectedAssessment(assessment);
    setViewOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Assessments</h2>
        <button
          className="flex items-center gap-2 px-3 py-2 border rounded hover:bg-gray-100 transition"
          onClick={load}
        >
          Refresh
        </button>
      </div>

      {loading && <div className="text-gray-500">Loading assessments...</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((a) => (
          <div
            key={a.id || a.assessment_id}
            className="bg-white p-5 rounded-lg shadow hover:shadow-md transition"
          >
            <h3 className="text-lg font-semibold mb-1">{a.job_role}</h3>

            <p className="text-gray-600 text-sm mb-3 line-clamp-2">
              {a.job_description}
            </p>

            <div className="flex justify-between items-center mt-3">
              <button
                className="text-gray-600 hover:text-black text-sm flex items-center gap-1"
                onClick={() => handleView(a)}
              >
                <FaEye /> View
              </button>

              <button className="text-yellow-600 hover:text-yellow-700 text-sm flex items-center gap-1">
                <FaEdit /> Edit
              </button>

              <button className="text-red-600 hover:text-red-700 text-sm flex items-center gap-1">
                <FaTrash /> Delete
              </button>

              {/* 🔥 Updated Assign */}
              <button
                className="text-sky-600 hover:text-sky-700 text-sm flex items-center gap-1"
                onClick={() => handleAssign(a)}
              >
                <FaUserPlus /> Assign
              </button>
            </div>
          </div>
        ))}
      </div>

      <ViewAssessmentModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        assessment={selectedAssessment}
        assignedCount={
          selectedAssessment
            ? assignedCounts[selectedAssessment.id || selectedAssessment.assessment_id]
            : 0
        }
      />
    </div>
  );
}
