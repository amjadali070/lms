import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Compass, Loader, CheckCircle, Clock, Target, TrendingUp, BookOpen, Brain, Lightbulb, RotateCcw, ChevronRight, Zap } from 'lucide-react';

const LearningPath = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [pathData, setPathData] = useState<any>(null);
  const [error, setError] = useState('');

  const generatePath = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/learning-path');
      setPathData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate learning path. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generatePath();
  }, []);

  const priorityStyles: Record<string, { bg: string; text: string; border: string; label: string }> = {
    high: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200', label: 'High Priority' },
    medium: { bg: 'bg-yellow-50', text: 'text-yellow-700', border: 'border-yellow-200', label: 'Medium Priority' },
    low: { bg: 'bg-green-50', text: 'text-green-700', border: 'border-green-200', label: 'Recommended' },
  };

  return (
    <div className="max-w-full mx-auto space-y-8">
      {/* Header */}
      <div className="bg-primary p-8 rounded-2xl text-white relative overflow-hidden shadow-xl">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-secondary/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-accent/20 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-secondary/40 p-3 rounded-xl backdrop-blur-sm">
              <Compass size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black">AI Learning Path</h1>
            </div>
          </div>
          <p className="text-accent max-w-2xl">
            Your personalized learning roadmap powered by AI. Get course recommendations based on your progress, skills, and career goals.
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white p-16 rounded-xl shadow-sm border border-gray-100 text-center">
          <Loader size={44} className="animate-spin text-secondary mx-auto mb-4" />
          <p className="text-primary font-bold text-lg">AI is analyzing your learning journey...</p>
          <p className="text-gray-500 text-sm mt-1">Evaluating your progress, skills, and available courses</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={generatePath} className="bg-red-100 hover:bg-red-200 px-4 py-2 rounded-lg font-bold text-xs transition-colors">
            Retry
          </button>
        </div>
      )}

      {pathData && !loading && (
        <div className="space-y-8 animate-fadeIn">

          {/* Journey Overview Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Completed */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-green-50 p-3 rounded-xl">
                  <CheckCircle size={24} className="text-green-500" />
                </div>
                <span className="text-3xl font-black text-primary">{pathData.completedCourses?.length || 0}</span>
              </div>
              <p className="font-bold text-primary text-sm">Completed Courses</p>
              <div className="mt-3 space-y-1">
                {(pathData.completedCourses || []).slice(0, 3).map((c: any, i: number) => (
                  <p key={i} className="text-xs text-gray-500 truncate">✓ {c.title} {c.score ? `(${c.score}%)` : ''}</p>
                ))}
              </div>
            </div>

            {/* In Progress */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-blue-50 p-3 rounded-xl">
                  <Clock size={24} className="text-blue-500" />
                </div>
                <span className="text-3xl font-black text-primary">{pathData.inProgressCourses?.length || 0}</span>
              </div>
              <p className="font-bold text-primary text-sm">In Progress</p>
              <div className="mt-3 space-y-1">
                {(pathData.inProgressCourses || []).slice(0, 3).map((c: any, i: number) => (
                  <p key={i} className="text-xs text-gray-500 truncate">⏳ {c.title} ({c.progress || 0}%)</p>
                ))}
              </div>
            </div>

            {/* Available */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between mb-4">
                <div className="bg-purple-50 p-3 rounded-xl">
                  <BookOpen size={24} className="text-purple-500" />
                </div>
                <span className="text-3xl font-black text-primary">{pathData.totalAvailable || 0}</span>
              </div>
              <p className="font-bold text-primary text-sm">Courses Available</p>
              <p className="text-xs text-gray-400 mt-3">Ready for you to explore</p>
            </div>
          </div>

          {/* AI Assessment */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-secondary/10 p-2.5 rounded-lg">
                <Brain size={22} className="text-secondary" />
              </div>
              <h2 className="text-xl font-bold text-primary">AI Assessment</h2>
            </div>
            <p className="text-gray-600 leading-relaxed bg-background/50 p-5 rounded-lg border border-accent/20">
              {pathData.overallAssessment}
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
              {/* Skills Acquired */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <CheckCircle size={14} className="text-green-500" /> Skills Acquired
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(pathData.skillsAcquired || []).map((skill: string, i: number) => (
                    <span key={i} className="bg-green-50 text-green-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-green-100">
                      {skill}
                    </span>
                  ))}
                  {(pathData.skillsAcquired || []).length === 0 && <span className="text-xs text-gray-400">Start learning to build your skills!</span>}
                </div>
              </div>

              {/* Skill Gaps */}
              <div>
                <h3 className="text-sm font-bold text-gray-700 uppercase tracking-widest mb-3 flex items-center gap-2">
                  <Target size={14} className="text-orange-500" /> Skills to Develop
                </h3>
                <div className="flex flex-wrap gap-2">
                  {(pathData.skillGaps || []).map((gap: string, i: number) => (
                    <span key={i} className="bg-orange-50 text-orange-700 px-3 py-1.5 rounded-lg text-xs font-bold border border-orange-100">
                      {gap}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Recommended Learning Path */}
          {(pathData.recommendedPath || []).length > 0 && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-secondary/10 p-2.5 rounded-lg">
                  <TrendingUp size={22} className="text-secondary" />
                </div>
                <h2 className="text-xl font-bold text-primary">Your Recommended Path</h2>
              </div>

              <div className="space-y-4">
                {pathData.recommendedPath.map((rec: any, i: number) => {
                  const pStyle = priorityStyles[rec.priority] || priorityStyles.low;

                  return (
                    <div key={i} className="relative">
                      {/* Connector line */}
                      {i < pathData.recommendedPath.length - 1 && (
                        <div className="absolute left-7 top-[72px] w-0.5 h-8 bg-gray-200 z-0"></div>
                      )}

                      <div className={`relative z-10 border-2 ${pStyle.border} rounded-xl p-6 transition-all hover:shadow-md`}>
                        <div className="flex items-start gap-5">
                          {/* Step Number */}
                          <div className="bg-primary text-white w-14 h-14 rounded-xl flex items-center justify-center font-black text-lg shrink-0 shadow-md">
                            {rec.step}
                          </div>

                          {/* Content */}
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                              <h3 className="text-lg font-bold text-primary">{rec.courseTitle}</h3>
                              <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-md ${pStyle.bg} ${pStyle.text}`}>
                                {pStyle.label}
                              </span>
                            </div>
                            <p className="text-gray-600 text-sm mb-3">{rec.reason}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {(rec.expectedSkills || []).map((skill: string, si: number) => (
                                <span key={si} className="bg-accent/20 text-primary px-2.5 py-1 rounded-md text-[10px] font-bold border border-accent/30">
                                  <Zap size={10} className="inline mr-1" />{skill}
                                </span>
                              ))}
                            </div>
                          </div>

                          {/* Action */}
                          <button
                            onClick={() => navigate(`/courses/${rec.courseId}`)}
                            className="bg-secondary hover:bg-primary text-white px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-colors shrink-0"
                          >
                            View <ChevronRight size={16} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Career Insight & Weekly Goal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Career Insight */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-purple-50 p-2.5 rounded-lg">
                  <TrendingUp size={22} className="text-purple-500" />
                </div>
                <h3 className="text-lg font-bold text-primary">Career Insight</h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">{pathData.careerInsight}</p>
            </div>

            {/* Weekly Goal */}
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-4">
                <div className="bg-orange-50 p-2.5 rounded-lg">
                  <Lightbulb size={22} className="text-orange-500" />
                </div>
                <h3 className="text-lg font-bold text-primary">Your Weekly Goal</h3>
              </div>
              <p className="text-gray-600 leading-relaxed text-sm">{pathData.weeklyGoal}</p>
            </div>
          </div>

          {/* Regenerate */}
          <div className="flex justify-center">
            <button
              onClick={generatePath}
              className="bg-gray-100 hover:bg-gray-200 text-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
            >
              <RotateCcw size={16} /> Refresh Recommendations
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LearningPath;
