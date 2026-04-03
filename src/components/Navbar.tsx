import { Link, useLocation } from "react-router-dom";
import {
  Shield,
  Sun,
  Moon,
  ChevronDown,
  LogOut,
  UserCircle2,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useUserProfile } from "../hooks/useUserProfile";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOutUser } = useAuth();
  const { profile } = useUserProfile();
  const location = useLocation();
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const profileMenuRef = useRef<HTMLDivElement | null>(null);

  const userDisplayName = useMemo(() => {
    if (profile?.fullName && profile.fullName.trim()) {
      return profile.fullName;
    }
    if (user?.displayName && user.displayName.trim()) {
      return user.displayName;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  }, [profile?.fullName, user]);

  const userInitial = useMemo(
    () => userDisplayName.charAt(0).toUpperCase(),
    [userDisplayName],
  );

  useEffect(() => {
    if (!isProfileMenuOpen) {
      return;
    }

    const handleOutsideClick = (event: MouseEvent) => {
      if (!profileMenuRef.current?.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsProfileMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isProfileMenuOpen]);

  const isActive = (path: string) => location.pathname === path;

  // We keep the main navigation links here (excluding auth)
  const navLinks = [
    { path: "/", label: "Home" },
    { path: "/premium", label: "Premium" },
    { path: "/dashboard", label: "Dashboard" },
    { path: "/calculator", label: "Calculator" },
    { path: "/claim-tracker", label: "Claims" },
    { path: "/risk-prediction", label: "Risk Insights" },
    { path: "/admin", label: "Admin" },
  ];

  return (
    <nav className="sticky top-0 z-50 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 backdrop-blur-sm bg-opacity-90 dark:bg-opacity-90">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="p-2 rounded-lg bg-gradient-to-br from-cyan-500 to-emerald-500 group-hover:shadow-lg transition-shadow">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-bold bg-gradient-to-r from-cyan-600 to-emerald-600 bg-clip-text text-transparent">
              GigShield
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-1">
            {location.pathname === "/" ? (
              <>
                <a
                  href="#how-it-works"
                  className="px-4 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all whitespace-nowrap"
                >
                  How it works
                </a>
                <Link
                  to="/premium"
                  className="px-4 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all whitespace-nowrap"
                >
                  Plans
                </Link>
                <a
                  href="#about"
                  className="px-4 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all whitespace-nowrap"
                >
                  About
                </a>
                <a
                  href="#faq"
                  className="px-4 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all whitespace-nowrap"
                >
                  FAQ
                </a>
              </>
            ) : (
              navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive(link.path)
                      ? "bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md"
                      : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
                  }`}
                >
                  {link.label}
                </Link>
              ))
            )}
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={toggleTheme}
              className="p-1.5 sm:p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 dark:text-slate-300" />
              ) : (
                <Sun className="w-4 h-4 sm:w-5 sm:h-5 text-slate-700 dark:text-slate-300" />
              )}
            </button>

            {!user ? (
              <>
                <Link
                  to="/login"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all whitespace-nowrap"
                >
                  Sign In
                </Link>

                <Link
                  to="/register"
                  className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium bg-gradient-to-r from-cyan-500 to-emerald-500 text-white rounded-lg shadow-md hover:shadow-lg transition-all whitespace-nowrap"
                >
                  Get Protected
                </Link>
              </>
            ) : (
              <>
                {location.pathname === "/" && (
                  <Link
                    to="/dashboard"
                    className="hidden sm:inline-flex items-center px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-semibold text-slate-950 rounded-lg border border-cyan-300/70 bg-gradient-to-r from-cyan-300 via-emerald-300 to-emerald-200 shadow-[0_0_24px_rgba(45,212,191,0.45)] hover:shadow-[0_0_30px_rgba(45,212,191,0.6)] hover:-translate-y-0.5 transition-all whitespace-nowrap"
                  >
                    Dashboard
                  </Link>
                )}

                <div className="relative" ref={profileMenuRef}>
                  <button
                    type="button"
                    onClick={() => setIsProfileMenuOpen((prev) => !prev)}
                    className="group flex items-center gap-2 pl-1 pr-2 py-1 rounded-full border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-cyan-300 dark:hover:border-cyan-700 shadow-sm hover:shadow-md transition-all"
                    aria-haspopup="menu"
                    aria-expanded={isProfileMenuOpen}
                    aria-label="Open profile menu"
                  >
                    <span className="w-9 h-9 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 text-white font-semibold flex items-center justify-center shadow-sm">
                      {userInitial}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 dark:text-slate-400 transition-transform ${
                        isProfileMenuOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>

                  {isProfileMenuOpen && (
                    <div
                      role="menu"
                      className="absolute right-0 mt-3 w-72 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150"
                    >
                      <div className="px-4 pt-4 pb-3 bg-gradient-to-r from-cyan-50 to-emerald-50 dark:from-slate-800 dark:to-slate-900 border-b border-slate-200 dark:border-slate-700">
                        <div className="flex items-center gap-3">
                          <span className="w-11 h-11 rounded-full bg-gradient-to-br from-cyan-500 to-emerald-500 text-white font-semibold flex items-center justify-center">
                            {userInitial}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                              {userDisplayName}
                            </p>
                            <p className="text-xs text-slate-600 dark:text-slate-300 truncate">
                              {profile?.email ?? user?.email ?? "Signed in"}
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-2">
                        <Link
                          to="/profile"
                          role="menuitem"
                          onClick={() => setIsProfileMenuOpen(false)}
                          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                        >
                          <UserCircle2 className="w-4 h-4" />
                          My Profile
                        </Link>

                        <button
                          type="button"
                          role="menuitem"
                          onClick={() => {
                            setIsProfileMenuOpen(false);
                            void signOutUser();
                          }}
                          className="w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
                        >
                          <LogOut className="w-4 h-4" />
                          Log Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
