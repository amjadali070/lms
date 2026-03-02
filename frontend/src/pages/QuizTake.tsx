import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api";
import { ChevronLeft, FileText } from "lucide-react";
import AlertModal from "../components/AlertModal";

const QuizTake = () => {
  const { courseId, moduleIndex } = useParams();
  const navigate = useNavigate();

  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [answers, setAnswers] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [quizResults, setQuizResults] = useState<any>(null);

  // Modal state
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
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`);
        setCourse(res.data.course);
        const module = res.data.course.modules[parseInt(moduleIndex!)];
        if (module && module.quiz && module.quiz.length > 0) {
          setAnswers(new Array(module.quiz.length).fill(-1));
        }
      } catch (err) {
        console.error(err);
        setAlertModal({
          isOpen: true,
          type: "error",
          title: "Error",
          message: "Failed to load course",
        });
        navigate(`/courses/${courseId}`);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId, moduleIndex, navigate]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-full">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center text-red-500 mt-10">Course not found.</div>
    );
  }

  const module = course.modules[parseInt(moduleIndex!)];
  if (!module || !module.quiz || module.quiz.length === 0) {
    return (
      <div className="text-center text-red-500 mt-10">Quiz not found.</div>
    );
  }

  const quiz = module.quiz;

  const handleAnswerChange = (questionIndex: number, answerIndex: number) => {
    const newAnswers = [...answers];
    if (quiz[questionIndex].type === "single") {
      newAnswers[questionIndex] = answerIndex;
    } else {
      // For multiple choice, toggle
      if (
        !newAnswers[questionIndex] ||
        !Array.isArray(newAnswers[questionIndex])
      )
        newAnswers[questionIndex] = [];
      const current = newAnswers[questionIndex] as number[];
      if (current.includes(answerIndex)) {
        newAnswers[questionIndex] = current.filter(
          (a: number) => a !== answerIndex,
        );
      } else {
        newAnswers[questionIndex] = [...current, answerIndex];
      }
    }
    setAnswers(newAnswers);
  };

  const handleSubmit = async () => {
    setSubmitting(true);
    try {
      await api.post(
        `/courses/${courseId}/modules/${moduleIndex}/quizzes/0/submit`,
        { answers },
      );

      // Calculate detailed results on frontend
      const results = quiz.map((question: any, qIndex: number) => {
        const userAnswer = answers[qIndex];
        let correct = false;

        if (question.type === "single") {
          correct = userAnswer === question.correctAnswer;
        } else {
          // For multiple choice
          const correctAnswers = question.correctAnswers || [];
          const userAnswers = Array.isArray(userAnswer) ? userAnswer : [];
          correct =
            correctAnswers.length === userAnswers.length &&
            correctAnswers.every((ans: number) => userAnswers.includes(ans));
        }

        return {
          questionIndex: qIndex,
          correct,
          userAnswer,
          correctAnswer: question.correctAnswer,
          correctAnswers: question.correctAnswers,
        };
      });

      const correctCount = results.filter((r: any) => r.correct).length;
      const score = Math.round((correctCount / quiz.length) * 100);

      setQuizResults({ score, results });
      setSubmitted(true);

      // Complete module if score >= 70%
      if (score >= 70) {
        try {
          await api.post(
            `/courses/${courseId}/modules/${moduleIndex}/complete`,
          );
          setAlertModal({
            isOpen: true,
            type: "success",
            title: "Quiz Passed!",
            message: `Congratulations! You scored ${score}% and completed this module.`,
          });
        } catch (completeErr) {
          console.error("Failed to complete module:", completeErr);
          setAlertModal({
            isOpen: true,
            type: "info",
            title: "Quiz Submitted",
            message: `You scored ${score}%, but there was an issue completing the module. Please contact support.`,
          });
        }
      } else {
        setAlertModal({
          isOpen: true,
          type: "info",
          title: "Quiz Submitted",
          message: `You scored ${score}%. You need at least 70% to complete this module.`,
        });
      }
    } catch (err: any) {
      console.error(err);
      setAlertModal({
        isOpen: true,
        type: "error",
        title: "Submission Failed",
        message: err.response?.data?.message || "Failed to submit quiz",
      });
    } finally {
      setSubmitting(false);
    }
  };

  const allAnswered = answers.every((a, i) => {
    if (quiz[i].type === "single")
      return a !== undefined && a !== null && a >= 0;
    return Array.isArray(a) && a.length > 0;
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <button
        onClick={() => navigate(`/courses/${courseId}`)}
        className="text-secondary hover:text-primary flex items-center font-medium gap-1 transition-colors"
      >
        <ChevronLeft size={20} /> Back to Course
      </button>

      <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
        <div className="flex items-center gap-3 mb-6">
          <FileText className="text-orange-500" size={24} />
          <div>
            <h1 className="text-2xl font-bold text-primary">
              {module.title} - Quiz
            </h1>
            <p className="text-gray-600">{quiz.length} Questions</p>
          </div>
        </div>

        {submitted && quizResults ? (
          // Quiz Results View
          <div className="space-y-6">
            {/* Score Display */}
            <div className="text-center p-6 bg-gray-50 rounded-lg">
              <div
                className={`text-4xl font-bold mb-2 ${quizResults.score >= 70 ? "text-green-600" : "text-red-600"}`}
              >
                {quizResults.score}%
              </div>
              <div className="text-lg text-gray-600">
                {quizResults.score >= 70 ? "Passed" : "Failed"} - Minimum
                required: 70%
              </div>
              <div className="text-sm text-gray-500 mt-2">
                {quizResults.results.filter((r: any) => r.correct).length} out
                of {quizResults.results.length} questions correct
              </div>
            </div>

            {/* Detailed Results */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-800">
                Quiz Summary
              </h3>
              {quiz.map((question: any, qIndex: number) => {
                const result = quizResults.results[qIndex];
                const isCorrect = result?.correct;

                return (
                  <div
                    key={qIndex}
                    className={`border rounded-lg p-6 ${isCorrect ? "border-green-200 bg-green-50" : "border-red-200 bg-red-50"}`}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <h4 className="text-lg font-medium text-gray-800">
                        {qIndex + 1}. {question.question}
                      </h4>
                      <div
                        className={`px-3 py-1 rounded-full text-sm font-medium ${isCorrect ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                      >
                        {isCorrect ? "Correct" : "Incorrect"}
                      </div>
                    </div>

                    {question.isFinalAssessment && (
                      <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded mb-4 inline-block">
                        Final Assessment
                      </span>
                    )}

                    <div className="space-y-2">
                      {question.options.map(
                        (option: string, oIndex: number) => {
                          const isUserSelected =
                            question.type === "single"
                              ? result.userAnswer === oIndex
                              : Array.isArray(result.userAnswer) &&
                                result.userAnswer.includes(oIndex);
                          const isCorrectOption =
                            question.type === "single"
                              ? result.correctAnswer === oIndex
                              : Array.isArray(result.correctAnswers) &&
                                result.correctAnswers.includes(oIndex);

                          let optionClass =
                            "flex items-center gap-3 p-2 rounded";
                          if (isCorrectOption) {
                            optionClass +=
                              " bg-green-100 border border-green-300";
                          } else if (isUserSelected && !isCorrectOption) {
                            optionClass += " bg-red-100 border border-red-300";
                          } else {
                            optionClass += " bg-gray-50";
                          }

                          return (
                            <div key={oIndex} className={optionClass}>
                              <div className="flex items-center gap-2">
                                <input
                                  type={
                                    question.type === "single"
                                      ? "radio"
                                      : "checkbox"
                                  }
                                  checked={isUserSelected}
                                  readOnly
                                  className="text-gray-400"
                                />
                                {isCorrectOption && (
                                  <span className="text-green-600 font-bold">
                                    ✓
                                  </span>
                                )}
                                {isUserSelected && !isCorrectOption && (
                                  <span className="text-red-600 font-bold">
                                    ✗
                                  </span>
                                )}
                              </div>
                              <span
                                className={
                                  isCorrectOption
                                    ? "font-medium text-green-800"
                                    : isUserSelected
                                      ? "text-red-800"
                                      : "text-gray-700"
                                }
                              >
                                {option}
                              </span>
                            </div>
                          );
                        },
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-gray-200">
              <button
                onClick={() => navigate(`/courses/${courseId}`)}
                className="text-secondary hover:text-primary font-medium transition-colors"
              >
                Back to Course
              </button>
              {quizResults.score >= 70 && (
                <button
                  onClick={() => navigate(`/courses/${courseId}`)}
                  className="bg-primary hover:bg-secondary text-white px-6 py-2 rounded-lg font-medium transition-colors"
                >
                  Continue Learning
                </button>
              )}
            </div>
          </div>
        ) : (
          // Quiz Taking View
          <>
            <div className="space-y-8">
              {quiz.map((question: any, qIndex: number) => (
                <div
                  key={qIndex}
                  className="border border-gray-200 rounded-lg p-6"
                >
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">
                    {qIndex + 1}. {question.question}
                  </h3>
                  {question.isFinalAssessment && (
                    <span className="text-sm bg-red-100 text-red-700 px-2 py-1 rounded mb-4 inline-block">
                      Final Assessment
                    </span>
                  )}
                  <div className="space-y-3">
                    {question.options.map((option: string, oIndex: number) => (
                      <label
                        key={oIndex}
                        className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer"
                      >
                        <input
                          type={
                            question.type === "single" ? "radio" : "checkbox"
                          }
                          name={`question-${qIndex}`}
                          value={oIndex}
                          checked={
                            question.type === "single"
                              ? answers[qIndex] === oIndex
                              : Array.isArray(answers[qIndex]) &&
                                (answers[qIndex] as number[]).includes(oIndex)
                          }
                          onChange={() => handleAnswerChange(qIndex, oIndex)}
                          className="text-secondary focus:ring-secondary"
                        />
                        <span className="text-gray-700">{option}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-8 flex justify-end">
              <button
                onClick={handleSubmit}
                disabled={submitting || !allAnswered}
                className="bg-secondary hover:bg-primary disabled:bg-gray-300 text-white px-8 py-3 rounded-lg font-bold transition-colors shadow-sm"
              >
                {submitting ? "Submitting..." : "Submit Quiz"}
              </button>
            </div>
          </>
        )}
      </div>

      <AlertModal
        isOpen={alertModal.isOpen}
        onClose={() => setAlertModal({ ...alertModal, isOpen: false })}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
      />
    </div>
  );
};

export default QuizTake;
