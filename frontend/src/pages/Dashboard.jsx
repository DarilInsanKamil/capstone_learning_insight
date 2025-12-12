import React, { useEffect, useState } from "react";
import { useAuth } from "../context/useAuth";
import RecommendationCard from "../components/RecommendationCard";
import ProfileCard from "../components/ProfileCard";
import Header from "../components/Header";
import LearningTargetChart from "../components/LearningTargetChart";

import "../style/dashboard.css";
import JourneyCard from "../components/JourneyCard";
import client from "../api/axiosClient";

const MENU_ITEMS = {
  INSIGHT: "Learning Insight",
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
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        await Promise.all([
          fetchUserData(),
          fetchInsightData(),
          fetchJourneyData(),
          fetchProggresData(),
        ]);
      } catch (error) {
        console.error("Salah satu request gagal:", error);
      } finally {
        setLoading(false);
      }
    };
    loadDashboardData();
  }, []);

  const fetchProggresData = async () => {
    try {
      const response = await client.get("/insight/progress");
      if (response.data.status === "success") {
        setProgress(response.data.data);
      }
    } catch (err) {
      console.error("Error fetching progress:", err);
    }
  };

  const fetchUserData = async () => {
    try {
      const userId = localStorage.getItem("userId");
      if (!userId) return;
      const response = await client.get(`/users/${userId}`);
      if (response.data.status === "success") {
        setUser(response.data.data.user);
      }
    } catch (err) {
      console.error("Error fetching user:", err);
    }
  };

  const fetchInsightData = async () => {
    try {
      const response = await client.post("/insight/generate");
      if (response.data.status === "success") {
        setInsight(response.data.data);
      }
    } catch (err) {
      if (err.response && err.response.status === 429) {
        console.log("Jatah harian habis, mengambil data insight terakhir...");

        try {
          const getResponse = await client.get("/insight/generate");

          if (getResponse.data.status === "success") {
            setInsight(getResponse.data.data);
          }
        } catch (getError) {
          console.error("Gagal mengambil data insight lama:", getError);
        }
      } else {
        console.error("Error fetching insight:", err);
      }
    }
  };

  const fetchJourneyData = async () => {
    try {
      const response = await client.get("/journey");
      if (response.data.status === "success") {
        setJourney(response.data.result);
      }
    } catch (err) {
      console.error("Error fetching journey", err);
    }
  };





  const renderMainContent = () => {
    if (activeMenu === MENU_ITEMS.INSIGHT) {
      if (!insight || !progress) {
        return <div>Loading dashboard data...</div>;
      }

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
                  {progress?.total_material_completed || 0}
                </span>
                <span className="big-number-label">
                  Total Materials Completed
                </span>
              </div>

              <ul className="materials-list">
                <li>
                  <span>Materials / day:</span>
                  <span>{progress?.materials_per_day || 0}</span>
                </li>
                <li>
                  <span>Avg tutorial duration (jam):</span>
                  <span>{progress?.avg_tutorial_duration || 0}</span>
                </li>
                <li>
                  <span>Study time per material:</span>
                  <span>{progress?.study_time_per_material || 0}</span>
                </li>
                <li>
                  <span>Tutorial completion:</span>
                  <div className="progress">
                    <div
                      className="progress-bar tutorial"
                      style={{
                        width: `${
                          (progress?.tutorial_completion_rate || 0) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span>
                    {((progress?.tutorial_completion_rate || 0) * 100).toFixed(
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
                          (progress?.submission_success_rate || 0) * 100
                        }%`,
                      }}
                    />
                  </div>
                  <span>
                    {((progress?.submission_success_rate || 0) * 100).toFixed(
                      1
                    )}
                    %
                  </span>
                </li>
                <li>
                  <span>Avg submission rating:</span>
                  <span>{progress?.avg_submission_rating || "N/A"}</span>
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

    if (activeMenu === MENU_ITEMS.JOURNEY) {
      if (!journey) return <div>Loading journey data...</div>;
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
        {/* {JSON.stringify(journey)}; */}
        {renderMainContent()}
      </main>
    </div>
  );
}
