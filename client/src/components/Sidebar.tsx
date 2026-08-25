import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  LayoutDashboard, 
  User, 
  FileText, 
  Github, 
  Code, 
  TrendingUp, 
  Map, 
  Mic, 
  MessageSquare,
  LogOut,
  ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  onLogout: () => void;
  collapsed: boolean;
  onToggleCollapse: () => void;
}

const Sidebar: React.FC<SidebarProps> = ({ onLogout, collapsed, onToggleCollapse }) => {
  const menuItems = [
    { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Profile Identity', path: '/profile', icon: User },
    { name: 'AI Resume', path: '/resume', icon: FileText },
    { name: 'GitHub & LeetCode', path: '/github-leetcode', icon: Github },
    { name: 'Mock Interview', path: '/interview', icon: Mic },
    { name: 'AI Mentor Chat', path: '/mentor', icon: MessageSquare },
    { name: 'Roadmap Goals', path: '/roadmap', icon: Map },
    { name: 'Career Score', path: '/predictor', icon: TrendingUp },
  ];

  return (
    <aside className={`bg-slate-900 border-slate-800 text-slate-300 flex flex-col justify-between h-screen sticky top-0 transition-all duration-300 ease-in-out ${
      collapsed ? 'w-0 opacity-0 overflow-hidden border-r-0' : 'w-64 border-r opacity-100'
    }`}>
      <div className="flex flex-col min-w-[16rem]">
        {/* Brand Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <span className="text-2xl">🎓</span>
            <div>
              <h1 className="text-lg font-bold text-white tracking-tight">Placify AI</h1>
              <p className="text-[10px] text-indigo-400 font-medium tracking-widest uppercase">Career OS</p>
            </div>
          </div>
          <button 
            onClick={onToggleCollapse}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Collapse Sidebar"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
        </div>

        {/* Navigation List */}
        <nav className="p-4 space-y-1.5 flex-1">
          {menuItems.map((item) => (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) => 
                `flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive 
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                    : 'hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <item.icon className="w-4.5 h-4.5" />
              <span>{item.name}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* Logout Action */}
      <div className="p-4 border-t border-slate-800 min-w-[16rem]">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-2.5 rounded-lg text-sm font-medium text-slate-400 hover:bg-rose-950/20 hover:text-rose-400 transition-all"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Sign Out</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
