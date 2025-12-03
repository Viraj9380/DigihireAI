// src/api.js
import axios from "axios";
const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8000";
const client = axios.create({ baseURL: API_BASE, headers: { "Content-Type": "application/json" } });

export async function fetchAssessments(){ const r = await client.get("/assessments/"); return r.data; }
export async function createAssessment(payload){ const r = await client.post("/assessments/", payload); return r.data; }
export async function updateAssessment(id, payload){ const r = await client.put(`/assessments/${id}`, payload); return r.data; }
export async function deleteAssessment(id){ const r = await client.delete(`/assessments/${id}`); return r.data; }

export async function fetchVendors(){ const r = await client.get("/vendor-module/vendors/"); return r.data; }
export async function assignVendor(payload){ const r = await client.post("/vendor-module/assign/", payload); return r.data; }

export async function fetchCandidates(){ const r = await client.get("/candidates/"); return r.data; }
export async function createCandidates(payloadList){ const r = await client.post("/candidates/", payloadList); return r.data; }
export async function uploadResume(candidate_id, file){
  const form = new FormData(); form.append("candidate_id", candidate_id); form.append("file", file);
  const r = await axios.post(`${API_BASE}/upload_resume/`, form, { headers: { "Content-Type": "multipart/form-data" }});
  return r.data;
}
