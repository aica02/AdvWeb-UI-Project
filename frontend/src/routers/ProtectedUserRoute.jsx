export function ProtectedUserRoute({ children }) {
  const token = localStorage.getItem("token");
  const role = localStorage.getItem("role");

  if (!token || role !== "user") {
    return <Navigate to="/auth" replace />;
  }

  return children;
}
