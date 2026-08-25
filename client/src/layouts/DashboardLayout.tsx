import React from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { User } from '../hooks/useAuth';

interface DashboardLayoutProps {
  user: User | null;
  loading: boolean;
  onLogout: () => void;
}

const DashboardLayout: React.FC<DashboardLayoutProps> = ({ user, loading, onLogout }) => {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  // If still loading session details, display a modern full page loader
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center">
        <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-sm text-slate-400 font-medium tracking-wide">Syncing Placify Career OS...</p>
      </div>
    );
  }

  // Enforce route protection
  if (!user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="min-h-screen bg-slate-950 flex overflow-hidden">
      {/* Navigation Sidebar */}
      <Sidebar onLogout={onLogout} collapsed={!sidebarOpen} onToggleCollapse={() => setSidebarOpen(false)} />

      {/* Main Content Pane */}
      <div className="flex-1 flex flex-col overflow-y-auto h-screen bg-slate-950 text-slate-100">
        <Header user={user} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} sidebarCollapsed={!sidebarOpen} />
        <main className="p-8 max-w-7xl mx-auto w-full">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;
