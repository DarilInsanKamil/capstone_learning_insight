import React from "react";

export default function LearningTargetChart({ user }) {
  if (!user) return null;

  const chartData = [
    { name: "Tutorial Completion", value: (user.tutorial_completion_rate || 0) * 100 },
    { name: "Submission Success", value: (user.submission_success_rate || 0) * 100 },
    { name: "Materials Completed", value: Math.min((user.total_material_completed || 0) * 10, 100) },
  ];

  return (
    <div className="learning-target-chart">
      <div className="chart-data">
        {chartData.map((item, idx) => (
          <div key={idx} className="chart-item">
            <span className="chart-label">{item.name}</span>
            <div className="chart-bar">
              <div className="chart-fill" style={{ width: `${item.value}%` }}></div>
            </div>
            <span className="chart-value">{item.value.toFixed(1)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}