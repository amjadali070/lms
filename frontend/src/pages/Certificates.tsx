import { useEffect, useState, useRef } from "react";
import { useAuthStore } from "../store/authStore";
import api from "../api";
import CertificateTemplate from "../components/CertificateTemplate";
import { Award, Download, Eye, X } from "lucide-react";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const Certificates = () => {
  const currentUser = useAuthStore((state) => state.user);
  const [completedCourses, setCompletedCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [selectedCourse, setSelectedCourse] = useState<any>(null);
  const [showCertModal, setShowCertModal] = useState(false);
  const [downloadingCert, setDownloadingCert] = useState(false);

  const certificateRef = useRef<HTMLDivElement>(null);
  const certContainerRef = useRef<HTMLDivElement>(null);
  const [certScale, setCertScale] = useState(1);

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
  }, [showCertModal, selectedCourse]);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const res = await api.get("/courses");
        // Safely filter completed ones
        const completed = res.data.filter(
          (c: any) => c.enrollmentStatus === "completed",
        );
        setCompletedCourses(completed);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  const handleDownloadCertificate = async (courseToDownload: any) => {
    setDownloadingCert(true);
    // ensure we mount the specific cert first
    setSelectedCourse(courseToDownload);

    // We need a tick to render the hidden ref
    setTimeout(async () => {
      try {
        if (!certificateRef.current) return;

        const element = certificateRef.current;
        element.parentElement?.classList.remove("hidden");

        const canvas = await html2canvas(element, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("l", "mm", "a4");

        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(
          `${courseToDownload.title.replace(/\s+/g, "_")}_Certificate.pdf`,
        );

        element.parentElement?.classList.add("hidden");
      } catch (err) {
        console.error(err);
        alert("Failed to generate PDF certificate");
      } finally {
        setDownloadingCert(false);
      }
    }, 100);
  };

  const handleView = (course: any) => {
    setSelectedCourse(course);
    setShowCertModal(true);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="max-w-full mx-auto space-y-8">
      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-primary mb-2">
            My Certificates
          </h1>
          <p className="text-gray-600">
            View and download your official achievements.
          </p>
        </div>
        <div className="w-16 h-16 bg-gradient-to-br from-secondary to-accent rounded-full flex items-center justify-center text-white shadow-lg">
          <Award size={32} />
        </div>
      </div>

      {completedCourses.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-xl border border-gray-100 shadow-sm">
          <Award size={48} className="mx-auto text-gray-300 mb-4" />
          <h3 className="text-xl font-bold text-gray-700 mb-2">
            No Certificates Yet
          </h3>
          <p className="text-gray-500 max-w-md mx-auto">
            Complete a course to earn your first official certificate.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {completedCourses.map((course) => (
            <div
              key={course._id}
              className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden flex flex-col group relative"
            >
              {/* Decorative mini-preview header */}
              <div className="h-40 bg-primary/5 flex items-center justify-center relative overflow-hidden p-4">
                <div
                  className="absolute inset-0 opacity-[0.03]"
                  style={{
                    backgroundImage:
                      "radial-gradient(#213448 2px, transparent 2px)",
                    backgroundSize: "10px 10px",
                  }}
                ></div>
                <div className="w-full h-full bg-white shadow-md border border-gray-200 transform scale-[0.6] origin-center rotate-[-2deg] flex items-center justify-center group-hover:rotate-0 transition-transform duration-500 relative">
                  <div className="absolute inset-0 border-4 border-primary m-2 border-opacity-20 pointer-events-none"></div>
                  <h3 className="text-xs font-serif text-primary text-center px-4 max-w-[80%] whitespace-nowrap overflow-hidden text-ellipsis font-bold">
                    CERTIFICATE OF COMPLETION
                  </h3>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col">
                <span className="text-xs font-bold uppercase tracking-widest text-secondary mb-2 block">
                  Achieved on{" "}
                  {new Date(
                    course.completedAt || new Date(),
                  ).toLocaleDateString()}
                </span>
                <h3 className="font-bold text-gray-900 text-lg mb-4 line-clamp-2 leading-tight">
                  {course.title}
                </h3>

                <div className="mt-auto grid grid-cols-2 gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleView(course)}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-bold text-sm bg-gray-50 text-primary hover:bg-gray-100 border border-gray-200 transition-colors"
                  >
                    <Eye size={16} /> View
                  </button>
                  <button
                    disabled={downloadingCert}
                    onClick={() => handleDownloadCertificate(course)}
                    className="flex items-center justify-center gap-2 py-2 px-3 rounded-lg font-bold text-sm bg-primary text-white hover:bg-secondary border border-primary transition-colors"
                  >
                    <Download size={16} /> Download
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hidden layout specifically for canvas drawing */}
      <div className="hidden">
        {selectedCourse && (
          <CertificateTemplate
            ref={certificateRef}
            studentName={currentUser?.name || ""}
            courseTitle={selectedCourse.title}
            issueDate={new Date(selectedCourse.completedAt || new Date())}
            score={selectedCourse.score || 100}
          />
        )}
      </div>

      {/* Modal Overlay for viewing */}
      {showCertModal && selectedCourse && (
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
                aria-label="Close modal"
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
                    courseTitle={selectedCourse.title}
                    issueDate={
                      new Date(selectedCourse.completedAt || new Date())
                    }
                    score={selectedCourse.score || 100}
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
                onClick={() => handleDownloadCertificate(selectedCourse)}
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
  );
};

export default Certificates;
