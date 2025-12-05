import React from "react";

export default function Header({ activeMenuTitle }) {
  return (
    <div className="header">
      <h1>{activeMenuTitle}</h1>
    </div>
  );
}