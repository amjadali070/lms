import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api';
import { Users, BookOpen, Award, TrendingUp, CheckCircle, Clock, Zap, Target, Flame, Trophy, BarChart3, ArrowRight, Star, GraduationCap, Layers, Activity } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const PIE_COLORS = ['#213448', '#547792', '#c8a97e', '#94a3b8', '#6366f1', '#22c55e', '#ef4444'];

const Dashboard = () => {
  const user = useAuthStore(state => state.user);
  const navigate = useNavigate();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStats(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
      </div>
    );
  }

  if (!stats) return null;

  const isAdmin = stats.role === 'admin';

  // ─── ADMIN / INSTRUCTOR DASHBOARD ───
  if (isAdmin) {
    const enrollmentPie = [
      { name: 'Completed', value: stats.completedCount },
      { name: 'In Progress', value: stats.inProgressCount },
      { name: 'Enrolled', value: stats.enrolledOnlyCount },
    ];

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-3xl font-black text-primary mb-1">Dashboard</h1>
            <p className="text-gray-500 text-sm">Platform overview and key metrics</p>
          </div>
          <div className="bg-white px-4 py-2 rounded-lg shadow-sm border border-gray-100">
            <span className="text-xs text-gray-500 mr-2">Role:</span>
            <span className="font-bold text-secondary capitalize text-sm">{user?.role}</span>
          </div>
        </div>

        {/* Top KPI Cards — 6 metrics */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            { title: 'Students', value: stats.totalStudents, icon: Users, color: 'bg-blue-500' },
            { title: 'Courses', value: stats.publishedCourses, icon: BookOpen, color: 'bg-primary' },
            { title: 'Enrollments', value: stats.totalEnrollments, icon: Target, color: 'bg-orange-500' },
            { title: 'Completed', value: stats.completedCount, icon: CheckCircle, color: 'bg-green-500' },
            { title: 'Completion Rate', value: `${stats.completionRate}%`, icon: TrendingUp, color: 'bg-secondary' },
            { title: 'Avg Score', value: `${stats.avgScore}%`, icon: Star, color: 'bg-purple-500' },
          ].map((card, i) => (
            <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-center justify-between mb-3">
                <div className={`${card.color} p-2 rounded-lg`}>
                  <card.icon size={16} className="text-white" />
                </div>
              </div>
              <p className="text-2xl font-black text-primary">{card.value}</p>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{card.title}</p>
            </div>
          ))}
        </div>

        {/* Middle Row: Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Enrollment Status Pie */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
              <Activity size={16} className="text-secondary" /> Enrollment Status
            </h3>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={enrollmentPie} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={4} dataKey="value">
                    {enrollmentPie.map((_, i) => (
                      <Cell key={i} fill={PIE_COLORS[i]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex justify-center gap-4 mt-2">
              {enrollmentPie.map((entry, i) => (
                <div key={i} className="flex items-center gap-1.5 text-xs">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i] }}></div>
                  <span className="text-gray-600 font-medium">{entry.name} ({entry.value})</span>
                </div>
              ))}
            </div>
          </div>

          {/* Sector Distribution Bar */}
          <div className="lg:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
              <Layers size={16} className="text-secondary" /> Enrollments by Sector
            </h3>
            <div className="h-56">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.sectorBreakdown} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EAE0CF" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#547792', fontSize: 11 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#547792', fontSize: 11 }} />
                  <Tooltip cursor={{ fill: '#f3f4f6' }} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                  <Bar dataKey="count" fill="#213448" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Bottom Row: Top Courses + Top Students + Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Courses */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2"><BookOpen size={16} className="text-secondary" /> Top Courses</h3>
              <button onClick={() => navigate('/courses')} className="text-xs text-secondary font-bold hover:underline flex items-center gap-1">View All <ArrowRight size={12} /></button>
            </div>
            <div className="divide-y divide-gray-50">
              {(stats.topCourses || []).map((c: any, i: number) => (
                <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-black text-gray-400 w-5">{i + 1}</span>
                    <p className="text-sm font-semibold text-primary truncate">{c.title}</p>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="text-xs text-gray-500">{c.count} enrolled</span>
                    <span className="text-xs text-green-600 font-bold">{c.completed} ✓</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Top Students */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2"><Trophy size={16} className="text-secondary" /> Top Students</h3>
              <button onClick={() => navigate('/leaderboard')} className="text-xs text-secondary font-bold hover:underline flex items-center gap-1">Leaderboard <ArrowRight size={12} /></button>
            </div>
            <div className="divide-y divide-gray-50">
              {(stats.topStudents || []).map((s: any, i: number) => (
                <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white text-xs font-bold">
                      {s.name?.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-primary">{s.name}</p>
                      <p className="text-[10px] text-gray-400">Lvl {s.level} · {s.badges?.length || 0} badges</p>
                    </div>
                  </div>
                  <span className="text-sm font-bold text-secondary">{s.xp} XP</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-50">
              <h3 className="text-sm font-bold text-primary flex items-center gap-2"><Clock size={16} className="text-secondary" /> Recent Activity</h3>
            </div>
            <div className="divide-y divide-gray-50">
              {(stats.recentEnrollments || []).map((e: any, i: number) => (
                <div key={i} className="px-6 py-3 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-primary truncate max-w-[60%]">{e.student}</p>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${e.status === 'completed' ? 'bg-green-50 text-green-700' : e.status === 'in_progress' ? 'bg-yellow-50 text-yellow-700' : 'bg-gray-100 text-gray-600'}`}>
                      {e.status.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 truncate mt-0.5">{e.course}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Quick Stats Row */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-background/50 border border-accent/30 p-5 rounded-xl">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Instructors</p>
            <p className="text-2xl font-black text-primary">{stats.totalInstructors}</p>
          </div>
          <div className="bg-background/50 border border-accent/30 p-5 rounded-xl">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Draft Courses</p>
            <p className="text-2xl font-black text-primary">{stats.draftCourses}</p>
          </div>
          <div className="bg-background/50 border border-accent/30 p-5 rounded-xl">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">In Progress</p>
            <p className="text-2xl font-black text-primary">{stats.inProgressCount}</p>
          </div>
          <div className="bg-background/50 border border-accent/30 p-5 rounded-xl">
            <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Enrolled Only</p>
            <p className="text-2xl font-black text-primary">{stats.enrolledOnlyCount}</p>
          </div>
        </div>
      </div>
    );
  }

  // ─── STUDENT DASHBOARD ───
  const progressPercent = stats.totalLessons > 0 ? Math.round((stats.completedLessons / stats.totalLessons) * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-primary p-8 rounded-2xl text-white relative overflow-hidden shadow-xl">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-secondary/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-accent/20 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <h1 className="text-3xl font-black mb-2">Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
          <p className="text-accent">Here's your learning progress at a glance.</p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { title: 'Enrolled', value: stats.totalEnrolled, icon: BookOpen, color: 'bg-blue-500', sub: 'courses' },
          { title: 'Completed', value: stats.completedCount, icon: CheckCircle, color: 'bg-green-500', sub: 'courses' },
          { title: 'In Progress', value: stats.inProgressCount, icon: Clock, color: 'bg-yellow-500', sub: 'courses' },
          { title: 'Avg Score', value: `${stats.avgScore}%`, icon: Star, color: 'bg-purple-500', sub: stats.bestScore > 0 ? `Best: ${stats.bestScore}%` : '' },
        ].map((card, i) => (
          <div key={i} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between mb-3">
              <div className={`${card.color} p-2 rounded-lg`}>
                <card.icon size={16} className="text-white" />
              </div>
            </div>
            <p className="text-2xl font-black text-primary">{card.value}</p>
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mt-1">{card.title}</p>
            {card.sub && <p className="text-[10px] text-gray-400 mt-0.5">{card.sub}</p>}
          </div>
        ))}
      </div>

      {/* Gamification + Progress Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Gamification Stats */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
            <Zap size={16} className="text-secondary" /> Your Achievements
          </h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-background/50 p-4 rounded-xl border border-accent/30 text-center">
              <p className="text-3xl font-black text-primary">{stats.xp}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Total XP</p>
            </div>
            <div className="bg-background/50 p-4 rounded-xl border border-accent/30 text-center">
              <p className="text-3xl font-black text-primary">{stats.level}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Level</p>
            </div>
            <div className="bg-background/50 p-4 rounded-xl border border-accent/30 text-center">
              <p className="text-3xl font-black text-primary flex items-center justify-center gap-1"><Flame size={20} className="text-orange-500" />{stats.streak}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Day Streak</p>
            </div>
            <div className="bg-background/50 p-4 rounded-xl border border-accent/30 text-center">
              <p className="text-3xl font-black text-primary flex items-center justify-center gap-1"><Award size={20} className="text-yellow-500" />{stats.badges}</p>
              <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-1">Badges</p>
            </div>
          </div>
        </div>

        {/* Overall Progress */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
            <BarChart3 size={16} className="text-secondary" /> Overall Learning Progress
          </h3>
          <div className="flex items-center gap-6">
            {/* Circular progress */}
            <div className="relative shrink-0">
              <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 120 120">
                <circle cx="60" cy="60" r="50" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                <circle cx="60" cy="60" r="50" fill="none" stroke="#547792" strokeWidth="10"
                  strokeDasharray={`${(progressPercent / 100) * 314} 314`} strokeLinecap="round"
                  className="transition-all duration-1000" />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-black text-primary">{progressPercent}%</span>
                <span className="text-[9px] font-bold text-gray-400">LESSONS</span>
              </div>
            </div>
            <div className="flex-1 space-y-3">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500 font-medium">Lessons Completed</span>
                  <span className="font-bold text-primary">{stats.completedLessons}/{stats.totalLessons}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-secondary rounded-full h-2 transition-all" style={{ width: `${progressPercent}%` }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-gray-500 font-medium">Courses Completed</span>
                  <span className="font-bold text-primary">{stats.completedCount}/{stats.totalEnrolled}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-green-500 rounded-full h-2 transition-all" style={{ width: `${stats.totalEnrolled > 0 ? Math.round((stats.completedCount / stats.totalEnrolled) * 100) : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Courses + Sector Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Active Courses */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50 flex items-center justify-between">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2"><Clock size={16} className="text-secondary" /> Active Courses</h3>
            <button onClick={() => navigate('/courses')} className="text-xs text-secondary font-bold hover:underline flex items-center gap-1">Browse All <ArrowRight size={12} /></button>
          </div>
          {(stats.activeCoursesDetail || []).length === 0 ? (
            <div className="p-8 text-center text-gray-400 text-sm">No courses in progress. <button onClick={() => navigate('/courses')} className="text-secondary font-bold hover:underline">Start learning!</button></div>
          ) : (
            <div className="divide-y divide-gray-50">
              {stats.activeCoursesDetail.map((c: any, i: number) => (
                <div key={i} className="px-6 py-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <p className="text-sm font-bold text-primary">{c.title}</p>
                      {c.sector && <span className="text-[10px] font-bold text-secondary uppercase tracking-widest">{c.sector}</span>}
                    </div>
                    <span className="text-sm font-black text-primary">{c.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-1.5">
                    <div className="bg-secondary rounded-full h-1.5 transition-all" style={{ width: `${c.progress}%` }}></div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sector Distribution */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h3 className="text-sm font-bold text-primary mb-4 flex items-center gap-2">
            <Layers size={16} className="text-secondary" /> Your Sectors
          </h3>
          {(stats.sectorDistribution || []).length > 0 ? (
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={stats.sectorDistribution} cx="50%" cy="50%" innerRadius={40} outerRadius={65} paddingAngle={4} dataKey="count">
                    {stats.sectorDistribution.map((_: any, i: number) => (
                      <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex flex-wrap gap-2 mt-2 justify-center">
                {stats.sectorDistribution.map((s: any, i: number) => (
                  <span key={i} className="flex items-center gap-1 text-[10px] font-medium text-gray-600">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }}></span>{s.name}
                  </span>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-400 text-xs text-center py-8">Enroll in courses to see sector distribution</p>
          )}
        </div>
      </div>

      {/* Completed Courses */}
      {(stats.completedCoursesDetail || []).length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-50">
            <h3 className="text-sm font-bold text-primary flex items-center gap-2"><GraduationCap size={16} className="text-secondary" /> Completed Courses</h3>
          </div>
          <div className="divide-y divide-gray-50">
            {stats.completedCoursesDetail.map((c: any, i: number) => (
              <div key={i} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors">
                <div className="flex items-center gap-3">
                  <CheckCircle size={16} className="text-green-500" />
                  <p className="text-sm font-semibold text-primary">{c.title}</p>
                </div>
                <div className="flex items-center gap-4">
                  {c.score !== undefined && c.score !== null && (
                    <span className={`text-sm font-bold ${c.score >= 90 ? 'text-green-600' : c.score >= 70 ? 'text-yellow-600' : 'text-red-600'}`}>{c.score}%</span>
                  )}
                  {c.completedAt && <span className="text-xs text-gray-400">{new Date(c.completedAt).toLocaleDateString()}</span>}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button onClick={() => navigate('/courses')} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-left group">
          <BookOpen size={20} className="text-secondary mb-2" />
          <p className="text-sm font-bold text-primary">Browse Courses</p>
          <p className="text-xs text-gray-400">Explore and enroll in new courses</p>
        </button>
        <button onClick={() => navigate('/learning-path')} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-left group">
          <Target size={20} className="text-secondary mb-2" />
          <p className="text-sm font-bold text-primary">AI Learning Path</p>
          <p className="text-xs text-gray-400">Get personalized recommendations</p>
        </button>
        <button onClick={() => navigate('/leaderboard')} className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-all text-left group">
          <Trophy size={20} className="text-secondary mb-2" />
          <p className="text-sm font-bold text-primary">Leaderboard</p>
          <p className="text-xs text-gray-400">See how you rank against peers</p>
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
