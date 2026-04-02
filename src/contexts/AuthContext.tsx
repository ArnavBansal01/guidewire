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
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      const fakeDemoUser = localStorage.getItem("demoUser");
      if (fakeDemoUser) {
        setUser({ uid: `demo_${fakeDemoUser}`, email: `demo@${fakeDemoUser}.com` } as User);
      } else {
        setUser(currentUser);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      loading,
      signOutUser: async () => {
        localStorage.removeItem("demoUser");
        await signOut(auth);
        setUser(null);
      },
      demoLogin: (role: "worker" | "admin") => {
        localStorage.setItem("demoUser", role);
        setUser({ uid: `demo_${role}`, email: `demo@${role}.com` } as User);
      }
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
