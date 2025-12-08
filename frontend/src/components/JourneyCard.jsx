import { useState } from "react";
import "../style/journeyCard.css";

const getDifficultyLabel = (difficulty) => {
  const labels = { 0: "Easy", 1: "Medium", 2: "Hard" };
  return labels[difficulty] || difficulty;
};

export default function JourneyCard({ data }) {
  const [selectedJourney, setSelectedJourney] = useState(null);

  if (!data || data.length === 0) {
    return <div className="journey-empty">No journeys available</div>;
  }

  return (
    <div className="journey-layout">
      <div className="journey-cards-container">
        {data.map((journey, i) => (
          <div
            key={i}
            className={`journey-card-item ${selectedJourney?.id === journey.id ? "active" : ""}`}
            onClick={() => setSelectedJourney(journey)}
          >
            <div className="journey-card-body">
              <h3 className="journey-card-title">{journey.name}</h3>
              <p className="journey-card-summary">{journey.summary}</p>
              <div className="journey-card-footer">
                <span className={`journey-difficulty difficulty-${journey.difficulty}`}>
                  {getDifficultyLabel(journey.difficulty)}
                </span>
                <span className="journey-hours">{journey.hours_to_study || "N/A"} hours</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      {selectedJourney && (
        <div className="journey-detail-panel">
          <div className="detail-header">
            <h2>{selectedJourney.name}</h2>
            <span className={`status-badge ${selectedJourney.status === "enrolled" ? "enrolled" : "available"}`}>
              {selectedJourney.status === "enrolled" ? "Enrolled" : "Available"}
            </span>
          </div>

          <div className="detail-content">
            <div className="detail-section">
              <h4>Description</h4>
              <p>{selectedJourney.summary}</p>
            </div>

            <div className="detail-section">
              <h4>Journey Details</h4>
              <div className="detail-grid">
                <div className={`detail-item difficulty-row difficulty-${selectedJourney.difficulty}`}>
                  <span className="label">Difficulty</span>
                  <span className={`value difficulty`}>
                    {getDifficultyLabel(selectedJourney.difficulty)}
                  </span>
                </div>
                <div className="detail-item">
                  <span className="label">Duration</span>
                  <span className="value">{selectedJourney.hours_to_study || "N/A"} hours</span>
                </div>
              </div>
            </div>

            {selectedJourney.status === "enrolled" && (
              <div className="detail-section">
                <h4>Your Progress</h4>
                <div className="progress-grid">
                  <div className="progress-item">
                    <span className="label">Study Duration</span>
                    <span className="value">{selectedJourney.study_duration?.toFixed(2) || 0} hours</span>
                  </div>
                  <div className="progress-item">
                    <span className="label">Rating</span>
                    <span className="value">{selectedJourney.avg_submission_rating?.toFixed(1) || "N/A"}/5</span>
                  </div>
                  <div className="progress-item">
                    <span className="label">Enrollments</span>
                    <span className="value">{selectedJourney.enrolling_times || 0}</span>
                  </div>
                </div>
              </div>
            )}

            <button className={`action-btn ${selectedJourney.status}`}>
              {selectedJourney.status === "enrolled" ? "Continue Learning" : "Enroll Now"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
