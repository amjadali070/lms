import { useState, useEffect } from 'react';
import api from '../api';
import { useAuthStore } from '../store/authStore';
import { Trophy, Flame, Star, Medal, Shield, Zap, Award, BookOpen, Target, Crown, ChevronUp } from 'lucide-react';

const BADGE_ICONS: Record<string, any> = {
  first_enrollment: { icon: BookOpen, color: 'text-blue-500', bg: 'bg-blue-100' },
  course_completer: { icon: Award, color: 'text-green-500', bg: 'bg-green-100' },
  triple_threat: { icon: Target, color: 'text-purple-500', bg: 'bg-purple-100' },
  perfect_score: { icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-100' },
  streak_3: { icon: Flame, color: 'text-orange-500', bg: 'bg-orange-100' },
  streak_7: { icon: Zap, color: 'text-red-500', bg: 'bg-red-100' },
  xp_500: { icon: ChevronUp, color: 'text-teal-500', bg: 'bg-teal-100' },
  xp_1000: { icon: Shield, color: 'text-indigo-500', bg: 'bg-indigo-100' },
  xp_2500: { icon: Crown, color: 'text-amber-500', bg: 'bg-amber-100' },
  five_lessons: { icon: BookOpen, color: 'text-cyan-500', bg: 'bg-cyan-100' },
};

const RANK_STYLES = [
  { bg: 'bg-yellow-50', border: 'border-yellow-300', text: 'text-yellow-700', icon: '🥇' },
  { bg: 'bg-gray-50', border: 'border-gray-300', text: 'text-gray-600', icon: '🥈' },
  { bg: 'bg-orange-50', border: 'border-orange-300', text: 'text-orange-700', icon: '🥉' },
];

const Leaderboard = () => {
  const currentUser = useAuthStore(state => state.user);
  const [myStats, setMyStats] = useState<any>(null);
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeView, setActiveView] = useState<'leaderboard' | 'badges'>('leaderboard');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, lbRes] = await Promise.all([
          api.get('/gamification/me'),
          api.get('/gamification/leaderboard')
        ]);
        setMyStats(statsRes.data);
        setLeaderboard(lbRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  const xpProgress = myStats ? ((myStats.xp - myStats.currentLevelXP) / (myStats.nextLevelXP - myStats.currentLevelXP)) * 100 : 0;

  return (
    <div className="max-w-full mx-auto space-y-8">
      {/* Header */}
      <div className="bg-primary p-8 rounded-2xl text-white relative overflow-hidden shadow-xl">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-secondary/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-accent/20 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-secondary/40 p-3 rounded-xl backdrop-blur-sm">
              <Trophy size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black">Leaderboard & Achievements</h1>
            </div>
          </div>
          <p className="text-accent max-w-2xl">
            Earn XP by completing lessons, courses, and quizzes. Climb the ranks and unlock achievement badges!
          </p>
        </div>
      </div>

      {/* My Stats Cards */}
      {myStats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* XP & Level */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 col-span-2">
            <div className="flex items-center justify-between mb-4">
              <div>
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Your Level</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-5xl font-black text-primary">{myStats.level}</span>
                  <span className="text-sm font-bold text-secondary">/ 10</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Total XP</p>
                <p className="text-3xl font-black text-secondary">{myStats.xp.toLocaleString()}</p>
              </div>
            </div>
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-bold text-gray-500">
                <span>Level {myStats.level}</span>
                <span>{myStats.nextLevelXP - myStats.xp} XP to Level {Math.min(myStats.level + 1, 10)}</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-gradient-to-r from-secondary to-primary h-3 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(xpProgress, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Streak */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Streak</p>
              <h3 className="text-4xl font-black text-primary">{myStats.streak}</h3>
              <p className="text-xs text-gray-500 mt-1">day{myStats.streak !== 1 ? 's' : ''}</p>
            </div>
            <div className="bg-orange-50 text-orange-500 p-4 rounded-full">
              <Flame size={32} />
            </div>
          </div>

          {/* Badges */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-1">Badges</p>
              <h3 className="text-4xl font-black text-primary">{myStats.badges.length}</h3>
              <p className="text-xs text-gray-500 mt-1">of {myStats.allBadges.length}</p>
            </div>
            <div className="bg-yellow-50 text-yellow-500 p-4 rounded-full">
              <Medal size={32} />
            </div>
          </div>
        </div>
      )}

      {/* Tab Switcher */}
      <div className="flex bg-gray-100 rounded-lg p-1 w-fit">
        <button
          onClick={() => setActiveView('leaderboard')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-bold transition-all ${activeView === 'leaderboard' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-primary'}`}
        >
          <Trophy size={16} /> Leaderboard
        </button>
        <button
          onClick={() => setActiveView('badges')}
          className={`flex items-center gap-2 px-6 py-2.5 rounded-md text-sm font-bold transition-all ${activeView === 'badges' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-primary'}`}
        >
          <Medal size={16} /> All Badges
        </button>
      </div>

      {/* LEADERBOARD VIEW */}
      {activeView === 'leaderboard' && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-8 py-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-primary">Top Learners</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 border-b border-gray-100">
                  <th className="p-4 pl-8 font-semibold text-gray-600 text-sm w-16">Rank</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm">Student</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm text-center">Level</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm text-center">Badges</th>
                  <th className="p-4 font-semibold text-gray-600 text-sm text-center">Streak</th>
                  <th className="p-4 pr-8 font-semibold text-gray-600 text-sm text-right">XP</th>
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((student) => {
                  const isMe = student._id === currentUser?.id;
                  const style = student.rank <= 3 ? RANK_STYLES[student.rank - 1] : null;

                  return (
                    <tr
                      key={student._id}
                      className={`border-b border-gray-50 transition-colors ${isMe ? 'bg-blue-50/50' : 'hover:bg-gray-50'} ${style ? style.bg : ''}`}
                    >
                      <td className="p-4 pl-8">
                        {style ? (
                          <span className="text-2xl">{style.icon}</span>
                        ) : (
                          <span className="text-lg font-black text-gray-400">#{student.rank}</span>
                        )}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm ${
                            student.rank === 1 ? 'bg-yellow-500' :
                            student.rank === 2 ? 'bg-gray-400' :
                            student.rank === 3 ? 'bg-orange-400' : 'bg-secondary'
                          }`}>
                            {student.name.charAt(0)}
                          </div>
                          <div>
                            <span className="font-bold text-primary">{student.name}</span>
                            {isMe && <span className="ml-2 text-[10px] font-bold bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full uppercase">You</span>}
                            <div className="text-xs text-gray-500">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold">
                          <Star size={14} /> {student.level}
                        </span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="font-bold text-secondary">{student.badges}</span>
                      </td>
                      <td className="p-4 text-center">
                        <span className="inline-flex items-center gap-1 text-orange-500 font-bold text-sm">
                          <Flame size={14} /> {student.streak}
                        </span>
                      </td>
                      <td className="p-4 pr-8 text-right">
                        <span className="text-lg font-black text-primary">{student.xp.toLocaleString()}</span>
                        <span className="text-xs text-gray-500 ml-1">XP</span>
                      </td>
                    </tr>
                  );
                })}
                {leaderboard.length === 0 && (
                  <tr>
                    <td colSpan={6} className="p-12 text-center text-gray-500">
                      No students yet. Be the first to earn XP!
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* BADGES VIEW */}
      {activeView === 'badges' && myStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {myStats.allBadges.map((badge: any) => {
            const iconDef = BADGE_ICONS[badge.id] || { icon: Medal, color: 'text-gray-400', bg: 'bg-gray-100' };
            const IconComponent = iconDef.icon;

            return (
              <div
                key={badge.id}
                className={`bg-white p-6 rounded-xl shadow-sm border-2 transition-all ${
                  badge.earned ? 'border-green-200 hover:shadow-md' : 'border-gray-100 opacity-50 grayscale'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`w-14 h-14 rounded-full flex items-center justify-center ${badge.earned ? iconDef.bg : 'bg-gray-100'}`}>
                    <IconComponent size={28} className={badge.earned ? iconDef.color : 'text-gray-400'} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className={`font-bold text-lg ${badge.earned ? 'text-primary' : 'text-gray-400'}`}>{badge.name}</h3>
                      {badge.earned && <span className="text-green-500 text-xs font-bold bg-green-50 px-2 py-0.5 rounded-full">EARNED</span>}
                    </div>
                    <p className="text-sm text-gray-500 mt-0.5">{badge.description}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Leaderboard;
