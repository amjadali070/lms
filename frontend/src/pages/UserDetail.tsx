import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';
import { ChevronLeft, Mail, Shield, BookOpen, Award } from 'lucide-react';

const UserDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUserAndDetails = async () => {
      try {
        const res = await api.get(`/users/${userId}/details`);
        setData(res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchUserAndDetails();
  }, [userId]);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  if (!data || !data.user) {
    return <div className="text-center text-red-500 mt-10">Failed to load user records.</div>;
  }

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header Profile */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between relative pl-24">
        <button 
          onClick={() => navigate('/users')}
          className="absolute top-1/2 -translate-y-1/2 left-8 text-gray-400 hover:text-primary transition-colors bg-gray-50 p-2 rounded-full shadow-sm"
        >
          <ChevronLeft size={20} />
        </button>
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2 flex items-center gap-4">
             {data.user.name}
             <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider
                ${data.user.role === 'admin' ? 'bg-red-100 text-red-700' : 
                  data.user.role === 'instructor' ? 'bg-blue-100 text-blue-700' : 
                  'bg-green-100 text-green-700'}`}
             >
               {data.user.role === 'admin' && <Shield size={12} />}
               {data.user.role}
             </span>
          </h1>
          <div className="flex items-center gap-4 text-gray-500 font-medium mt-1">
             <span className="flex items-center gap-1"><Mail size={16} className="text-gray-400" /> {data.user.email}</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
         {/* Enrolled Courses */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
               <BookOpen className="text-secondary" />
               <h2 className="text-xl font-bold text-primary">Course Enrollments</h2>
            </div>
            <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
               {data.courses.map((course: any) => (
                  <div key={course.enrollmentId} className="border border-gray-100 p-4 rounded-lg bg-gray-50/50 hover:bg-gray-50 transition-colors">
                     <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-primary text-lg">{course.title}</h3>
                        <span className={`text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                          course.status === 'completed' ? 'bg-green-100 text-green-700' :
                          course.status === 'in_progress' ? 'bg-orange-100 text-secondary' :
                          'bg-gray-200 text-gray-600'
                        }`}>
                           {course.status.replace('_', ' ')}
                        </span>
                     </div>
                     <p className="text-sm text-gray-500 line-clamp-1 mb-4">{course.description}</p>
                     
                     {course.status !== 'not_enrolled' && (
                       <div className="flex items-center gap-4">
                          <div className="flex-1 bg-gray-200 rounded-full h-1.5">
                             <div className={`h-1.5 rounded-full ${course.status === 'completed' ? 'bg-green-500' : 'bg-secondary'}`} style={{ width: `${course.progress}%` }}></div>
                          </div>
                          <span className="text-xs font-black text-gray-700 w-10 text-right">{course.progress}%</span>
                       </div>
                     )}
                     
                     {course.score !== undefined && course.score !== null && (
                       <div className="mt-3 text-xs text-green-700 bg-green-50/50 px-2 py-1 rounded inline-block font-bold border border-green-100">
                         Final Score: {course.score}%
                       </div>
                     )}
                  </div>
               ))}
               {data.courses.length === 0 && (
                 <div className="text-center p-8 text-gray-400 font-medium">No active course enrollments.</div>
               )}
            </div>
         </div>

         {/* Certificates Earned */}
         <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col h-full">
            <div className="px-6 py-5 border-b border-gray-100 flex items-center gap-3">
               <Award className="text-yellow-600" />
               <h2 className="text-xl font-bold text-primary">Certificates Earned</h2>
            </div>
            <div className="p-6 space-y-4 flex-1 overflow-y-auto max-h-[600px] custom-scrollbar">
               {data.courses.filter((c: any) => c.status === 'completed').map((course: any) => (
                  <div key={course.enrollmentId} className="border border-green-100 p-4 rounded-lg bg-green-50/30 flex items-center justify-between group">
                     <div>
                        <span className="text-xs font-bold text-green-600 uppercase tracking-widest block mb-1">
                          Completed on {new Date(course.completedAt).toLocaleDateString()}
                        </span>
                        <h3 className="font-bold text-gray-800 text-lg leading-tight">{course.title}</h3>
                     </div>
                     <Award className="text-green-200 group-hover:text-green-500 transition-colors" size={32} />
                  </div>
               ))}
               
               {data.courses.filter((c: any) => c.status === 'completed').length === 0 && (
                 <div className="text-center p-8 text-gray-400 font-medium">No certificates earned yet.</div>
               )}
            </div>
         </div>
      </div>

    </div>
  );
};

export default UserDetail;
