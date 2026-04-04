import { Navigate, Outlet } from "react-router-dom";
import { useAuth } from "../contexts/AuthContext";
import { useEffect, useState } from "react";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase";
import { Shield } from "lucide-react";

const ProtectedRoute = () => {
  const { user, loading: authLoading } = useAuth();

  // Use persistent cache for instant render on refresh
  const [isRegistered, setIsRegistered] = useState<boolean | null>(() => {
    const cached = localStorage.getItem("isRegistered");
    return cached === "true" ? true : cached === "false" ? false : null;
  });

  useEffect(() => {
    if (authLoading) return;

    if (user && !user.uid.startsWith("demo_")) {
      const checkRegistration = async () => {
        try {
          const snap = await getDoc(doc(db, "users", user.uid));
          const exists = snap.exists();
          setIsRegistered(exists);
          localStorage.setItem("isRegistered", exists.toString());
        } catch (error) {
          console.error("Error checking registration:", error);
          // Don't overwrite the cache on failure unless we have no data
          if (isRegistered === null) setIsRegistered(false);
        }
      };
      void checkRegistration();
    } else if (user && user.uid.startsWith("demo_")) {
      setIsRegistered(true);
    } else {
      setIsRegistered(false);
    }
  }, [user, authLoading]);

  // Priority 1: If we have a cached registration status, render instantly
  // Priority 2: If auth is still determining the user (first load), show loader
  // Priority 3: Only show loader for non-cached sessions while DB check runs
  if (authLoading && !user) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-xl shadow-emerald-500/20">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
            GigAssure
          </span>
        </div>
      </div>
    );
  }

  // If there's no user, redirect to login
  if (!user && !authLoading) {
    return <Navigate to="/login" replace />;
  }

  // If user is logged in but we don't know if they are registered (and no cache), wait for DB
  if (user && isRegistered === null) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-6">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-cyan-500 to-emerald-500 shadow-xl shadow-emerald-500/20">
            <Shield className="w-10 h-10 text-white" />
          </div>
          <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
            GigAssure
          </span>
        </div>
      </div>
    );
  }

  // If the user has a Firebase session but no Firestore profile, force them to finish registration
  if (user && isRegistered === false) {
    return <Navigate to="/register" replace />;
  }

  // Otherwise, render the child routes (e.g. Dashboard)
  return <Outlet />;
};

export default ProtectedRoute;
