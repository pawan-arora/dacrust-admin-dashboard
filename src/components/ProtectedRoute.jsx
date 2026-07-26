import { Navigate } from "react-router-dom";
import { auth } from "../firebase";

export default function ProtectedRoute({ children }) {
  const isLoggedIn = localStorage.getItem("isLoggedIn") === "true";
  const user = auth.currentUser;

  if (!isLoggedIn || !user) {
    return <Navigate to="/login" replace />;
  }

  return children;
}