
import { Navigate, Outlet } from "react-router-dom";
import { getCurrentUser } from "../services/authService";
import { useEffect, useState } from "react";

const ProtectedRoute = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      const userData = await getCurrentUser();
      setUser(userData);
      setLoading(false);
    };
    fetchUser();
  }, []);

  if (loading) return <p>Loading...</p>;

  return user ? <Outlet /> : <Navigate to="/login" />;
};

export default ProtectedRoute;