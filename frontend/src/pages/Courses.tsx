import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../api';
import { BookOpen, Clock, ChevronRight, CheckCircle, Plus, Filter } from 'lucide-react';

interface Course {
  _id: string;
  title: string;
  description: string;
  sectors?: string[];
  instructorId: { name: string };
  modules: any[];
  status?: string;
  enrollmentStatus?: string;
  progress?: number;
}

const Courses = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSector, setSelectedSector] = useState<string>('all');
  const currentUser = useAuthStore(state => state.user);
  const navigate = useNavigate();

  const fetchCourses = async () => {
    try {
      const res = await api.get('/courses');
      setCourses(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourses();
  }, []);

  const handleEnroll = async (courseId: string) => {
    try {
      await api.post(`/courses/${courseId}/enroll`);
      await fetchCourses(); // Refresh courses to get updated status
    } catch (err) {
      console.error(err);
      alert('Failed to enroll in course');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Courses</h1>
          <p className="text-gray-600 mt-1">
            {currentUser?.role === 'student' ? 'Enroll in or continue learning your designated modules.' : 'Manage instructional content.'}
          </p>
        </div>
        
        {['admin', 'instructor'].includes(currentUser?.role || '') && (
          <button 
            onClick={() => navigate('/courses/new')}
            className="bg-primary hover:bg-secondary text-white px-4 py-2 rounded-lg transition-colors font-medium text-sm flex items-center gap-2"
          >
            <Plus size={16} /> Create Course
          </button>
        )}
      </div>

      {/* Sector Filter Bar */}
      {(() => {
        const allSectors = Array.from(new Set(courses.flatMap(c => c.sectors || [])));
        if (allSectors.length === 0) return null;
        return (
          <div className="flex items-center gap-3 flex-wrap">
            <span className="text-gray-500 flex items-center gap-1.5 text-sm font-medium"><Filter size={14} /> Filter:</span>
            <button
              onClick={() => setSelectedSector('all')}
              className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${selectedSector === 'all' ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-secondary hover:text-secondary'}`}
            >
              All Sectors
            </button>
            {allSectors.map(sector => (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors ${selectedSector === sector ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:border-secondary hover:text-secondary'}`}
              >
                {sector}
              </button>
            ))}
          </div>
        );
      })()}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {courses
          .filter(course => selectedSector === 'all' || (course.sectors || []).includes(selectedSector))
          .map((course) => (
          <div key={course._id} className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col hover:shadow-lg transition-shadow duration-300">
            <div className="h-40 bg-secondary flex items-center justify-center relative overflow-hidden">
               <div className="absolute inset-0 bg-primary opacity-50 mix-blend-multiply"></div>
               <BookOpen size={48} className="text-white z-10 opacity-80" />
               {['admin', 'instructor'].includes(currentUser?.role || '') && (
                 <div className="absolute top-4 left-4 z-20 shadow">
                   <span className={`text-[10px] font-bold px-2 py-1 rounded-full uppercase tracking-wider ${course.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                     {course.status || 'draft'}
                   </span>
                 </div>
               )}
               {course.enrollmentStatus === 'completed' && (
                 <div className="absolute top-4 right-4 bg-green-500 text-white text-xs font-bold px-3 py-1 rounded-full flex items-center gap-1 z-20 shadow">
                   <CheckCircle size={14} /> COMPLETED
                 </div>
               )}
            </div>
            
            <div className="p-6 flex-1 flex flex-col">
              <h3 className="text-xl font-bold text-primary mb-2 line-clamp-1">{course.title}</h3>
              <p className="text-gray-600 text-sm mb-4 line-clamp-2 flex-1">{course.description}</p>
              
              {course.sectors && course.sectors.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {course.sectors.map(sector => (
                    <span key={sector} className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md border border-blue-100">
                      {sector}
                    </span>
                  ))}
                </div>
              )}

              <div className="flex items-center gap-4 text-sm text-gray-500 mb-6">
                <span className="flex items-center gap-1"><BookOpen size={16} className="text-accent" /> {course.modules.length} Modules</span>
                <span className="flex items-center gap-1"><Clock size={16} className="text-accent" /> Self Paced</span>
              </div>

              {currentUser?.role === 'student' && course.enrollmentStatus !== 'not_enrolled' && (
                <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
                  <div 
                    className="bg-secondary h-2 rounded-full transition-all duration-500" 
                    style={{ width: `${course.progress || 0}%` }}
                  ></div>
                </div>
              )}
              
              <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                <span className="text-sm font-medium text-primary">By {course.instructorId?.name || 'Instructor'}</span>
                
                {currentUser?.role === 'student' ? (
                  course.enrollmentStatus === 'not_enrolled' ? (
                    <button 
                      onClick={() => handleEnroll(course._id)}
                      className="bg-secondary hover:bg-primary text-white transition-colors font-medium text-sm px-4 py-2 rounded-lg"
                    >
                      Enroll Now
                    </button>
                  ) : (
                    <button 
                      onClick={() => navigate(`/courses/${course._id}`)}
                      className="text-secondary hover:text-primary transition-colors flex items-center font-medium text-sm gap-1"
                    >
                      {course.enrollmentStatus === 'completed' ? 'Review' : 'Continue'} <ChevronRight size={16} />
                    </button>
                  )
                ) : (
                  <button 
                    onClick={() => navigate(`/courses/${course._id}`)}
                    className="text-secondary hover:text-primary transition-colors flex items-center font-medium text-sm gap-1"
                  >
                    Manage <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
        {courses.length === 0 && (
          <div className="col-span-full p-12 text-center bg-white rounded-xl border border-gray-200 border-dashed">
            <p className="text-gray-500">No courses available yet.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Courses;
