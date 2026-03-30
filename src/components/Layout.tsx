import { Outlet } from "react-router-dom";
import { useLocation } from "react-router-dom";
import Navbar from "./Navbar";
import BottomMobileNav from "./BottomMobileNav";

const Layout = () => {
  const location = useLocation();
  const hiddenNavigationRoutes = ["/login", "/register", "/terms", "/privacy"];
  const hideNavigation = hiddenNavigationRoutes.includes(location.pathname);
  const showBottomMobileNav = !hideNavigation;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      {!hideNavigation && <Navbar />}
      <main className={showBottomMobileNav ? "pb-20 md:pb-0" : ""}>
        <Outlet />
      </main>
      {showBottomMobileNav && <BottomMobileNav />}
    </div>
  );
};

export default Layout;
