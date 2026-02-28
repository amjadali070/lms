import { useState, useEffect } from 'react';
import api from '../api';
import { BarChart3, Loader, AlertTriangle, CheckCircle, TrendingUp, TrendingDown, Minus, Users, BookOpen, GraduationCap, Target, Lightbulb, Shield, RotateCcw, Activity, AlertCircle, Zap } from 'lucide-react';

const PerformanceInsights = () => {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState('');

  const generateInsights = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.post('/ai/performance-insights');
      setData(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    generateInsights();
  }, []);

  const getHealthColor = (score: number) => {
    if (score >= 80) return { text: 'text-green-600', bg: 'bg-green-500', ring: 'ring-green-200', label: 'Excellent' };
    if (score >= 60) return { text: 'text-yellow-600', bg: 'bg-yellow-500', ring: 'ring-yellow-200', label: 'Good' };
    if (score >= 40) return { text: 'text-orange-600', bg: 'bg-orange-500', ring: 'ring-orange-200', label: 'Fair' };
    return { text: 'text-red-600', bg: 'bg-red-500', ring: 'ring-red-200', label: 'Needs Attention' };
  };

  const severityStyles: Record<string, { bg: string; text: string; icon: any }> = {
    high: { bg: 'bg-red-50 border-red-200', text: 'text-red-700', icon: AlertTriangle },
    medium: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700', icon: AlertCircle },
    low: { bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', icon: Lightbulb },
  };

  const courseStatusStyles: Record<string, { bg: string; text: string }> = {
    strong: { bg: 'bg-green-50 border-green-200', text: 'text-green-700' },
    needs_attention: { bg: 'bg-yellow-50 border-yellow-200', text: 'text-yellow-700' },
    at_risk: { bg: 'bg-red-50 border-red-200', text: 'text-red-700' },
  };

  const trendIcons: Record<string, any> = {
    positive: TrendingUp,
    negative: TrendingDown,
    neutral: Minus,
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
              <BarChart3 size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black">AI Performance Insights</h1>
            </div>
          </div>
          <p className="text-accent max-w-2xl">
            AI-powered analysis of your entire platform — enrollment trends, risk alerts, course performance, and actionable recommendations.
          </p>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="bg-white p-16 rounded-xl shadow-sm border border-gray-100 text-center">
          <Loader size={44} className="animate-spin text-secondary mx-auto mb-4" />
          <p className="text-primary font-bold text-lg">AI is analyzing platform performance...</p>
          <p className="text-gray-500 text-sm mt-1">Aggregating enrollment data, completion rates, and scores</p>
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 text-red-700 p-6 rounded-xl text-sm font-medium flex items-center justify-between">
          <span>{error}</span>
          <button onClick={generateInsights} className="bg-red-100 hover:bg-red-200 px-4 py-2 rounded-lg font-bold text-xs transition-colors">Retry</button>
        </div>
      )}

      {data && !loading && (
        <div className="space-y-8 animate-fadeIn">

          {/* Top Row: Health Score + Platform Metrics */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Health Score */}
            <div className="lg:col-span-4 bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-4">Platform Health Score</p>
              <div className="relative">
                <svg className="w-40 h-40 transform -rotate-90" viewBox="0 0 120 120">
                  <circle cx="60" cy="60" r="52" fill="none" stroke="#e5e7eb" strokeWidth="10" />
                  <circle
                    cx="60" cy="60" r="52" fill="none"
                    stroke={data.healthScore >= 80 ? '#22c55e' : data.healthScore >= 60 ? '#eab308' : data.healthScore >= 40 ? '#f97316' : '#ef4444'}
                    strokeWidth="10"
                    strokeDasharray={`${(data.healthScore / 100) * 327} 327`}
                    strokeLinecap="round"
                    className="transition-all duration-1000"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className={`text-4xl font-black ${getHealthColor(data.healthScore).text}`}>{data.healthScore}</span>
                  <span className="text-xs font-bold text-gray-500">{getHealthColor(data.healthScore).label}</span>
                </div>
              </div>
            </div>

            {/* Platform Metrics Grid */}
            <div className="lg:col-span-8 grid grid-cols-2 md:grid-cols-4 gap-4">
              {[
                { label: 'Students', value: data.platformMetrics?.totalStudents || 0, icon: Users, color: 'bg-blue-50 text-blue-500' },
                { label: 'Published Courses', value: data.platformMetrics?.publishedCourses || 0, icon: BookOpen, color: 'bg-purple-50 text-purple-500' },
                { label: 'Total Enrollments', value: data.platformMetrics?.totalEnrollments || 0, icon: Target, color: 'bg-orange-50 text-orange-500' },
                { label: 'Completed', value: data.platformMetrics?.completedCount || 0, icon: GraduationCap, color: 'bg-green-50 text-green-500' },
                { label: 'In Progress', value: data.platformMetrics?.inProgressCount || 0, icon: Activity, color: 'bg-yellow-50 text-yellow-500' },
                { label: 'Enrolled Only', value: data.platformMetrics?.enrolledOnlyCount || 0, icon: Users, color: 'bg-gray-50 text-gray-500' },
                { label: 'Completion Rate', value: `${data.platformMetrics?.overallCompletionRate || 0}%`, icon: TrendingUp, color: 'bg-teal-50 text-teal-500' },
                { label: 'Avg Score', value: `${data.platformMetrics?.avgPlatformScore || 0}%`, icon: Zap, color: 'bg-indigo-50 text-indigo-500' },
              ].map((metric, i) => (
                <div key={i} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                  <div className={`${metric.color} p-2.5 rounded-lg`}>
                    <metric.icon size={18} />
                  </div>
                  <div>
                    <p className="text-xl font-black text-primary">{metric.value}</p>
                    <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{metric.label}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Executive Summary */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-secondary/10 p-2.5 rounded-lg">
                <Shield size={22} className="text-secondary" />
              </div>
              <h2 className="text-xl font-bold text-primary">Executive Summary</h2>
            </div>
            <p className="text-gray-600 leading-relaxed bg-background/50 p-5 rounded-lg border border-accent/20">{data.executiveSummary}</p>
          </div>

          {/* Risk Alerts */}
          {(data.riskAlerts || []).length > 0 && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-red-50 p-2.5 rounded-lg">
                  <AlertTriangle size={22} className="text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-primary">Risk Alerts</h2>
              </div>
              <div className="space-y-4">
                {data.riskAlerts.map((alert: any, i: number) => {
                  const style = severityStyles[alert.severity] || severityStyles.low;
                  const AlertIcon = style.icon;
                  return (
                    <div key={i} className={`border rounded-xl p-5 ${style.bg}`}>
                      <div className="flex items-start gap-4">
                        <AlertIcon size={20} className={`${style.text} shrink-0 mt-0.5`} />
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className={`font-bold ${style.text}`}>{alert.title}</h3>
                            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${style.text} bg-white/60`}>{alert.severity}</span>
                          </div>
                          <p className="text-gray-600 text-sm mb-2">{alert.description}</p>
                          <p className="text-sm font-medium text-primary bg-white/60 px-3 py-2 rounded-lg inline-block">
                            💡 {alert.recommendation}
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Course Insights */}
          {(data.courseInsights || []).length > 0 && (
            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-6">
                <div className="bg-secondary/10 p-2.5 rounded-lg">
                  <BookOpen size={22} className="text-secondary" />
                </div>
                <h2 className="text-xl font-bold text-primary">Course Performance</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {data.courseInsights.map((course: any, i: number) => {
                  const style = courseStatusStyles[course.status] || courseStatusStyles.strong;
                  return (
                    <div key={i} className={`border-2 rounded-xl p-5 ${style.bg}`}>
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-primary">{course.courseTitle}</h3>
                        <span className={`text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full ${style.text} bg-white/70`}>
                          {course.status === 'strong' ? '✓ Strong' : course.status === 'needs_attention' ? '⚠ Needs Attention' : '⚠ At Risk'}
                        </span>
                      </div>
                      <p className="text-gray-600 text-sm mb-2">{course.insight}</p>
                      <p className="text-xs font-medium text-primary bg-white/50 px-3 py-1.5 rounded-lg">Action: {course.action}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Course Metrics Table */}
          {(data.courseBreakdown || []).length > 0 && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
              <div className="px-8 py-6 border-b border-gray-100">
                <h2 className="text-xl font-bold text-primary">Course Metrics Breakdown</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-gray-50 border-b border-gray-100">
                      <th className="p-4 pl-8 font-semibold text-gray-600 text-sm">Course</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm text-center">Enrolled</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm text-center">In Progress</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm text-center">Completed</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm text-center">Completion Rate</th>
                      <th className="p-4 font-semibold text-gray-600 text-sm text-center">Avg Score</th>
                      <th className="p-4 pr-8 font-semibold text-gray-600 text-sm text-center">Dropoff</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.courseBreakdown.map((course: any, i: number) => (
                      <tr key={i} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                        <td className="p-4 pl-8 font-bold text-primary text-sm">{course.title}</td>
                        <td className="p-4 text-center font-bold text-gray-700">{course.totalEnrolled}</td>
                        <td className="p-4 text-center text-yellow-600 font-bold">{course.inProgress}</td>
                        <td className="p-4 text-center text-green-600 font-bold">{course.completed}</td>
                        <td className="p-4 text-center">
                          <span className={`font-bold ${course.completionRate >= 70 ? 'text-green-600' : course.completionRate >= 40 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {course.completionRate}%
                          </span>
                        </td>
                        <td className="p-4 text-center font-bold text-primary">{course.avgScore !== null ? `${course.avgScore}%` : '—'}</td>
                        <td className="p-4 pr-8 text-center">
                          <span className={`font-bold ${course.dropoffRate <= 20 ? 'text-green-600' : course.dropoffRate <= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                            {course.dropoffRate}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Trends & Recommendations */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Trends */}
            {(data.trends || []).length > 0 && (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-secondary/10 p-2.5 rounded-lg">
                    <TrendingUp size={22} className="text-secondary" />
                  </div>
                  <h2 className="text-lg font-bold text-primary">Trends</h2>
                </div>
                <div className="space-y-4">
                  {data.trends.map((trend: any, i: number) => {
                    const TrendIcon = trendIcons[trend.impact] || Minus;
                    const trendColor = trend.impact === 'positive' ? 'text-green-500' : trend.impact === 'negative' ? 'text-red-500' : 'text-gray-500';
                    return (
                      <div key={i} className="flex items-start gap-3 p-4 bg-gray-50 rounded-lg">
                        <TrendIcon size={18} className={`${trendColor} shrink-0 mt-0.5`} />
                        <div>
                          <h4 className="font-bold text-primary text-sm">{trend.title}</h4>
                          <p className="text-gray-500 text-xs mt-0.5">{trend.description}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Recommendations */}
            {(data.recommendations || []).length > 0 && (
              <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center gap-3 mb-6">
                  <div className="bg-secondary/10 p-2.5 rounded-lg">
                    <Lightbulb size={22} className="text-secondary" />
                  </div>
                  <h2 className="text-lg font-bold text-primary">Recommendations</h2>
                </div>
                <div className="space-y-4">
                  {data.recommendations.map((rec: any, i: number) => {
                    const pColor = rec.priority === 'high' ? 'bg-red-100 text-red-700' : rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-700' : 'bg-green-100 text-green-700';
                    return (
                      <div key={i} className="p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${pColor}`}>{rec.priority}</span>
                          <h4 className="font-bold text-primary text-sm">{rec.title}</h4>
                        </div>
                        <p className="text-gray-500 text-xs mt-1">{rec.description}</p>
                        <p className="text-xs text-secondary font-medium mt-2">Expected: {rec.expectedImpact}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Engagement Tips */}
          {(data.engagementTips || []).length > 0 && (
            <div className="bg-background/40 p-8 rounded-xl border border-accent/30">
              <h3 className="font-bold text-primary mb-4 flex items-center gap-2"><Zap size={18} className="text-secondary" /> Quick Engagement Tips</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {data.engagementTips.map((tip: string, i: number) => (
                  <div key={i} className="bg-white p-4 rounded-lg border border-gray-100 text-sm text-gray-700 font-medium flex items-start gap-2">
                    <CheckCircle size={14} className="text-green-500 shrink-0 mt-0.5" />
                    {tip}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Refresh */}
          <div className="flex justify-center">
            <button
              onClick={generateInsights}
              className="bg-gray-100 hover:bg-gray-200 text-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
            >
              <RotateCcw size={16} /> Refresh Insights
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default PerformanceInsights;
