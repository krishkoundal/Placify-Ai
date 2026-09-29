import React, { useState, useEffect } from 'react';
import { Flame, Star, Trophy, Bell, Menu } from 'lucide-react';
import { User } from '../hooks/useAuth';
import api from '../services/api';

interface HeaderProps {
  user: User | null;
  toggleSidebar: () => void;
  sidebarCollapsed: boolean;
}

const Header: React.FC<HeaderProps> = ({ user, toggleSidebar, sidebarCollapsed }) => {
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [imageError, setImageError] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return 'U';
    return name.substring(0, 2).toUpperCase();
  };

  const getGreeting = () => {
    const hrs = new Date().getHours();
    if (hrs < 12) return 'Good Morning';
    if (hrs < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const capitalize = (str: string) => {
    if (!str) return 'Developer';
    return str
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
  };

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      setNotifications(res.data);
    } catch (err) {
      console.error('Error fetching notifications:', err);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const unreadCount = notifications.filter(n => !n.read).length;

  const handleMarkAllAsRead = async () => {
    try {
      const res = await api.put('/notifications', {});
      setNotifications(res.data);
    } catch (err) {
      console.error('Error marking notifications read:', err);
    }
  };

  const handleMarkSingleAsRead = async (id: string) => {
    try {
      const res = await api.put('/notifications', { id });
      setNotifications(res.data);
    } catch (err) {
      console.error('Error marking notification read:', err);
    }
  };

  const avatarUrl = user?.avatar?.includes('adventurer')
    ? `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(user.name)}&backgroundColor=4f46e5`
    : user?.avatar || 'https://api.dicebear.com/7.x/initials/svg?seed=Dev&backgroundColor=4f46e5';

  return (
    <header className="h-16 border-b border-slate-800 bg-slate-950/80 backdrop-blur-md sticky top-0 z-10 px-8 flex items-center justify-between">
      {/* Welcome Message with Sidebar Toggle option */}
      <div className="flex items-center space-x-4">
        {sidebarCollapsed && (
          <button 
            onClick={toggleSidebar}
            className="p-1.5 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors"
            title="Open Sidebar"
          >
            <Menu className="w-5 h-5" />
          </button>
        )}
        <div>
          <h2 className="text-sm text-slate-400 font-medium">
            {getGreeting()}, <span className="text-slate-100 font-semibold">{capitalize(user?.name || '')}</span>
          </h2>
          <p className="text-[11px] text-slate-500">Ready to boost your company readiness score today?</p>
        </div>
      </div>

      {/* Stats and Profile Info */}
      <div className="flex items-center space-x-6">
        {/* Streak Counter */}
        <div className="flex items-center space-x-1.5 bg-amber-500/10 text-amber-500 border border-amber-500/20 px-3 py-1 rounded-full text-xs font-semibold">
          <Flame className="w-3.5 h-3.5 fill-amber-500" />
          <span>{user?.streak || 1} Day Streak</span>
        </div>

        {/* XP Badge */}
        <div className="flex items-center space-x-1.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 px-3 py-1 rounded-full text-xs font-semibold">
          <Star className="w-3.5 h-3.5 fill-indigo-400/20" />
          <span>{user?.xp || 100} XP</span>
        </div>

        {/* Level Badge */}
        <div className="flex items-center space-x-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-semibold">
          <Trophy className="w-3.5 h-3.5" />
          <span>Level {user?.level || 1}</span>
        </div>

        {/* Notifications Icon with Dropdown Popover */}
        <div className="relative">
          <button 
            onClick={() => setShowDropdown(!showDropdown)}
            className="relative cursor-pointer text-slate-400 hover:text-white transition-colors outline-none focus:outline-none flex items-center"
            title="Notifications Panel"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-rose-500 text-white text-[9px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                {unreadCount}
              </span>
            )}
          </button>

          {/* Glassmorphic Dropdown List */}
          {showDropdown && (
            <div className="absolute right-0 mt-3 w-80 glass rounded-xl border border-slate-800 p-4 shadow-xl z-50 text-left space-y-3">
              <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                <span className="text-xs font-bold text-white">Notifications</span>
                {unreadCount > 0 && (
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] text-indigo-400 hover:text-indigo-350 font-semibold"
                  >
                    Mark all as read
                  </button>
                )}
              </div>

              <div className="max-h-60 overflow-y-auto space-y-2 pr-1">
                {notifications.length > 0 ? (
                  notifications.map((n) => (
                    <div 
                      key={n._id}
                      onClick={() => handleMarkSingleAsRead(n._id)}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                        n.read 
                          ? 'bg-slate-900/35 border-slate-900 text-slate-500' 
                          : 'bg-slate-950 border-slate-850 hover:border-slate-800 text-slate-200'
                      }`}
                    >
                      <div className="flex justify-between items-center font-bold text-[10px] mb-1">
                        <span className={n.read ? 'text-slate-500' : 'text-indigo-400'}>{n.title}</span>
                        {!n.read && <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full"></span>}
                      </div>
                      <p className="text-[10px] leading-relaxed text-slate-400">{n.message}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center text-[10px] text-slate-500 py-4">No notifications yet.</div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Profile Avatar */}
        {imageError ? (
          <div className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-indigo-500/20 text-indigo-300 flex items-center justify-center text-xs font-bold shrink-0">
            {getInitials(user?.name)}
          </div>
        ) : (
          <img 
            src={avatarUrl} 
            alt="Avatar" 
            className="w-8 h-8 rounded-full border-2 border-indigo-600 bg-slate-800 object-cover shrink-0"
            onError={() => setImageError(true)}
          />
        )}
      </div>
    </header>
  );
};

export default Header;
