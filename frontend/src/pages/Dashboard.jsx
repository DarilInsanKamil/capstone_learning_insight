import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import RecommendationCard from "../components/RecommendationCard";
import ProfileCard from "../components/ProfileCard";
import Header from "../components/Header";
import LearningTargetChart from "../components/LearningTargetChart";
import LearningActivityTracker from "./LearningActivityTracker";
import "../style/dashboard.css";
import JourneyCard from "../components/JourneyCard";

const MENU_ITEMS = {
  INSIGHT: "Learning Insight",
  TRACKER: "Learning Tracker",
  JOURNEY: "Journey",
};

export default function Dashboard() {
  const { logout } = useAuth();
  const [user, setUser] = useState(null);
  const [insight, setInsight] = useState(null);
  const [progress, setProgress] = useState(null);
  const [journey, setJourney] = useState(null);

  const [activeMenu, setActiveMenu] = useState(MENU_ITEMS.INSIGHT);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchUserData();
    fetchInsightData();
    fetchJourneyData();
    fetchProggresData();
  }, []);

  const fetchProggresData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/insight/progress`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );
      const data = await response.json();

      if (response.ok) {
        setProgress(data.data);
      }
    } catch (err) {
      console.error("Error fetching progress:", err);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserData = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const userId = localStorage.getItem("userId");

      if (!token || !userId) {
        window.location.href = "/login";
        return;
      }

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/users/${userId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      const data = await response.json();
      if (response.ok) {
        setUser(data.data.user);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  // const handleGenerateInsight = async () => {
  //   const token = localStorage.getItem("accessToken");

  //   try {
  //     setLoading(true);
  //     const response = await fetch(
  //       `${import.meta.env.VITE_API_URL}/insight/generate`,
  //       {
  //         method: "POST",
  //         headers: {
  //           Authorization: `Bearer ${token}`,
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );
  //     await fetchInsightData();
  //   } catch (error) {
  //     alert(
  //       "Gagal generate insight: " +
  //         (error.response?.data?.message || error.message)
  //     );
  //     setLoading(false);
  //   }
  // };

  const fetchInsightData = async () => {
    try {
      const token = localStorage.getItem("accessToken");

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/insight/generate`,
        {
          // method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

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

  const fetchJourneyData = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/journey`);
      const data = await response.json()
      if (response.ok) {
        setJourney(data.result);
      }
    } catch (err) {
      console.err("err", err);
    } finally {
      setLoading(false);
    }
  };





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
                <span className="big-number">
                  {progress.total_material_completed || 0}
                </span>
                <span className="big-number-label">
                  Total Materials Completed
                </span>
              </div>

              <ul className="materials-list">
                <li>
                  <span>Materials / day:</span>
                  <span>{progress.materials_per_day || 0}</span>
                </li>
                <li>
                  <span>Avg tutorial duration (jam):</span>
                  <span>{progress.avg_tutorial_duration || 0}</span>
                </li>
                <li>
                  <span>Study time per material:</span>
                  <span>{progress.study_time_per_material || 0}</span>
                </li>
                <li>
                  <span>Tutorial completion:</span>
                  <div className="progress">
                    <div
                      className="progress-bar tutorial"
                      style={{
                        width: `${
                          (progress.tutorial_completion_rate || 0) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span>
                    {((progress.tutorial_completion_rate || 0) * 100).toFixed(
                      1
                    )}
                    %
                  </span>
                </li>
                <li>
                  <span>Submission success:</span>
                  <div className="progress">
                    <div
                      className="progress-bar submission"
                      style={{
                        width: `${
                          (progress.submission_success_rate || 0) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span>
                    {((progress.submission_success_rate || 0) * 100).toFixed(1)}
                    %
                  </span>
                </li>
                <li>
                  <span>Avg submission rating:</span>
                  <span>{progress.avg_submission_rating || "N/A"}</span>
                </li>
              </ul>
            </div>
            <div className="card learning-target-card">
              <h3 className="section-title">Learning Target</h3>
              <LearningTargetChart user={progress} />
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
          {/* <p>Konten untuk bagian Journey akan ditampilkan di sini.</p> */}
          <JourneyCard data={journey} />
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
          <img
            src="/pfp.jpg"
            alt="Profile"
            className="sidebar-photo"
          />
        </div>

        {user && <ProfileCard user={user} />}
        <div className="sidebar-separator"></div>
        <nav className="menu">
          <div
            className={`menu-item ${
              activeMenu === MENU_ITEMS.INSIGHT ? "active-menu" : ""
            }`}
            onClick={() => setActiveMenu(MENU_ITEMS.INSIGHT)}
          >
            Learning Insight
          </div>
          <div
            className={`menu-item ${
              activeMenu === MENU_ITEMS.TRACKER ? "active-menu" : ""
            }`}
            onClick={() => setActiveMenu(MENU_ITEMS.TRACKER)}
          >
            Learning Tracker
          </div>
          <div
            className={`menu-item ${
              activeMenu === MENU_ITEMS.JOURNEY ? "active-menu" : ""
            }`}
            onClick={() => setActiveMenu(MENU_ITEMS.JOURNEY)}
          >
            Journey
          </div>
        </nav>
        <div className="logout menu-item" onClick={logout}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
          <span>Log Out</span>
        </div>
      </aside>

      <main className="main-content">
        <Header activeMenuTitle={activeMenu} />
        {renderMainContent()}
      </main>
    </div>
  );
}
