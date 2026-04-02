import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";

const ProtectedRoute = () => {
  const { user, loading } = useAuth();
  const [isDbChecked, setIsDbChecked] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);

  useEffect(() => {
    if (user && !user.uid.startsWith("demo_")) {
      const checkRegistration = async () => {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          setIsRegistered(snap.exists());
        } catch (error) {
          console.error("Error checking registration:", error);
          setIsRegistered(false); // err on safe side
        } finally {
          setIsDbChecked(true);
        }
      };
      void checkRegistration();
    } else if (user && user.uid.startsWith("demo_")) {
      setIsRegistered(true);
      setIsDbChecked(true);
    } else {
      setIsDbChecked(true);
      setIsRegistered(false);
    }
  }, [user]);

  if (loading || (user && !isDbChecked)) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  // If there's no user, redirect to login
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // If the user has a Firebase session but no Firestore profile, force them to finish registration
  if (user && !isRegistered) {
    return <Navigate to="/register" replace />;
  }

  // Otherwise, render the child routes (e.g. Dashboard)
  return <Outlet />;
};

export default ProtectedRoute;
