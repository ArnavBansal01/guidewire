import { Link, useLocation } from "react-router-dom";
import { Shield, Sun, Moon } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const { user, signOutUser } = useAuth();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  // We keep the main navigation links here (excluding auth)
  const navLinks = [
    { path: "/", label: "Home" },
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
                <a
                  href="#plans"
                  className="px-4 py-2 rounded-lg font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all whitespace-nowrap"
                >
                  Plans
                </a>
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
              <button
                type="button"
                onClick={() => {
                  void signOutUser();
                }}
                className="px-3 py-1.5 sm:px-4 sm:py-2 text-sm sm:text-base font-medium text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-800 transition-all whitespace-nowrap"
              >
                Sign Out
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
