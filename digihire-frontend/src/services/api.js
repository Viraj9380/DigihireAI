//src/services/api.js
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";

const client = axios.create({
  baseURL: API_BASE,
  headers: { "Content-Type": "application/json" },
});

// ================= Vendors ==================

export async function fetchVendors() {
  const r = await client.get("/vendor/list");
  return r.data || [];
}

export async function assignVendorToAssessment(payload) {
  const r = await client.post("/vendor/assign", payload);
  return r.data;
}

export async function getAssignedVendors(assessment_id) {
  if (!assessment_id) return [];
  const r = await client.get(`/vendor/assigned/${assessment_id}`);
  return r.data || [];
}

// ================= Candidates ==================

export async function fetchCandidates() {
  const r = await client.get("/candidates/");
  return r.data || [];
}
export async function createMultipleCandidatess(rows) {
  const form = new FormData();

  rows.forEach((r) => {
    form.append("names", r.name || "");
    form.append("emails", r.email || "");
    form.append("phone_numbers", r.phone_number || "");
  });

  const res = await client.post("/candidates/", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data;
}

/**
 * uploadResumeMetadata
 * Notify backend (POST /candidates/upload) with candidate_id and resume_url via query params.
 * Backend handler expects candidate_id and resume_url (your UploadResumeModal uses this format).
 */
export const uploadResumeMetadata = async (candidateId, resumeUrl) => {
  const encodedUrl = encodeURIComponent(resumeUrl);
  const res = await fetch(`${API_BASE}/candidates/upload?candidate_id=${candidateId}&resume_url=${encodedUrl}`, {
    method: "POST",
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload metadata failed: ${res.status} ${text}`);
  }
  return res.json();
};

export async function deleteCandidate(id) {
  const res = await fetch(`http://127.0.0.1:8000/candidates/${id}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error("Failed to delete candidate");
  }

  return true;
}
export async function uploadResume(candidateId, file) {
  const form = new FormData();
  form.append("file", file);

  const r = await client.post(`/candidate/${candidateId}/upload`, form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return r.data;
}

export async function compareResume(candidateId) {
  const r = await client.post(`/candidate/${candidateId}/compare`);
  return r.data;
}



// ================= Assessments ==================

export async function getAssessments() {
  const r = await client.get("/assessments/");
  return r.data || [];
}


//----------------------------------------------------------------//
/** Get all vendors with assigned assessments */



export async function fetchAllAssignments(assessment_id) {
  if (!assessment_id) return [];
  const r = await client.get(`/vendor/assigned/${assessment_id}`);
  return r.data || [];
}
export async function fetchAssignedVendors() {
  const r = await client.get("/vendor/assigned");
  return r.data || [];
}
/**
 * Fetch all vendors (use existing vendor list endpoint) and assigned rows for a specific assessment,
 * then return vendors that are NOT assigned to that assessment.
 * Uses:
 *  - GET /vendor/list
 *  - GET /vendor/assigned/{assessment_id}
 */
export async function fetchUnassignedVendorsForAssessment(assessmentId) {
  if (!assessmentId) return [];

  const [vendorsR, assignedR] = await Promise.all([
    client.get("/vendor/list"),
    client.get(`/vendor/assigned/${assessmentId}`)
  ]);

  const vendors = vendorsR.data || [];
  const assigned = assignedR.data || [];

  const assignedVendorIds = new Set((assigned || []).map(a => a.vendor_id));
  return vendors.filter(v => !assignedVendorIds.has(v.id));
}

/**
 * Assign vendor to assessment.
 * Backend expected: POST /vendor/assign with payload { assessment_id, vendor_id, max_candidates }
 */
export async function assignVendorToAssessment2(payload) {
  const r = await client.post("/vendor/assign", payload);
  return r.data;
}

/**
 * Update assignment's max_candidates.
 * Backend expected: PUT /vendor/update-max/{assignment_id} with body { max_candidates }
 * NOTE: if your backend uses a different endpoint (e.g. /vendor/update/{assignment_id}), change the URL here.
 */
export async function updateAssignmentMax(body) {
  const r = await client.put("/vendor/edit", body);
  return r.data;
}

// DELETE /vendor/delete/{assessment_id}/{vendor_id}
export async function deleteAssignment(assessmentId, vendorId) {
  const r = await client.delete(`/vendor/delete/${assessmentId}/${vendorId}`);
  return r.data;
}



