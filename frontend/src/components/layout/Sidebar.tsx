import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';
import { Home, BookOpen, Settings, Users, ChevronLeft, ChevronRight, Award, Sparkles, GraduationCap, Trophy, Compass, BarChart3 } from 'lucide-react';

const Sidebar: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const user = useAuthStore((state) => state.user);

  const links = [
    { name: 'Dashboard', icon: Home, path: '/dashboard', roles: ['admin', 'instructor', 'student'] },
    { name: 'Courses', icon: BookOpen, path: '/courses', roles: ['admin', 'instructor', 'student'] },
    { name: 'Users', icon: Users, path: '/users', roles: ['admin'] },
    { name: 'Leaderboard', icon: Trophy, path: '/leaderboard', roles: ['admin', 'instructor', 'student'] },
    { name: 'Certificates', icon: Award, path: '/certificates', roles: ['student', 'instructor'] },
    { name: 'AI Study Hub', icon: GraduationCap, path: '/study-hub', roles: ['student'] },
    { name: 'Learning Path', icon: Compass, path: '/learning-path', roles: ['student'] },
    { name: 'AI Generator', icon: Sparkles, path: '/ai-generator', roles: ['admin', 'instructor'] },
    { name: 'AI Insights', icon: BarChart3, path: '/performance-insights', roles: ['admin', 'instructor'] },
    { name: 'Settings', icon: Settings, path: '/settings', roles: ['admin', 'instructor', 'student'] },
  ];

  const filteredLinks = links.filter((link) => link.roles.includes(user?.role || ''));

  return (
    <div className={`h-screen bg-primary text-white flex flex-col transition-all duration-300 ${collapsed ? 'w-20' : 'w-64'}`}>
      <div className="flex items-center justify-between p-4 border-b border-primary-light">
        {!collapsed && <img src="/lms-logo.svg" alt="LMS" className="h-9 object-contain" />}
        {collapsed && <img src="/favicon.svg" alt="LMS" className="h-8 w-8 object-contain rounded" />}
        <button onClick={() => setCollapsed(!collapsed)} className="p-1 rounded hover:bg-secondary text-background">
          {collapsed ? <ChevronRight size={24} /> : <ChevronLeft size={24} />}
        </button>
      </div>

      <nav className="flex-1 mt-6 space-y-2 px-2">
        {filteredLinks.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) =>
              `flex items-center p-3 rounded-md transition-colors ${
                isActive ? 'bg-secondary text-white' : 'hover:bg-accent hover:text-primary text-gray-300'
              }`
            }
          >
            <link.icon className="h-6 w-6" />
            {!collapsed && <span className="ml-4 font-medium">{link.name}</span>}
          </NavLink>
        ))}
      </nav>
    </div>
  );
};

export default Sidebar;
