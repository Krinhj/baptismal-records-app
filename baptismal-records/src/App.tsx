import React from "react";
import LoginPage from "./pages/LoginPage";
import Dashboard   from "./pages/Dashboard";
import AddRecord   from "./pages/AddRecord";
import ViewRecords from "./pages/ViewRecords";
import ManageUsers from "./pages/ManageUsers";
import Settings    from "./pages/Settings";

export default function App() {
  const path = window.location.pathname;
  const session = localStorage.getItem("session");

  // Redirect rules
  if (path === "/dashboard" && !session) {
    window.location.href = "/";
    return null;
  }
  if (path === "/" && session) {
    window.location.href = "/dashboard";
    return null;
  }

  // Route rendering
  switch (path) {
    case "/dashboard":
      return <Dashboard />;
    case "/add-record":
      return <AddRecord />;
    case "/view-records":
      return <ViewRecords />;
    case "/manage-users":
      return <ManageUsers />;
    case "/settings":
      return <Settings />;
    default:
      return <LoginPage />;
  }
}