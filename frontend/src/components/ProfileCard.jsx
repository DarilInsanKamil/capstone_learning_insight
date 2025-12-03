import React from "react";

export default function ProfileCard({ user }) {
  return (
    <div className="profile-card">
      <h3>{user.display_name}</h3>
      <p>{user.email}</p>
    </div>
  );
}