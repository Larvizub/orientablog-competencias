import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import Sidebar from './Sidebar';

export function Layout() {

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 py-6">
        <div className="md:flex md:space-x-6">
          <Sidebar />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>

        {/* debug removed */}
      </div>
    </div>
  );
}