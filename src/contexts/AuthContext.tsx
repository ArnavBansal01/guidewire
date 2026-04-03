import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { onAuthStateChanged, signOut, type User } from "firebase/auth";
import { auth } from "../firebase";

type AuthContextType = {
  user: User | null;
  loading: boolean;
  signOutUser: () => Promise<void>;
  demoLogin: (role: "worker" | "admin") => void;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(() => {
    const cached = localStorage.getItem("authUser");
    return cached ? JSON.parse(cached) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fakeDemoUser = localStorage.getItem("demoUser");
    if (fakeDemoUser) {
      setUser({
        uid: `demo_${fakeDemoUser}`,
        email: `demo@${fakeDemoUser}.com`,
      } as User);
      setLoading(false);
      return;
    }

    let isMounted = true;
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!isMounted) return;
      setUser(currentUser);
      if (currentUser) {
        localStorage.setItem("authUser", JSON.stringify({ uid: currentUser.uid, email: currentUser.email, displayName: currentUser.displayName }));
      } else {
        localStorage.removeItem("authUser");
        localStorage.removeItem("isRegistered");
        localStorage.removeItem("dbUser");
        localStorage.removeItem("parametricCache");
      }
    });

    // Wait for Firebase to finish restoring persisted auth state before unblocking routes.
    auth
      .authStateReady()
      .catch((error) => {
        console.error("Error while restoring auth state:", error);
      })
      .finally(() => {
        if (isMounted) {
          setLoading(false);
        }
      });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      signOutUser: async () => {
        localStorage.removeItem("demoUser");
        localStorage.removeItem("authUser");
        localStorage.removeItem("isRegistered");
        localStorage.removeItem("dbUser");
        localStorage.removeItem("parametricCache");
        await signOut(auth);
        setUser(null);
      },
      demoLogin: (role: "worker" | "admin") => {
        localStorage.setItem("demoUser", role);
        localStorage.setItem("isRegistered", "true");
        const demoUser = { uid: `demo_${role}`, email: `demo@${role}.com` } as User;
        setUser(demoUser);
        localStorage.setItem("authUser", JSON.stringify({ uid: demoUser.uid, email: demoUser.email }));
      },
    }),
    [user, loading],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
