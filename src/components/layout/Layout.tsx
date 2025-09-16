import { Outlet } from 'react-router-dom';
import { Navbar } from './Navbar';
import Sidebar from './Sidebar';
import React from 'react';

export function Layout() {
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar onToggleSidebar={() => setSidebarOpen(prev => !prev)} />
      <div className="container mx-auto px-4 py-6">
        <div className="md:flex md:space-x-6">
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>

        {/* debug removed */}
      </div>
    </div>
  );
}