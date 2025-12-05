import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import RecommendationCard from "../components/RecommendationCard";
import ProfileCard from "../components/ProfileCard";
import Header from "../components/Header";
import LearningTargetChart from "../components/LearningTargetChart";
import LearningActivityTracker from "./LearningActivityTracker";
import "../style/dashboard.css";

const MENU_ITEMS = {
  INSIGHT: "Learning Insight",
  TRACKER: "Learning Tracker",
  JOURNEY: "Journey",
};

export default function Dashboard() {
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [insight, setInsight] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [activeMenu, setActiveMenu] = useState(MENU_ITEMS.INSIGHT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchInsightData();
  }, []);

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(`${import.meta.env.VITE_API_URL}/users/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        setUser(data.data.user);
        if (data.data.user.image_path) {
          setProfileImage(data.data.user.image_path);
        }
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const fetchInsightData = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(`${import.meta.env.VITE_API_URL}/insight/generate`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await response.json();
      if (response.ok) {
        setInsight(data.data);
      }
    } catch (err) {
      console.error("Error fetching insight:", err);
    } finally {
      setLoading(false);
    }
  };

  function handlePhotoUpload(e) {
    const file = e.target.files[0];
    if (file) setProfileImage(URL.createObjectURL(file));
  }

  const renderMainContent = () => {
    if (!insight) return <div>Loading insight data...</div>;

    if (activeMenu === MENU_ITEMS.INSIGHT) {
      return (
        <>
          <div className="top-row">
            <div className="recommendation-full">
              <RecommendationCard
                recommendation={insight.recommendation}
                learningLabel={insight.learning_label}
              />
            </div>
          </div>

          <div className="metrics-layout">
            <div className="card materials-card">
              <h3 className="section-title">Materials & Progress</h3>

              <div className="materials-number">
                <span className="big-number">{insight.metrics?.total_material_completed || 0}</span>
                <span className="big-number-label">Total Materials Completed</span>
              </div>

              <ul className="materials-list">
                <li>
                  <span>Materials / day:</span>
                  <span>{(insight.metrics?.materialsPerDay || 0).toFixed(2)}</span>
                </li>
                <li>
                  <span>Avg tutorial duration (jam):</span>
                  <span>{(insight.metrics?.avg_tutorial_duration || 0).toFixed(2)}</span>
                </li>
                <li>
                  <span>Study time per material:</span>
                  <span>{(insight.metrics?.study_time_per_material || 0).toFixed(2)}</span>
                </li>
                <li>
                  <span>Tutorial completion:</span>
                  <div className="progress">
                    <div
                      className="progress-bar tutorial"
                      style={{ width: `${(insight.metrics?.tutorial_completion_rate || 0) * 100}%` }}
                    />
                  </div>
                  <span>{((insight.metrics?.tutorial_completion_rate || 0) * 100).toFixed(1)}%</span>
                </li>
                <li>
                  <span>Submission success:</span>
                  <div className="progress">
                    <div
                      className="progress-bar submission"
                      style={{ width: `${(insight.metrics?.submission_success_rate || 0) * 100}%` }}
                    />
                  </div>
                  <span>{((insight.metrics?.submission_success_rate || 0) * 100).toFixed(1)}%</span>
                </li>
                <li>
                  <span>Avg submission rating:</span>
                  <span>{insight.metrics?.avg_submission_rating_journey || "N/A"}</span>
                </li>
              </ul>
            </div>
            <div className="card learning-target-card">
              <h3 className="section-title">Learning Target</h3>
              <LearningTargetChart user={insight} />
            </div>
          </div>
        </>
      );
    }

    if (activeMenu === MENU_ITEMS.TRACKER) {
      return (
        <div className="full-width-tracker">
          <LearningActivityTracker />
        </div>
      );
    }

    if (activeMenu === MENU_ITEMS.JOURNEY) {
      return (
        <div className="info-card">
          <h3 className="section-title">🕒 Journey</h3>
          <p>Konten untuk bagian Journey akan ditampilkan di sini.</p>
        </div>
      );
    }
    return null;
  };

  if (loading) return <div className="loading">Loading...</div>;

  return (
    <div className="dashboard-wrapper">
      <aside className="sidebar">
        <div className="profile-upload-box">
          <label htmlFor="uploadPhoto">
            <img
              src={profileImage || "https://cdn-icons-png.flaticon.com/512/149/149071.png"}
              alt="Profile"
              className="sidebar-photo"
            />
          </label>
          <input
            id="uploadPhoto"
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            style={{ display: "none" }}
          />
        </div>

        {user && <ProfileCard user={user} />}
        <div className="sidebar-separator"></div>
        <nav className="menu">
          <div
            className={`menu-item ${activeMenu === MENU_ITEMS.INSIGHT ? "active-menu" : ""}`}
            onClick={() => setActiveMenu(MENU_ITEMS.INSIGHT)}
          >
            📘 Learning Insight
          </div>
          <div
            className={`menu-item ${activeMenu === MENU_ITEMS.TRACKER ? "active-menu" : ""}`}
            onClick={() => setActiveMenu(MENU_ITEMS.TRACKER)}
          >
            🗓 Learning Tracker
          </div>
          <div
            className={`menu-item ${activeMenu === MENU_ITEMS.JOURNEY ? "active-menu" : ""}`}
            onClick={() => setActiveMenu(MENU_ITEMS.JOURNEY)}
          >
            🕒 Journey
          </div>
        </nav>
        <div className="logout" onClick={logout}>
          Log Out
        </div>
      </aside>

      <main className="main-content">
        <Header activeMenuTitle={activeMenu} />
        {renderMainContent()}
      </main>
    </div>
  );
}