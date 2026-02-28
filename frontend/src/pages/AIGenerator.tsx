import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';
import { Sparkles, Loader, BookOpen, CheckCircle, Wand2 } from 'lucide-react';

const SECTOR_OPTIONS = ['Government', 'Education', 'Healthcare', 'Transportation', 'Public Administration', 'Finance', 'Technology'];

const AIGenerator = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState('');
  const [description, setDescription] = useState('');
  const [sector, setSector] = useState('Government');
  const [moduleCount, setModuleCount] = useState(3);
  const [generating, setGenerating] = useState(false);
  const [preview, setPreview] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const handleGenerate = async () => {
    if (!topic.trim()) return;
    setGenerating(true);
    setPreview(null);
    setError('');
    try {
      const res = await api.post('/ai/generate-course', { topic, description, sector, moduleCount });
      setPreview(res.data);
    } catch (err: any) {
      setError(err.response?.data?.error || 'AI generation failed. Please check your OpenAI API key.');
    } finally {
      setGenerating(false);
    }
  };

  const handleSaveCourse = async () => {
    if (!preview) return;
    setSaving(true);
    try {
      await api.post('/courses', {
        ...preview,
        status: 'draft'
      });
      navigate('/courses');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to save course');
    } finally {
      setSaving(false);
    }
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
              <Sparkles size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black">AI Course Generator</h1>
            </div>
          </div>
          <p className="text-accent max-w-2xl">
            Describe any topic and our AI will instantly generate a complete, structured course with modules, lessons, and quiz questions ready to publish.
          </p>
        </div>
      </div>

      {/* Input Form */}
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Course Topic *</label>
          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="e.g. HIPAA Compliance Training for Healthcare Workers"
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary text-lg transition-all"
          />
        </div>

        <div>
          <label className="block text-sm font-bold text-gray-700 mb-2">Course Details & Requirements</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe what content should be covered, target audience, learning objectives, specific topics to include or exclude, difficulty level, etc."
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary text-sm transition-all resize-none"
          />
          <p className="text-xs text-gray-400 mt-1">The more detail you provide, the better the AI will tailor the course content.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Target Sector</label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
            >
              {SECTOR_OPTIONS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Number of Modules</label>
            <select
              value={moduleCount}
              onChange={(e) => setModuleCount(Number(e.target.value))}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-secondary focus:border-secondary"
            >
              {[1, 2, 3, 4, 5].map(n => <option key={n} value={n}>{n} Module{n > 1 ? 's' : ''}</option>)}
            </select>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          disabled={generating || !topic.trim()}
          className="w-full bg-secondary hover:bg-primary text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-3 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          {generating ? (
            <>
              <Loader size={22} className="animate-spin" />
              AI is generating your course...
            </>
          ) : (
            <>
              <Wand2 size={22} />
              Generate Course with AI
            </>
          )}
        </button>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 p-4 rounded-lg text-sm font-medium">
            {error}
          </div>
        )}
      </div>

      {/* Preview */}
      {preview && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden animate-fadeIn">
          <div className="bg-background px-8 py-6 border-b border-accent/30 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CheckCircle className="text-green-500" size={24} />
              <h2 className="text-xl font-bold text-primary">AI Generated Course Preview</h2>
            </div>
            <button
              onClick={handleSaveCourse}
              disabled={saving}
              className="bg-secondary hover:bg-primary text-white px-6 py-2.5 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm disabled:opacity-50"
            >
              {saving ? <Loader size={16} className="animate-spin" /> : <BookOpen size={16} />}
              {saving ? 'Saving...' : 'Save as Draft Course'}
            </button>
          </div>

          <div className="p-8 space-y-6">
            <div>
              <h3 className="text-2xl font-bold text-primary mb-2">{preview.title}</h3>
              <p className="text-gray-600">{preview.description}</p>
              <div className="flex gap-2 mt-3">
                {(preview.sectors || []).map((s: string) => (
                  <span key={s} className="text-[10px] font-bold uppercase tracking-wider bg-accent/20 text-primary px-2.5 py-1 rounded-md border border-accent/40">{s}</span>
                ))}
              </div>
            </div>

            {preview.modules?.map((mod: any, i: number) => (
              <div key={i} className="border border-gray-200 rounded-lg overflow-hidden">
                <div className="bg-background/50 px-6 py-4 font-bold text-primary flex justify-between">
                  <span>Module {i + 1}: {mod.title}</span>
                  <span className="text-sm text-secondary font-medium">{mod.lessons?.length || 0} Lessons • {mod.quiz?.length || 0} Quiz Questions</span>
                </div>
                <div className="p-4 space-y-2">
                  {mod.lessons?.map((lesson: any, li: number) => (
                    <div key={li} className="flex items-center gap-3 p-3 bg-gray-50/50 rounded-lg">
                      <span className={`text-xs font-bold uppercase px-2 py-0.5 rounded ${lesson.contentType === 'video' ? 'bg-red-100 text-red-600' : 'bg-accent/20 text-primary'}`}>
                        {lesson.contentType}
                      </span>
                      <span className="font-medium text-gray-800">{lesson.title}</span>
                      <span className="ml-auto text-sm text-secondary">{lesson.durationMinutes} min</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIGenerator;
