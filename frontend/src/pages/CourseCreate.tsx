import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import api from "../api";
import { useAuthStore } from "../store/authStore";
import { BookOpen, PlusCircle, CheckCircle, Save } from "lucide-react";

const CourseCreate = () => {
  const { courseId } = useParams();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [sectors, setSectors] = useState<string[]>([]);
  const [modules, setModules] = useState<any[]>([
    { title: "", lessons: [], quiz: [] },
  ]);
  const [status, setStatus] = useState<"draft" | "published">("draft");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(!!courseId);
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const availableSectors = [
    "Government",
    "Education",
    "Healthcare",
    "Transportation",
    "Public Administration",
  ];

  useEffect(() => {
    if (courseId) {
      api
        .get(`/courses/${courseId}`)
        .then((res) => {
          const { title, description, sectors, modules, status } =
            res.data.course;
          setTitle(title);
          setDescription(description);
          setSectors(sectors);
          setModules(modules);
          setStatus(status || "draft");
          setLoading(false);
        })
        .catch((err) => {
          console.error(err);
          setLoading(false);
        });
    }
  }, [courseId]);

  const handleSubmit = async (submitStatus: "draft" | "published") => {
    setSubmitting(true);
    try {
      const payload = {
        title,
        description,
        sectors,
        modules,
        status: submitStatus,
      };
      let res;
      if (courseId) {
        res = await api.put(`/courses/${courseId}`, payload);
      } else {
        res = await api.post("/courses", payload);
      }
      navigate(`/courses/${res.data._id}`);
    } catch (err) {
      console.error(err);
      alert("Failed to create course");
    } finally {
      setSubmitting(false);
    }
  };

  const handleSectorToggle = (sector: string) => {
    if (sectors.includes(sector)) {
      setSectors(sectors.filter((s) => s !== sector));
    } else {
      setSectors([...sectors, sector]);
    }
  };

  const addModule = () => {
    setModules([...modules, { title: "", lessons: [], quiz: [] }]);
  };

  const updateModuleTitle = (index: number, val: string) => {
    const newModules = [...modules];
    newModules[index].title = val;
    setModules(newModules);
  };

  const addLesson = (moduleIndex: number) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons.push({
      title: "",
      contentType: "video",
      contentUrl: "",
      textContent: "",
      durationMinutes: 10,
    });
    setModules(newModules);
  };

  const updateLesson = (
    moduleIndex: number,
    lessonIndex: number,
    field: string,
    val: any,
  ) => {
    const newModules = [...modules];
    newModules[moduleIndex].lessons[lessonIndex][field] = val;
    setModules(newModules);
  };

  const addQuizQuestion = (moduleIndex: number) => {
    const newModules = [...modules];
    if (!newModules[moduleIndex].quiz) newModules[moduleIndex].quiz = [];
    newModules[moduleIndex].quiz.push({
      question: "",
      options: ["", ""],
      correctAnswer: 0,
      correctAnswers: [],
      type: "single",
    });
    setModules(newModules);
  };

  const toggleCorrectAnswer = (
    mIndex: number,
    qIndex: number,
    oIndex: number,
  ) => {
    const newModules = [...modules];
    const q = newModules[mIndex].quiz[qIndex];
    if (q.type === "multiple") {
      if (!q.correctAnswers) q.correctAnswers = [];
      if (q.correctAnswers.includes(oIndex)) {
        q.correctAnswers = q.correctAnswers.filter((i: number) => i !== oIndex);
      } else {
        q.correctAnswers.push(oIndex);
      }
    } else {
      q.correctAnswer = oIndex;
    }
    setModules(newModules);
  };

  const updateQuizQuestion = (
    mIndex: number,
    qIndex: number,
    field: string,
    val: any,
  ) => {
    const newModules = [...modules];
    newModules[mIndex].quiz[qIndex][field] = val;
    setModules(newModules);
  };

  const updateQuizOption = (
    mIndex: number,
    qIndex: number,
    oIndex: number,
    val: string,
  ) => {
    const newModules = [...modules];
    newModules[mIndex].quiz[qIndex].options[oIndex] = val;
    setModules(newModules);
  };

  const addQuizOption = (mIndex: number, qIndex: number) => {
    const newModules = [...modules];
    newModules[mIndex].quiz[qIndex].options.push("");
    setModules(newModules);
  };

  if (loading) {
    return <div className="p-10 text-center">Loading course data...</div>;
  }

  if (!["admin", "instructor"].includes(currentUser?.role || "")) {
    return (
      <div className="p-10 text-center text-red-500 font-bold">
        Access Denied
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center mb-8 border-b border-gray-100 pb-4">
        <div>
          <h1 className="text-3xl font-bold text-primary">
            {courseId ? "Edit Course" : "Draft New Course"}
          </h1>
          <p className="text-gray-600 mt-1">
            Design global instructional content
          </p>
        </div>
        <div className="flex items-center gap-4">
          {status === "published" ? (
            <span className="bg-green-100 text-green-800 text-xs font-bold px-3 py-1 rounded-full border border-green-200 uppercase tracking-wider">
              Published
            </span>
          ) : (
            <span className="bg-yellow-100 text-yellow-800 text-xs font-bold px-3 py-1 rounded-full border border-yellow-200 uppercase tracking-wider">
              Draft
            </span>
          )}
          <BookOpen size={48} className="text-background" />
        </div>
      </div>

      <form
        onSubmit={(e) => e.preventDefault()}
        className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 space-y-6"
      >
        <div>
          <label
            className="block text-sm font-semibold text-primary mb-2"
            htmlFor="course-title"
          >
            Course Title
          </label>
          <input
            id="course-title"
            type="text"
            required
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-secondary focus:border-secondary transition-colors"
            placeholder="e.g. Advanced Public Policy"
          />
        </div>

        <div>
          <label
            className="block text-sm font-semibold text-primary mb-2"
            htmlFor="course-description"
          >
            Description
          </label>
          <textarea
            id="course-description"
            required
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-secondary focus:border-secondary h-24 transition-colors resize-none"
            placeholder="What will students learn?"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-primary mb-2">
            Target Sectors
          </label>
          <div className="flex flex-wrap gap-2">
            {availableSectors.map((sector) => (
              <button
                type="button"
                key={sector}
                onClick={() => handleSectorToggle(sector)}
                className={`px-4 py-2 rounded-full text-sm font-medium border transition-colors ${
                  sectors.includes(sector)
                    ? "bg-secondary text-white border-secondary"
                    : "bg-white text-gray-600 border-gray-300 hover:border-secondary"
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold text-primary">
              Modules & Content Structure
            </h2>
            <button
              type="button"
              onClick={addModule}
              className="text-secondary hover:text-primary flex items-center gap-1 font-medium transition-colors"
            >
              <PlusCircle size={18} /> Add Module
            </button>
          </div>

          <div className="space-y-6">
            {modules.map((mod, mIndex) => (
              <div
                key={mIndex}
                className="bg-gray-50 p-6 rounded-lg border border-gray-200"
              >
                <div className="flex items-center gap-4 mb-4">
                  <span className="font-bold text-primary w-24">
                    Module {mIndex + 1}:
                  </span>
                  <input
                    type="text"
                    required
                    value={mod.title}
                    onChange={(e) => updateModuleTitle(mIndex, e.target.value)}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:ring-secondary focus:border-secondary transition-colors"
                    placeholder="Module Name"
                    aria-label={`Module ${mIndex + 1} Title`}
                  />
                </div>

                <div className="pl-28 space-y-4">
                  <h4 className="text-sm font-bold text-gray-600 mb-2">
                    Lessons
                  </h4>
                  {mod.lessons.map((lesson: any, lIndex: number) => (
                    <div
                      key={lIndex}
                      className="bg-white p-4 border border-gray-200 rounded shadow-sm space-y-3"
                    >
                      <div className="flex gap-4">
                        <input
                          type="text"
                          required
                          value={lesson.title}
                          onChange={(e) =>
                            updateLesson(
                              mIndex,
                              lIndex,
                              "title",
                              e.target.value,
                            )
                          }
                          className="flex-1 px-3 py-1 border border-gray-300 rounded focus:ring-secondary focus:border-secondary text-sm"
                          placeholder="Lesson Title"
                          aria-label="Lesson Title"
                        />
                        <select
                          value={lesson.contentType}
                          onChange={(e) =>
                            updateLesson(
                              mIndex,
                              lIndex,
                              "contentType",
                              e.target.value,
                            )
                          }
                          className="px-3 py-1 border border-gray-300 rounded focus:ring-secondary focus:border-secondary text-sm"
                          aria-label="Content Type"
                        >
                          <option value="video">Video URL</option>
                          <option value="text">Rich Text</option>
                          <option value="lab">Interactive Lab</option>
                          <option value="assignment">Assignment File</option>
                        </select>
                        <input
                          type="number"
                          value={lesson.durationMinutes}
                          onChange={(e) =>
                            updateLesson(
                              mIndex,
                              lIndex,
                              "durationMinutes",
                              e.target.value,
                            )
                          }
                          className="w-24 px-3 py-1 border border-gray-300 rounded focus:ring-secondary focus:border-secondary text-sm"
                          placeholder="Mins"
                          aria-label="Duration in Minutes"
                        />
                      </div>

                      {lesson.contentType === "video" ||
                      lesson.contentType === "lab" ? (
                        <input
                          type="text"
                          value={lesson.contentUrl}
                          onChange={(e) =>
                            updateLesson(
                              mIndex,
                              lIndex,
                              "contentUrl",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-secondary focus:border-secondary text-sm"
                          placeholder={
                            lesson.contentType === "video"
                              ? "https://youtube.com/..."
                              : "https://labs.example.com/..."
                          }
                          aria-label="Content URL"
                        />
                      ) : (
                        <textarea
                          value={lesson.textContent}
                          onChange={(e) =>
                            updateLesson(
                              mIndex,
                              lIndex,
                              "textContent",
                              e.target.value,
                            )
                          }
                          className="w-full px-3 py-1 border border-gray-300 rounded focus:ring-secondary focus:border-secondary text-sm h-16"
                          placeholder={
                            lesson.contentType === "text"
                              ? "Write instructional content here..."
                              : "Describe the assignment constraints..."
                          }
                          aria-label="Lesson Content"
                        />
                      )}
                    </div>
                  ))}

                  <button
                    type="button"
                    onClick={() => addLesson(mIndex)}
                    className="text-xs font-bold text-secondary hover:text-primary transition-colors flex items-center gap-1"
                  >
                    + Add New Lesson
                  </button>

                  {/* Quiz Section for Module */}
                  <div className="pt-6 mt-4 border-t border-gray-200">
                    <h4 className="text-sm font-bold text-gray-600 mb-2">
                      Module Quiz Configuration
                    </h4>
                    {mod.quiz &&
                      mod.quiz.map((q: any, qIndex: number) => (
                        <div
                          key={qIndex}
                          className="bg-orange-50/50 p-4 border border-orange-100 rounded mb-4"
                        >
                          <div className="flex gap-2 mb-3">
                            <input
                              type="text"
                              value={q.question}
                              onChange={(e) =>
                                updateQuizQuestion(
                                  mIndex,
                                  qIndex,
                                  "question",
                                  e.target.value,
                                )
                              }
                              className="flex-1 px-3 py-2 border border-orange-200 rounded focus:ring-orange-300 text-sm"
                              placeholder="Question text..."
                              aria-label="Quiz Question"
                            />
                            <select
                              value={q.type || "single"}
                              onChange={(e) =>
                                updateQuizQuestion(
                                  mIndex,
                                  qIndex,
                                  "type",
                                  e.target.value,
                                )
                              }
                              className="w-32 px-2 py-2 border border-orange-200 rounded focus:ring-orange-300 text-sm"
                              aria-label="Question Type"
                            >
                              <option value="single">Single Choice</option>
                              <option value="multiple">Multiple Choice</option>
                            </select>
                            <label className="flex items-center gap-1 text-sm">
                              <input
                                type="checkbox"
                                checked={q.isFinalAssessment || false}
                                onChange={(e) =>
                                  updateQuizQuestion(
                                    mIndex,
                                    qIndex,
                                    "isFinalAssessment",
                                    e.target.checked,
                                  )
                                }
                                className="text-red-500 focus:ring-red-500"
                              />
                              Final Assessment
                            </label>
                          </div>
                          <div className="space-y-2 pl-4">
                            {q.options.map((opt: string, oIndex: number) => (
                              <div
                                key={oIndex}
                                className="flex flex-row items-center gap-2"
                              >
                                <input
                                  type={
                                    q.type === "multiple" ? "checkbox" : "radio"
                                  }
                                  name={`correct-${mIndex}-${qIndex}`}
                                  checked={
                                    q.type === "multiple"
                                      ? q.correctAnswers?.includes(oIndex)
                                      : q.correctAnswer === oIndex
                                  }
                                  onChange={() =>
                                    toggleCorrectAnswer(mIndex, qIndex, oIndex)
                                  }
                                  className="text-orange-500 focus:ring-orange-500"
                                  aria-label={`Mark option ${oIndex + 1} as correct`}
                                />
                                <input
                                  type="text"
                                  value={opt}
                                  onChange={(e) =>
                                    updateQuizOption(
                                      mIndex,
                                      qIndex,
                                      oIndex,
                                      e.target.value,
                                    )
                                  }
                                  className="flex-1 px-3 py-1 border border-gray-300 rounded text-sm"
                                  placeholder={`Option ${oIndex + 1}`}
                                  aria-label={`Option ${oIndex + 1} text`}
                                />
                              </div>
                            ))}
                            <button
                              type="button"
                              onClick={() => addQuizOption(mIndex, qIndex)}
                              className="text-xs text-orange-600 hover:text-orange-800 font-medium"
                            >
                              + Add Choice
                            </button>
                          </div>
                        </div>
                      ))}
                    <button
                      type="button"
                      onClick={() => addQuizQuestion(mIndex)}
                      className="text-xs font-bold text-orange-600 hover:text-orange-800 transition-colors flex items-center gap-1"
                    >
                      + Add Quiz Question
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="pt-6 border-t border-gray-100 flex justify-end gap-4">
          <button
            type="button"
            onClick={() => navigate("/courses")}
            className="px-6 py-3 rounded-lg font-bold text-gray-500 hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("draft")}
            disabled={submitting}
            className="bg-gray-100 text-gray-700 hover:bg-gray-200 disabled:opacity-50 px-6 py-3 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2"
          >
            <Save size={20} /> Save as Draft
          </button>
          <button
            type="button"
            onClick={() => handleSubmit("published")}
            disabled={submitting}
            className="bg-primary hover:bg-secondary disabled:opacity-50 text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-md flex items-center gap-2"
          >
            {submitting ? (
              "Saving..."
            ) : (
              <>
                <CheckCircle size={20} /> Publish Course Layout
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CourseCreate;
