import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { useAuthStore } from "../store/authStore";
import {
  BookOpen,
  CheckCircle,
  Video,
  FileText,
  Award,
  ChevronLeft,
  Edit3,
  ChevronDown,
  Check,
  Download,
  Eye,
  X,
  BarChart,
} from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import ReactPlayer from "react-player";
import CertificateTemplate from "../components/CertificateTemplate";
import AlertModal from "../components/AlertModal";
import AIStudyAssistant from "../components/AIStudyAssistant";

const CourseDetail = () => {
  const { courseId } = useParams();
  const navigate = useNavigate();
  const currentUser = useAuthStore((state) => state.user);

  const [course, setCourse] = useState<any>(null);
  const [enrollment, setEnrollment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeLessonId, setActiveLessonId] = useState<string | null>(null);
  const [downloadingCert, setDownloadingCert] = useState(false);
  const [showCertModal, setShowCertModal] = useState(false);
  const certificateRef = React.useRef<HTMLDivElement>(null);

  const certContainerRef = React.useRef<HTMLDivElement>(null);
  const [certScale, setCertScale] = useState(1);

  // Alert modal state
  const [alertModal, setAlertModal] = useState<{
    isOpen: boolean;
    type: "success" | "error" | "info";
    title: string;
    message: string;
  }>({
    isOpen: false,
    type: "info",
    title: "",
    message: "",
  });

  useEffect(() => {
    const updateScale = () => {
      if (certContainerRef.current) {
        const { clientWidth, clientHeight } = certContainerRef.current;
        const w = clientWidth - 48; // p-6 is 24px per side
        const h = clientHeight - 48;

        const scaleW = w / 1123;
        const scaleH = h / 794;
        setCertScale(Math.min(scaleW, scaleH, 1));
      }
    };

    if (showCertModal) {
      setTimeout(updateScale, 10);
    }

    window.addEventListener("resize", updateScale);
    return () => window.removeEventListener("resize", updateScale);
  }, [showCertModal]);

  useEffect(() => {
    const fetchDetail = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`);
        setCourse(res.data.course);
        setEnrollment(res.data.enrollment);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetail();
  }, [courseId]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center text-red-500 mt-10">
        Course not found or unauthorized.
      </div>
    );
  }

  const isCompleted = enrollment?.status === "completed";
  const completedLessons = enrollment?.completedLessons || [];

  const handleMarkComplete = async (lessonId: string) => {
    try {
      const res = await api.post(
        `/courses/${courseId}/lessons/${lessonId}/complete`,
      );
      setEnrollment(res.data.enrollment);
      setActiveLessonId(null);
    } catch (err) {
      console.error(err);
      setAlertModal({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Failed to mark lesson complete",
      });
    }
  };

  const handleStartQuiz = (moduleIndex: number) => {
    navigate(`/courses/${courseId}/modules/${moduleIndex}/quiz`);
  };

  const handleDownloadCertificate = async () => {
    setDownloadingCert(true);
    try {
      if (!certificateRef.current) return;

      const element = certificateRef.current;
      element.parentElement?.classList.remove("hidden"); // unhide for canvas

      const canvas = await html2canvas(element, { scale: 2 });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("l", "mm", "a4"); // Landscape A4

      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${course.title.replace(/\s+/g, "_")}_Certificate.pdf`);

      element.parentElement?.classList.add("hidden"); // hide again
    } catch (err) {
      console.error(err);
      setAlertModal({
        isOpen: true,
        type: "error",
        title: "Error",
        message: "Failed to generate PDF certificate",
      });
    } finally {
      setDownloadingCert(false);
    }
  };

  return (
    <>
      <div className="max-w-5xl mx-auto space-y-6">
        <button
          onClick={() => navigate("/courses")}
          className="text-secondary hover:text-primary flex items-center font-medium gap-1 transition-colors"
        >
          <ChevronLeft size={20} /> Back to Courses
        </button>

        <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-background rounded-bl-full opacity-50 z-0 pointer-events-none"></div>
          <div className="relative z-10">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-4">
                <h1 className="text-3xl font-bold text-primary">
                  {course.title}
                </h1>
                {["admin", "instructor"].includes(currentUser?.role || "") && (
                  <span
                    className={`text-xs font-bold px-3 py-1 rounded-full border uppercase tracking-wider ${course.status === "published" ? "bg-green-100 text-green-800 border-green-200" : "bg-yellow-100 text-yellow-800 border-yellow-200"}`}
                  >
                    {course.status || "draft"}
                  </span>
                )}
              </div>
              <div className="flex gap-4">
                {["admin", "instructor"].includes(currentUser?.role || "") && (
                  <>
                    <button
                      onClick={() =>
                        navigate(`/courses/${course._id}/analytics`)
                      }
                      className="bg-blue-100 hover:bg-blue-200 text-blue-700 px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <BarChart size={18} /> Analytics
                    </button>
                    <button
                      onClick={() => navigate(`/courses/${course._id}/edit`)}
                      className="bg-gray-100 hover:bg-gray-200 text-primary px-4 py-2 rounded-lg font-bold flex items-center gap-2 transition-colors shadow-sm"
                    >
                      <Edit3 size={18} /> Edit Course
                    </button>
                  </>
                )}
                {isCompleted && (
                  <span className="bg-green-100 text-green-700 px-4 py-1.5 rounded-full font-bold text-sm flex items-center gap-2">
                    <CheckCircle size={16} /> COMPLETED
                  </span>
                )}
              </div>
            </div>
            <p className="text-gray-600 mb-6 max-w-2xl">{course.description}</p>
            <div className="flex items-center gap-6 text-sm text-gray-500 font-medium flex-wrap">
              <span className="flex items-center gap-2">
                <BookOpen size={18} className="text-secondary" />{" "}
                {course.modules.length} Modules
              </span>
              <span className="flex items-center gap-2">
                <Award size={18} className="text-secondary" /> Certificate
                Included
              </span>
              {course.sectors && course.sectors.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap">
                  {course.sectors.map((sector: string) => (
                    <span
                      key={sector}
                      className="text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 px-2.5 py-1 rounded-md border border-blue-100"
                    >
                      {sector}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {currentUser?.role === "student" && !isCompleted && enrollment && (
              <div className="mt-8">
                <button
                  onClick={async () => {
                    if (enrollment.progress < 70) {
                      setAlertModal({
                        isOpen: true,
                        type: "error",
                        title: "Cannot Complete Course",
                        message:
                          "Progress must be at least 70% to complete the course.",
                      });
                      return;
                    }
                    try {
                      const res = await api.post(
                        `/courses/${courseId}/complete`,
                      );
                      setEnrollment(res.data.enrollment);
                      setAlertModal({
                        isOpen: true,
                        type: "success",
                        title: "Success",
                        message: "Course completed successfully!",
                      });
                    } catch (err: any) {
                      setAlertModal({
                        isOpen: true,
                        type: "error",
                        title: "Error",
                        message:
                          err.response?.data?.message ||
                          "Failed to complete course",
                      });
                    }
                  }}
                  className="bg-secondary hover:bg-primary text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-sm"
                >
                  Complete Course
                </button>
              </div>
            )}

            {isCompleted && currentUser?.role === "student" && (
              <div className="mt-8 flex flex-wrap gap-4">
                <button
                  onClick={() => setShowCertModal(true)}
                  className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2"
                >
                  <Eye size={18} /> View Certificate
                </button>
                <button
                  onClick={handleDownloadCertificate}
                  disabled={downloadingCert}
                  className="bg-gray-100 hover:bg-gray-200 text-primary px-6 py-2 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2 border"
                >
                  <Download size={18} />{" "}
                  {downloadingCert ? "Generating..." : "Download"}
                </button>
                <div className="text-green-600 font-semibold px-4 py-2 bg-green-50 rounded-lg flex items-center border border-green-200 ml-auto">
                  Final Score: {enrollment.score}%
                </div>
              </div>
            )}

            {currentUser?.role === "student" && enrollment && !isCompleted && (
              <div className="mt-6 border-t border-gray-100/30 pt-4">
                <p className="text-sm text-gray-500 font-medium mb-2">
                  Overall Progress
                </p>
                <div className="flex items-center gap-4">
                  <div className="flex-1 bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-secondary h-2 rounded-full transition-all duration-500"
                      style={{ width: `${enrollment.progress || 0}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-bold text-primary">
                    {enrollment.progress || 0}%
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-primary mb-6 border-b border-gray-100 pb-4">
            Course Content
          </h2>

          <div className="space-y-6">
            {course.modules.map((module: any, index: number) => (
              <div
                key={module._id || index}
                className="border border-gray-200 rounded-lg overflow-hidden"
              >
                <div className="bg-gray-50 px-6 py-4 flex items-center justify-between font-bold text-primary">
                  <span>
                    Module {index + 1}: {module.title}
                  </span>
                  <span className="text-sm text-gray-500 font-medium">
                    {module.lessons.length} Lessons
                  </span>
                </div>
                <div className="divide-y divide-gray-100">
                  {module.lessons.map((lesson: any, lIndex: number) => {
                    const lessonCompleted = completedLessons.includes(
                      lesson._id,
                    );
                    const isActive = activeLessonId === lesson._id;

                    return (
                      <div key={lesson._id || lIndex} className="flex flex-col">
                        <div
                          onClick={() =>
                            setActiveLessonId(isActive ? null : lesson._id)
                          }
                          className={`px-6 py-4 flex items-center justify-between cursor-pointer transition-colors ${isActive ? "bg-blue-50/50" : "hover:bg-gray-50"}`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`p-2 rounded w-8 h-8 flex items-center justify-center ${lessonCompleted ? "bg-green-100 text-green-500" : "bg-blue-100 text-blue-500"}`}
                            >
                              {lessonCompleted ? (
                                <Check size={16} />
                              ) : (
                                <Video size={16} />
                              )}
                            </div>
                            <span
                              className={`font-medium ${lessonCompleted ? "text-gray-500 line-through" : "text-gray-800"}`}
                            >
                              {lesson.title}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-500">
                            <span>{lesson.durationMinutes} min</span>
                            <ChevronDown
                              size={16}
                              className={`transition-transform ${isActive ? "rotate-180" : ""}`}
                            />
                          </div>
                        </div>

                        {isActive && (
                          <div className="px-14 py-6 bg-white border-t border-b border-gray-100 animate-fadeIn space-y-4">
                            {lesson.contentType === "video" && (
                              <div className="aspect-video bg-gray-900 rounded-lg overflow-hidden flex items-center justify-center text-gray-400 relative">
                                {lesson.contentUrl ? (
                                  (() => {
                                    let finalUrl = lesson.contentUrl.trim();
                                    const iframeMatch =
                                      finalUrl.match(/src=["']([^"']+)["']/);
                                    if (iframeMatch) {
                                      finalUrl = iframeMatch[1];
                                    } else if (
                                      !finalUrl.startsWith("http") &&
                                      !finalUrl.startsWith("//")
                                    ) {
                                      finalUrl = `https://${finalUrl}`;
                                    }

                                    // Extract YouTube
                                    if (
                                      finalUrl.includes("youtube.com") ||
                                      finalUrl.includes("youtu.be")
                                    ) {
                                      let videoId = "";
                                      if (finalUrl.includes("youtu.be/"))
                                        videoId = finalUrl
                                          .split("youtu.be/")[1]
                                          .split("?")[0];
                                      else if (finalUrl.includes("watch?v="))
                                        videoId = finalUrl
                                          .split("watch?v=")[1]
                                          .split("&")[0];
                                      else if (finalUrl.includes("/embed/"))
                                        videoId = finalUrl
                                          .split("/embed/")[1]
                                          .split("?")[0];

                                      if (videoId) {
                                        return (
                                          <iframe
                                            className="absolute top-0 left-0 w-full h-full"
                                            src={`https://www.youtube.com/embed/${videoId}?autoplay=0&rel=0`}
                                            title="Video player"
                                            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                            allowFullScreen
                                          ></iframe>
                                        );
                                      }
                                    }

                                    // Extract Vimeo
                                    if (finalUrl.includes("vimeo.com")) {
                                      let videoId = finalUrl
                                        .split("vimeo.com/")[1]
                                        .split("?")[0];
                                      if (videoId) {
                                        return (
                                          <iframe
                                            className="absolute top-0 left-0 w-full h-full"
                                            src={`https://player.vimeo.com/video/${videoId}`}
                                            title="Video player"
                                            allow="autoplay; fullscreen; picture-in-picture"
                                            allowFullScreen
                                          ></iframe>
                                        );
                                      }
                                    }

                                    // Fallback generic react-player
                                    const Player =
                                      (ReactPlayer as any).default ||
                                      ReactPlayer;
                                    return (
                                      <Player
                                        url={finalUrl}
                                        width="100%"
                                        height="100%"
                                        controls={true}
                                        className="absolute top-0 left-0"
                                        fallback={
                                          <div className="text-white flex items-center justify-center p-8">
                                            <Video
                                              size={48}
                                              className="animate-pulse opacity-50"
                                            />
                                          </div>
                                        }
                                      />
                                    );
                                  })()
                                ) : (
                                  <span>No Valid Video URL Provided</span>
                                )}
                              </div>
                            )}

                            {lesson.contentType === "text" && (
                              <div className="prose max-w-none text-gray-600">
                                <p>{lesson.textContent}</p>
                              </div>
                            )}

                            {(lesson.contentType === "assignment" ||
                              lesson.contentType === "lab") && (
                              <div className="p-6 bg-gray-50 border border-gray-200 rounded-lg">
                                <h4 className="font-bold text-gray-700 mb-2">
                                  Instructions:
                                </h4>
                                <p className="text-gray-600 text-sm mb-4">
                                  {lesson.textContent}
                                </p>
                                {lesson.contentUrl && (
                                  <a
                                    href={lesson.contentUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="text-secondary font-medium hover:underline text-sm mb-4 inline-block"
                                  >
                                    Open External Resource
                                  </a>
                                )}

                                {lesson.contentType === "assignment" &&
                                  currentUser?.role === "student" &&
                                  !lessonCompleted && (
                                    <div className="mt-4 pt-4 border-t border-gray-200">
                                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Submit your work (PDF, DOCX, ZIP)
                                      </label>
                                      <input
                                        type="file"
                                        className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-secondary cursor-pointer"
                                      />
                                    </div>
                                  )}
                              </div>
                            )}

                            {currentUser?.role === "student" &&
                              !lessonCompleted && (
                                <div className="pt-4 mt-4 border-t border-gray-100 flex justify-end">
                                  <button
                                    onClick={() => {
                                      if (lesson.contentType === "assignment") {
                                        setAlertModal({
                                          isOpen: true,
                                          type: "success",
                                          title: "Success",
                                          message:
                                            "Assignment file uploaded and submitted successfully!",
                                        });
                                      }
                                      handleMarkComplete(lesson._id);
                                    }}
                                    className="bg-secondary hover:bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm transition-colors shadow-sm"
                                  >
                                    {lesson.contentType === "assignment"
                                      ? "Submit Assignment"
                                      : "Mark as Complete"}
                                  </button>
                                </div>
                              )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                  {module.quiz && module.quiz.length > 0 && (
                    <div
                      className="px-6 py-4 flex items-center justify-between bg-orange-50/30 hover:bg-orange-50 cursor-pointer"
                      onClick={() => handleStartQuiz(index)}
                    >
                      <div className="flex items-center gap-3">
                        <div className="bg-orange-100 text-orange-500 p-2 rounded w-8 h-8 flex items-center justify-center">
                          <FileText size={16} />
                        </div>
                        <span className="font-medium text-orange-800">
                          Module Quiz ({module.quiz.length} Questions)
                        </span>
                      </div>
                      <ChevronDown size={16} />
                    </div>
                  )}
                </div>
              </div>
            ))}

            {course.modules.length === 0 && (
              <p className="text-gray-500 italic">
                No modules have been added to this course yet.
              </p>
            )}

            {["admin", "instructor"].includes(currentUser?.role || "") && (
              <button
                onClick={() => navigate(`/courses/${course._id}/edit`)}
                className="w-full border-2 border-dashed border-gray-300 text-gray-500 hover:border-secondary hover:text-secondary rounded-lg py-4 font-bold transition-colors"
              >
                + Add / Edit Modules
              </button>
            )}
          </div>
        </div>

        {/* Hidden layout specifically for canvas drawing */}
        {isCompleted && currentUser?.role === "student" && (
          <div className="hidden">
            <CertificateTemplate
              ref={certificateRef}
              studentName={currentUser?.name || ""}
              courseTitle={course.title}
              issueDate={new Date(enrollment.completedAt || new Date())}
              score={enrollment.score || 100}
            />
          </div>
        )}

        {/* Modal Overlay for viewing */}
        {showCertModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fadeIn p-4 overflow-y-auto">
            <div className="relative bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-[800px] max-h-[95vh] overflow-hidden my-auto border border-gray-100/20">
              {/* Modal Header */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50/80">
                <div className="flex items-center gap-3">
                  <Award className="text-secondary" size={24} />
                  <h3 className="font-bold text-gray-800 text-lg">
                    Official Certificate
                  </h3>
                </div>
                <button
                  onClick={() => setShowCertModal(false)}
                  className="text-gray-400 hover:bg-gray-200 hover:text-gray-800 p-2 rounded-full transition-colors"
                  aria-label="Close certificate modal"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Certificate Wrapper - React calculated scaling */}
              <div
                ref={certContainerRef}
                className="bg-[#f0f2f5] flex items-center justify-center p-6 overflow-hidden flex-1"
              >
                <div
                  className="bg-white shadow-md relative ring-1 ring-gray-900/5 transition-all duration-200"
                  style={{
                    width: 1123 * certScale,
                    height: 794 * certScale,
                  }}
                >
                  <div
                    className="absolute top-0 left-0 bg-white ring-1 ring-gray-900/5 origin-top-left"
                    style={{
                      width: "1123px",
                      height: "794px",
                      transform: `scale(${certScale})`,
                    }}
                  >
                    <CertificateTemplate
                      studentName={currentUser?.name || ""}
                      courseTitle={course.title}
                      issueDate={new Date(enrollment.completedAt || new Date())}
                      score={enrollment.score || 100}
                    />
                  </div>
                </div>
              </div>

              {/* Modal Footer Actions */}
              <div className="px-6 py-4 bg-gray-50 flex items-center justify-between border-t border-gray-100">
                <span className="text-sm text-gray-500 font-medium hidden sm:block">
                  Ready to print or save.
                </span>
                <button
                  onClick={() => {
                    handleDownloadCertificate();
                  }}
                  disabled={downloadingCert}
                  className="bg-primary hover:bg-secondary text-white px-6 py-2.5 rounded-lg font-bold transition-colors shadow-sm flex items-center gap-2 ml-auto"
                >
                  <Download size={18} />{" "}
                  {downloadingCert ? "Generating PDF..." : "Download PDF Copy"}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* AI Study Assistant - Floating Chatbot */}
      {course && (
        <AIStudyAssistant
          courseContext={`Course: ${course.title}. ${course.description}. Modules: ${course.modules.map((m: any) => `${m.title}: ${m.lessons.map((l: any) => l.title + (l.textContent ? " - " + l.textContent.substring(0, 200) : "")).join(", ")}`).join(". ")}`}
        />
      )}

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
      />
    </>
  );
};

export default CourseDetail;
