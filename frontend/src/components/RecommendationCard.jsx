import React from "react";

export default function RecommendationCard({ recommendation, learningLabel }) {
  return (
    <div className="recommend-card">
      <div className="recommend-left">
        <span className="recommend-label">{learningLabel}</span>
      </div>

      <div className="recommend-right">
        <h3 className="recommend-title">Rekomendasi Belajar</h3>
        <p className="recommend-text">{recommendation}</p>
      </div>
    </div>
  );
}