import { useState, useEffect } from 'react';
import api from '../api';
import { BookOpen, Sparkles, Loader, FileText, Layers, RotateCcw, ChevronLeft, ChevronRight, Lightbulb, BookMarked, GraduationCap, ArrowRight } from 'lucide-react';

interface Course {
  _id: string;
  title: string;
  description: string;
  modules: any[];
}

const StudyHub = () => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
  const [activeTab, setActiveTab] = useState<'notes' | 'flashcards'>('notes');
  const [loading, setLoading] = useState(false);
  const [coursesLoading, setCoursesLoading] = useState(true);

  // Notes state
  const [notes, setNotes] = useState<any>(null);

  // Flashcards state
  const [flashcards, setFlashcards] = useState<any[]>([]);
  const [currentCard, setCurrentCard] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [masteredCards, setMasteredCards] = useState<Set<number>>(new Set());

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get('/courses');
        // Only show enrolled courses for students
        const enrolled = res.data.filter((c: any) => c.enrollmentStatus && c.enrollmentStatus !== 'not_enrolled');
        setCourses(enrolled.length > 0 ? enrolled : res.data);
      } catch (err) {
        console.error(err);
      } finally {
        setCoursesLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const getCourseContext = (course: Course) => {
    return course.modules.map((m: any) =>
      `Module: ${m.title}. Lessons: ${m.lessons.map((l: any) => l.title + (l.textContent ? ` - ${l.textContent.substring(0, 300)}` : '')).join('; ')}`
    ).join('. ');
  };

  const handleGenerateNotes = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    setNotes(null);
    try {
      const res = await api.post('/ai/study-notes', {
        courseTitle: selectedCourse.title,
        courseContent: getCourseContext(selectedCourse)
      });
      setNotes(res.data);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGenerateFlashcards = async () => {
    if (!selectedCourse) return;
    setLoading(true);
    setFlashcards([]);
    setCurrentCard(0);
    setFlipped(false);
    setMasteredCards(new Set());
    try {
      const res = await api.post('/ai/flashcards', {
        courseTitle: selectedCourse.title,
        courseContent: getCourseContext(selectedCourse)
      });
      setFlashcards(res.data.cards || []);
    } catch (err: any) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectCourse = (course: Course) => {
    setSelectedCourse(course);
    setNotes(null);
    setFlashcards([]);
    setCurrentCard(0);
    setFlipped(false);
    setMasteredCards(new Set());
  };

  const handleNextCard = () => {
    setFlipped(false);
    setTimeout(() => setCurrentCard(prev => Math.min(prev + 1, flashcards.length - 1)), 150);
  };

  const handlePrevCard = () => {
    setFlipped(false);
    setTimeout(() => setCurrentCard(prev => Math.max(prev - 1, 0)), 150);
  };

  const toggleMastered = () => {
    setMasteredCards(prev => {
      const next = new Set(prev);
      if (next.has(currentCard)) next.delete(currentCard);
      else next.add(currentCard);
      return next;
    });
  };

  if (coursesLoading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  return (
    <div className="max-w-full mx-auto space-y-8">
      {/* Header */}
      <div className="bg-primary p-8 rounded-2xl text-white relative overflow-hidden shadow-xl">
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-secondary/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-16 -left-16 w-48 h-48 bg-accent/20 rounded-full blur-2xl"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-4">
            <div className="bg-secondary/40 p-3 rounded-xl backdrop-blur-sm">
              <GraduationCap size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black">AI Study Hub</h1>
            </div>
          </div>
          <p className="text-accent max-w-2xl">
            Supercharge your learning with AI-generated study notes and interactive flashcards tailored to your enrolled courses.
          </p>
        </div>
      </div>

      {/* Course Selector */}
      {!selectedCourse ? (
        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-xl font-bold text-primary mb-6 flex items-center gap-2">
            <BookOpen size={22} className="text-secondary" /> Select a Course to Study
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {courses.map(course => (
              <button
                key={course._id}
                onClick={() => handleSelectCourse(course)}
                className="text-left p-6 rounded-xl border-2 border-gray-100 hover:border-secondary hover:shadow-md transition-all group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="bg-background p-2.5 rounded-lg">
                    <BookOpen size={20} className="text-primary" />
                  </div>
                  <ArrowRight size={18} className="text-gray-300 group-hover:text-secondary transition-colors mt-1" />
                </div>
                <h3 className="font-bold text-primary text-lg mb-1 line-clamp-1">{course.title}</h3>
                <p className="text-sm text-gray-500 line-clamp-2">{course.description}</p>
                <p className="text-xs text-secondary font-medium mt-3">{course.modules.length} Modules</p>
              </button>
            ))}
            {courses.length === 0 && (
              <div className="col-span-full text-center p-12 text-gray-400">
                No courses available. Enroll in a course to start studying!
              </div>
            )}
          </div>
        </div>
      ) : (
        <>
          {/* Selected Course Header */}
          <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={() => { setSelectedCourse(null); setNotes(null); setFlashcards([]); }}
                className="text-gray-400 hover:text-primary transition-colors bg-gray-50 p-2 rounded-full"
              >
                <ChevronLeft size={20} />
              </button>
              <div>
                <h2 className="text-xl font-bold text-primary">{selectedCourse.title}</h2>
                <p className="text-sm text-gray-500">{selectedCourse.modules.length} Modules • AI Study Tools</p>
              </div>
            </div>

            {/* Tab Switcher */}
            <div className="flex bg-gray-100 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('notes')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-bold transition-all ${activeTab === 'notes' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-primary'}`}
              >
                <FileText size={16} /> Study Notes
              </button>
              <button
                onClick={() => setActiveTab('flashcards')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-md text-sm font-bold transition-all ${activeTab === 'flashcards' ? 'bg-white text-primary shadow-sm' : 'text-gray-500 hover:text-primary'}`}
              >
                <Layers size={16} /> Flashcards
              </button>
            </div>
          </div>

          {/* NOTES TAB */}
          {activeTab === 'notes' && (
            <div className="space-y-6">
              {!notes && !loading && (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                  <div className="bg-background w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <FileText size={36} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">Generate Smart Study Notes</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-8">
                    AI will analyze all modules and lessons in this course and create structured study notes with key points, vocabulary, and exam tips.
                  </p>
                  <button
                    onClick={handleGenerateNotes}
                    className="bg-secondary hover:bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto transition-colors shadow-lg"
                  >
                    <Sparkles size={20} /> Generate Study Notes
                  </button>
                </div>
              )}

              {loading && activeTab === 'notes' && (
                <div className="bg-white p-16 rounded-xl shadow-sm border border-gray-100 text-center">
                  <Loader size={40} className="animate-spin text-secondary mx-auto mb-4" />
                  <p className="text-primary font-bold text-lg">AI is crafting your study notes...</p>
                  <p className="text-gray-500 text-sm mt-1">Analyzing course content and generating key insights</p>
                </div>
              )}

              {notes && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Summary Card */}
                  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-2xl font-bold text-primary mb-3">{notes.title}</h2>
                    <p className="text-gray-600 bg-background/50 p-4 rounded-lg border border-accent/20 italic">{notes.summary}</p>
                  </div>

                  {/* Sections */}
                  {notes.sections?.map((section: any, i: number) => (
                    <div key={i} className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                      <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                        <span className="bg-secondary text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-black">{i + 1}</span>
                        {section.heading}
                      </h3>
                      <p className="text-gray-600 mb-4">{section.explanation}</p>
                      <div className="space-y-2 mb-4">
                        {section.keyPoints?.map((point: string, pi: number) => (
                          <div key={pi} className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg">
                            <span className="text-secondary mt-0.5">•</span>
                            <span className="text-gray-700 font-medium text-sm">{point}</span>
                          </div>
                        ))}
                      </div>
                      {section.tip && (
                        <div className="flex items-start gap-3 bg-background/50 p-4 rounded-lg border border-accent/30">
                          <Lightbulb size={18} className="text-secondary shrink-0 mt-0.5" />
                          <p className="text-sm text-primary font-medium">{section.tip}</p>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Vocabulary */}
                  {notes.vocabulary && notes.vocabulary.length > 0 && (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                      <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                        <BookMarked size={20} className="text-secondary" /> Key Vocabulary
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {notes.vocabulary.map((v: any, i: number) => (
                          <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <span className="font-bold text-primary text-sm">{v.term}</span>
                            <p className="text-gray-600 text-sm mt-1">{v.definition}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Exam Tips */}
                  {notes.examTips && notes.examTips.length > 0 && (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                      <h3 className="text-lg font-bold text-primary mb-4 flex items-center gap-2">
                        <GraduationCap size={20} className="text-secondary" /> Exam Preparation Tips
                      </h3>
                      <div className="space-y-3">
                        {notes.examTips.map((tip: string, i: number) => (
                          <div key={i} className="flex items-start gap-3 p-4 bg-background/30 rounded-lg border border-accent/20">
                            <span className="bg-secondary text-white w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0">{i + 1}</span>
                            <p className="text-gray-700 font-medium text-sm">{tip}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  <button
                    onClick={handleGenerateNotes}
                    className="bg-gray-100 hover:bg-gray-200 text-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors"
                  >
                    <RotateCcw size={16} /> Regenerate Notes
                  </button>
                </div>
              )}
            </div>
          )}

          {/* FLASHCARDS TAB */}
          {activeTab === 'flashcards' && (
            <div className="space-y-6">
              {flashcards.length === 0 && !loading && (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                  <div className="bg-background w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Layers size={36} className="text-primary" />
                  </div>
                  <h3 className="text-xl font-bold text-primary mb-2">Generate AI Flashcards</h3>
                  <p className="text-gray-500 max-w-md mx-auto mb-8">
                    AI will create 12 interactive flashcards from your course content — perfect for quick revision and testing your knowledge.
                  </p>
                  <button
                    onClick={handleGenerateFlashcards}
                    className="bg-secondary hover:bg-primary text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 mx-auto transition-colors shadow-lg"
                  >
                    <Sparkles size={20} /> Generate Flashcards
                  </button>
                </div>
              )}

              {loading && activeTab === 'flashcards' && (
                <div className="bg-white p-16 rounded-xl shadow-sm border border-gray-100 text-center">
                  <Loader size={40} className="animate-spin text-secondary mx-auto mb-4" />
                  <p className="text-primary font-bold text-lg">AI is creating your flashcards...</p>
                  <p className="text-gray-500 text-sm mt-1">Generating questions across easy, medium, and hard difficulty levels</p>
                </div>
              )}

              {flashcards.length > 0 && (
                <div className="animate-fadeIn">
                  {/* Progress Bar */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm font-bold text-primary">Card {currentCard + 1} of {flashcards.length}</span>
                      <span className="text-sm font-bold text-green-600">{masteredCards.size} / {flashcards.length} Mastered</span>
                    </div>
                    <div className="flex gap-1.5">
                      {flashcards.map((_, i) => (
                        <button
                          key={i}
                          onClick={() => { setCurrentCard(i); setFlipped(false); }}
                          className={`flex-1 h-2 rounded-full transition-all ${
                            i === currentCard ? 'bg-secondary scale-y-150' :
                            masteredCards.has(i) ? 'bg-green-400' : 'bg-gray-200'
                          }`}
                        />
                      ))}
                    </div>
                  </div>

                  {/* Flashcard */}
                  <div className="flex justify-center py-4">
                    <div
                      className="w-full max-w-2xl cursor-pointer"
                      style={{ perspective: '1000px' }}
                      onClick={() => setFlipped(!flipped)}
                    >
                      <div
                        className="relative w-full transition-transform duration-500"
                        style={{
                          transformStyle: 'preserve-3d',
                          transform: flipped ? 'rotateY(180deg)' : 'rotateY(0deg)',
                          minHeight: '280px'
                        }}
                      >
                        {/* Front */}
                        <div
                          className="absolute inset-0 bg-white rounded-2xl shadow-lg border-2 border-gray-100 p-10 flex flex-col items-center justify-center text-center"
                          style={{ backfaceVisibility: 'hidden' }}
                        >
                          <div className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full mb-6 ${
                            flashcards[currentCard]?.difficulty === 'easy' ? 'bg-green-100 text-green-700' :
                            flashcards[currentCard]?.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {flashcards[currentCard]?.difficulty}
                          </div>
                          <p className="text-xl font-bold text-primary leading-relaxed max-w-lg">
                            {flashcards[currentCard]?.front}
                          </p>
                          <p className="text-xs text-gray-400 mt-6 font-medium">Click to reveal answer</p>
                        </div>

                        {/* Back */}
                        <div
                          className="absolute inset-0 bg-primary rounded-2xl shadow-lg p-10 flex flex-col items-center justify-center text-center"
                          style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
                        >
                          <p className="text-lg text-white font-medium leading-relaxed max-w-lg">
                            {flashcards[currentCard]?.back}
                          </p>
                          <p className="text-xs text-accent mt-6 font-medium">Click to flip back</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center justify-center gap-4">
                    <button
                      onClick={handlePrevCard}
                      disabled={currentCard === 0}
                      className="bg-white border border-gray-200 text-primary p-3 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                    >
                      <ChevronLeft size={22} />
                    </button>

                    <button
                      onClick={toggleMastered}
                      className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-sm ${
                        masteredCards.has(currentCard)
                          ? 'bg-green-100 text-green-700 border-2 border-green-300'
                          : 'bg-white text-gray-600 border-2 border-gray-200 hover:border-green-300 hover:text-green-600'
                      }`}
                    >
                      <GraduationCap size={18} />
                      {masteredCards.has(currentCard) ? 'Mastered ✓' : 'Mark as Mastered'}
                    </button>

                    <button
                      onClick={handleNextCard}
                      disabled={currentCard === flashcards.length - 1}
                      className="bg-white border border-gray-200 text-primary p-3 rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
                    >
                      <ChevronRight size={22} />
                    </button>
                  </div>

                  <div className="flex justify-center mt-4">
                    <button
                      onClick={handleGenerateFlashcards}
                      className="bg-gray-100 hover:bg-gray-200 text-primary px-6 py-3 rounded-xl font-bold flex items-center gap-2 transition-colors text-sm"
                    >
                      <RotateCcw size={16} /> Generate New Set
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default StudyHub;
