import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import type { JSX } from "react";

export default function StaffRoute({ children }: { children: JSX.Element }) {
  const { token, user } = useAuth();
  if (!token) return <Navigate to="/login" replace />;
  if (!user?.is_staff) return <Navigate to="/" replace />;
  return children;
}