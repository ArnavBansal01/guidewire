import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

const Layout = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white transition-colors">
      <Navbar />
      <main>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;
