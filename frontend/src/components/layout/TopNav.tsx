import React from 'react';
import { useAuthStore } from '../../store/authStore';
import { LogOut, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const TopNav: React.FC = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="bg-white shadow h-16 flex items-center justify-between px-6 border-b border-gray-200">
      <div className="text-xl font-semibold text-primary">
        Welcome, {user?.name}
      </div>
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 bg-background px-3 py-1 rounded-full text-sm font-medium text-primary">
          <User size={16} />
          <span className="capitalize">{user?.role}</span>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 text-secondary hover:text-primary transition-colors font-medium"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </header>
  );
};

export default TopNav;
