import React, { useState, useEffect } from "react";
import LoginPage from "./pages/LoginPage";
import Dashboard   from "./pages/Dashboard";
import ViewRecords from "./pages/ViewRecords";
import ManageParishStaff from "./pages/ManageParishStaff";
import AuditLogs from "./pages/AuditLogs";
import Settings    from "./pages/Settings";

export default function App() {
  // Use state to track current path for SPA navigation
  const [currentPath, setCurrentPath] = useState(window.location.pathname);
  const session = localStorage.getItem("session");

  // Listen for navigation events (back/forward buttons and programmatic navigation)
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  // Redirect rules
  if (currentPath === "/dashboard" && !session) {
    window.history.replaceState({}, "", "/");
    setCurrentPath("/");
  }
  if (currentPath === "/" && session) {
    window.history.replaceState({}, "", "/dashboard");
    setCurrentPath("/dashboard");
  }

  // Route rendering
  switch (currentPath) {
    case "/dashboard":
      return <Dashboard />;
    case "/view-records":
      return <ViewRecords />;
    case "/manage-parish-staff":
      return <ManageParishStaff />;
    case "/audit-logs":
      return <AuditLogs />;
    case "/settings":
      return <Settings />;
    default:
      return <LoginPage />;
  }
}