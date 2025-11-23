import React from "react";
import { Navigate } from "react-router-dom";

export function ProtectedUserRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  // If no token or role is not "user", redirect to /auth
  if (!token || role !== "user") {
    return <Navigate to="/auth" replace />;
  }

  return <>{children}</>;
}
