import { Link, useLocation } from 'react-router-dom';
import { Shield, Sun, Moon, Menu, X } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { useState } from 'react';

const Navbar = () => {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const isActive = (path: string) => location.pathname === path;

  const navLinks = [
    { path: '/', label: 'Home' },
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/calculator', label: 'Calculator' },
    { path: '/claim-tracker', label: 'Claims' },
    { path: '/risk-prediction', label: 'Risk Insights' },
    { path: '/admin', label: 'Admin' },
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
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white shadow-md'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'light' ? (
                <Moon className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              ) : (
                <Sun className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              )}
            </button>

            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg bg-slate-100 dark:bg-slate-800"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              ) : (
                <Menu className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              )}
            </button>
          </div>
        </div>
      </div>

      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
          <div className="px-4 py-3 space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`block px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive(link.path)
                    ? 'bg-gradient-to-r from-cyan-500 to-emerald-500 text-white'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
