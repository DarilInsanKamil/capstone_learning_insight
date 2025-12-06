import React, { useState, useEffect } from "react";
import "../style/learningTracker.css";

const LearningActivityTracker = () => {
  const [selectedDate, setSelectedDate] = useState(null);
  const [activityData, setActivityData] = useState({});
  const [loading, setLoading] = useState(true);

  const today = new Date();
  const currentMonth = today.getMonth();
  const currentYear = today.getFullYear();

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  useEffect(() => {
    fetchTrackerData();
  }, []);

  const fetchTrackerData = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/tracker`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();

      if (response.ok && data.data) {
        const formattedData = {};
        data.data.forEach((activity) => {
          const date = new Date(activity.date);
          if (
            date.getMonth() === currentMonth &&
            date.getFullYear() === currentYear
          ) {
            const day = date.getDate();
            formattedData[day] = {
              materials: activity.materials || 0,
              studyTime: activity.studyTime || 0,
              tutorialCompletion: activity.tutorialCompletion || 0,
              submissionRating: activity.submissionRating || 0,
              submissionSuccess: activity.submissionSuccess || 0,
            };
          }
        });
        setActivityData(formattedData);
      }
    } catch (err) {
      console.error("Error fetching tracker:", err);
    } finally {
      setLoading(false);
    }
  };



  const getDaysInMonth = (month, year) =>
    new Date(year, month + 1, 0).getDate();
  const daysInMonth = getDaysInMonth(currentMonth, currentYear);

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const calendarDays = Array(firstDayOfMonth)
    .fill(null)
    .concat(Array.from({ length: daysInMonth }, (_, i) => i + 1));

  const weeks = [];
  for (let i = 0; i < calendarDays.length; i += 7) {
    weeks.push(calendarDays.slice(i, i + 7));
  }

  const handleDayClick = (day) => {
    if (day && activityData[day]) {
      setSelectedDate(day);
    }
  };

  const selectedActivity = activityData[selectedDate];

  if (loading) return <div className="loading">Loading tracker data...</div>;

  return (
    <div className="activity-tracker-container-in-dashboard">
      <div className="calendar-card-activity">
        <div className="calendar-header-activity">
          <h3 className="tracker-title-activity">
            {today.toLocaleString("default", { month: "long" })} {currentYear}
          </h3>
        </div>

        <div className="calendar-grid-activity">
          <div className="week-row header">
            {weekdays.map((day) => (
              <div key={day} className="calendar-day header-day">
                {day}
              </div>
            ))}
          </div>

          {weeks.map((week, i) => (
            <div key={i} className="week-row">
              {week.map((day, idx) => {
                const hasActivity = !!activityData[day];
                const isActiveDay = selectedDate === day;

                return (
                  <div
                    key={idx}
                    className={`calendar-day day-cell-activity ${
                      day ? "has-day-activity" : "empty-cell-activity"
                    } ${isActiveDay ? "selected-activity" : ""} ${
                      hasActivity ? "clickable-day" : ""
                    }`}
                    onClick={() => handleDayClick(day)}
                  >
                    {day && <div className="day-number-activity">{day}</div>}
                    {day && (
                      <div className="daily-checkin-text-activity">
                        Activity Tracker
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      <div className="detail-panel-wrapper-activity">
        <div className="detail-panel-activity-content">
          <div className="detail-panel-header">
            <h4>Activity Tracker Detail</h4>
            <button
              className="close-detail-button-x"
              onClick={() => setSelectedDate(null)}
            >
              &times;
            </button>
          </div>

          {selectedDate && selectedActivity ? (
            <div className="detail-form-section">
              <label className="form-label-activity">Selected Date</label>
              <div className="date-display-activity">
                {new Date(
                  currentYear,
                  currentMonth,
                  selectedDate
                ).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "short",
                  day: "2-digit",
                  year: "numeric",
                })}
              </div>

              <label className="form-label-activity">Learning Metrics</label>
              <div className="metrics-display-box">
                <p>
                  Materials Completed: <span>{selectedActivity.materials}</span>
                </p>
                <p>
                  Study Time: <span>{selectedActivity.studyTime} jam</span>
                </p>
                <p>
                  Tutorial Completion:{" "}
                  <span>{selectedActivity.tutorialCompletion}%</span>
                </p>
                <p>
                  Submission Rating:{" "}
                  <span>{selectedActivity.submissionRating} / 5</span>
                </p>
                <p>
                  Submission Success:{" "}
                  <span>{selectedActivity.submissionSuccess}%</span>
                </p>
              </div>
            </div>
          ) : (
            <div className="detail-placeholder-side">
              <p>Select a date to view activity details</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default LearningActivityTracker;
