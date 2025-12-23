// src/pages/AssessmentsPage.jsx
import React, { useEffect, useState } from "react";
import { getAssessments, getAssignedVendors } from "../services/api";
import { FaEye, FaEdit, FaTrash, FaUserPlus, FaCode } from "react-icons/fa";
import ViewAssessmentModal from "../components/ViewAssessmentModal";
import { useNavigate } from "react-router-dom";
import "../styles/app.css";

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
      for (const a of data || []) {
        const id = a.assessment_id || a.id;
        const vendors = await getAssignedVendors(id);
        setAssignedCounts(prev => ({ ...prev, [id]: vendors.length }));
      }
    } catch (e) {
      console.error(e);
      setAssessments([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAssign = (assessment) => {
    const id = assessment.assessment_id || assessment.id;
    navigate(`/vendor/${id}`);
  };

  const handleCreateCodingTest = (assessment) => {
    const id = assessment.assessment_id || assessment.id;
    navigate(`/coding-assessment/${id}`);
  };

  const handleView = (assessment) => {
    setSelectedAssessment(assessment);
    setViewOpen(true);
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-semibold">Assessments</h2>
        <div>
          <button className="px-3 py-2 border rounded" onClick={load}>Refresh</button>
        </div>
      </div>

      {loading && <div className="text-gray-500">Loading assessments...</div>}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {assessments.map((a) => {
          const id = a.assessment_id || a.id;
          return (
            <div key={id} className="bg-white p-5 rounded-lg shadow hover:shadow-md transition">
              <h3 className="text-lg font-semibold mb-1">{a.job_role}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-2">{a.job_description}</p>

              <div className="flex justify-between items-center text-xs text-gray-700">
                <span>⏱ {a.duration} mins</span>
                <span>👥 Max {a.max_candidates ?? 0}</span>
              </div>

              <div className="flex justify-between items-center mt-4">
                <button className="text-gray-600 hover:text-black text-sm flex items-center gap-1" onClick={() => handleView(a)}>
                  <FaEye /> View
                </button>
                <div className="flex gap-2">
                  <button className="text-blue-600 hover:text-blue-700 text-sm flex items-center gap-1" onClick={() => handleAssign(a)}>
                    <FaUserPlus /> Assign
                  </button>
                  <button className="text-purple-600 hover:text-purple-700 text-sm flex items-center gap-1" onClick={() => handleCreateCodingTest(a)}>
                    <FaCode /> Coding Test
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <ViewAssessmentModal
        open={viewOpen}
        onClose={() => setViewOpen(false)}
        assessment={selectedAssessment}
        assignedCount={ selectedAssessment ? assignedCounts[selectedAssessment.assessment_id || selectedAssessment.id] : 0 }
      />
    </div>
  );
}
