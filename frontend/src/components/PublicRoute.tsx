import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { ReactNode } from "react";

const PublicRoute = ({ children }: { children: ReactNode }) => {
 const { isAuthenticated, loading } = useAuth();

  if (loading) return null;
  if (isAuthenticated) return <Navigate to="/home" replace />;

  return children;
};

export default PublicRoute;
