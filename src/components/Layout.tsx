import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";

const Layout = () => {
  const location = useLocation();
  const hideNavbar =
    location.pathname === "/terms" || location.pathname === "/privacy";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      {!hideNavbar && <Navbar />}
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
