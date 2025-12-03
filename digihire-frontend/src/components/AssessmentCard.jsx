import React from "react";

export default function AssessmentCard({ assessment }) {
  return (
    <div className="assessment-card">
      <div className="card-header">
        <h3 className="card-title">{assessment.title}</h3>
        <span className={`badge ${assessment.status.toLowerCase()}`}>
          {assessment.status}
        </span>
      </div>

      <p className="card-description">{assessment.description}</p>

      <div className="card-meta">
        <span>⏱ {assessment.duration} min</span>
        <span>👥 {assessment.candidates} candidates</span>
        <span>📅 {assessment.date}</span>
      </div>

      <div className="card-actions">
        <button className="btn view">View</button>
        <button className="btn edit">Edit</button>
        <button className="btn delete">Delete</button>
      </div>
    </div>
  );
}
