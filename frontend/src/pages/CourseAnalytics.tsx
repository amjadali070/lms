import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { Users, CheckCircle, Clock, ChevronLeft } from 'lucide-react';

const CourseAnalytics = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await api.get(`/courses/${courseId}/analytics`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, [courseId]);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (!data) {
    return <div className="text-center text-red-500 mt-10">Failed to load analytics.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative">
        <button 
          onClick={() => navigate(`/courses/${courseId}`)}
          className="absolute top-8 left-8 text-gray-400 hover:text-primary transition-colors bg-gray-50 p-2 rounded-full"
        >
          <ChevronLeft size={20} />
        </button>
        <div className="pl-16">
          <h1 className="text-3xl font-bold text-primary mb-2 line-clamp-1">{data.course.title}</h1>
          <p className="text-gray-500 uppercase tracking-widest text-xs font-bold">Course Analytics report</p>
        </div>
      </div>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 uppercase text-xs tracking-widest font-bold mb-1">Total Enrolled</p>
            <h3 className="text-4xl font-black text-primary">{data.metrics.total}</h3>
          </div>
          <div className="bg-blue-50 text-blue-500 p-4 rounded-full">
            <Users size={32} />
          </div>
        </div>
        
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 uppercase text-xs tracking-widest font-bold mb-1">In Progress</p>
            <h3 className="text-4xl font-black text-secondary">{data.metrics.inProgress}</h3>
          </div>
          <div className="bg-orange-50 text-secondary p-4 rounded-full">
            <Clock size={32} />
          </div>
        </div>

        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
          <div>
            <p className="text-gray-500 uppercase text-xs tracking-widest font-bold mb-1">Completed</p>
            <h3 className="text-4xl font-black text-green-600">{data.metrics.completed}</h3>
          </div>
          <div className="bg-green-50 text-green-500 p-4 rounded-full">
            <CheckCircle size={32} />
          </div>
        </div>
      </div>

      {/* Roster Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="px-8 py-6 border-b border-gray-100">
           <h2 className="text-xl font-bold text-primary">Student Roster</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="p-4 pl-8 font-semibold text-gray-600 text-sm">Student</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Enrolled On</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Progress</th>
                <th className="p-4 pr-8 font-semibold text-gray-600 text-sm text-right">Score</th>
              </tr>
            </thead>
            <tbody>
              {data.students.map((student: any) => (
                <tr key={student._id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="p-4 pl-8">
                     <div className="font-bold text-primary">{student.name}</div>
                     <div className="text-xs text-gray-500">{student.email}</div>
                  </td>
                  <td className="p-4 text-sm text-gray-600">
                     {new Date(student.enrolledAt).toLocaleDateString()}
                  </td>
                  <td className="p-4">
                     {student.status === 'completed' ? (
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-green-100 text-green-700 uppercase tracking-wide">Completed</span>
                     ) : student.status === 'in_progress' ? (
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-100 text-secondary uppercase tracking-wide">In Progress</span>
                     ) : (
                       <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 uppercase tracking-wide">Enrolled</span>
                     )}
                  </td>
                  <td className="p-4">
                     <div className="flex items-center gap-3 max-w-[150px]">
                        <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                          <div className={`h-1.5 rounded-full ${student.status === 'completed' ? 'bg-green-500' : 'bg-secondary'}`} style={{ width: `${student.progress || 0}%` }}></div>
                        </div>
                        <span className="text-xs font-bold text-gray-600 w-8">{student.progress || 0}%</span>
                     </div>
                  </td>
                  <td className="p-4 pr-8 text-right font-bold text-primary">
                     {student.score !== null && student.score !== undefined ? `${student.score}%` : '--'}
                  </td>
                </tr>
              ))}
              {data.students.length === 0 && (
                <tr>
                  <td colSpan={5} className="p-8 text-center text-gray-500">
                    No students enrolled yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CourseAnalytics;
