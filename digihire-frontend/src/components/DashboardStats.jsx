import React from "react";

export default function DashboardStats({ assessments }) {
  const total = assessments.length;
  const draft = assessments.filter(a => a.status === "Draft").length;
  const published = assessments.filter(a => a.status === "Published").length;
  const closed = assessments.filter(a => a.status === "Closed").length;

  return (
    <div className="stats-row">
      <div className="stat-box">
        <h4>Total Assessments</h4>
        <p>{total}</p>
      </div>
      <div className="stat-box">
        <h4>Published</h4>
        <p>{published}</p>
      </div>
      <div className="stat-box">
        <h4>Draft</h4>
        <p>{draft}</p>
      </div>
      <div className="stat-box">
        <h4>Closed</h4>
        <p>{closed}</p>
      </div>
    </div>
  );
}
