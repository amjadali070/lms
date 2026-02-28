import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { CheckCircle, XCircle } from 'lucide-react';
import api from '../api';

const Quiz = () => {
  const { courseId } = useParams();
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [course, setCourse] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const res = await api.get(`/courses/${courseId}`);
        setCourse(res.data.course);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [courseId]);

  if (loading) {
    return <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div></div>;
  }

  // Gather all quiz questions from all modules
  const allQuestions = course?.modules?.reduce((acc: any[], mod: any) => {
    if (mod.quiz) {
       return [...acc, ...mod.quiz];
    }
    return acc;
  }, []) || [];

  if (allQuestions.length === 0) {
    const handleNoQuizComplete = async () => {
      try {
        await api.post(`/courses/${courseId}/progress`, { score: 100 });
        navigate(`/courses/${courseId}`);
      } catch (err) {
        console.error('Failed to complete course', err);
      }
    };

    return (
      <div className="max-w-3xl border border-gray-100 shadow-sm mx-auto bg-white p-8 rounded-xl mt-6 text-center">
        <h1 className="text-2xl font-bold text-primary mb-4">You've reached the end!</h1>
        <p className="text-gray-600 mb-6">There is no final exam for this course. You can finalize your completion to receive a certificate.</p>
        <button 
          onClick={handleNoQuizComplete}
          className="bg-green-600 hover:bg-green-700 text-white px-8 py-3 rounded-lg font-bold shadow-sm transition-colors"
        >
          Claim Certificate & Complete
        </button>
      </div>
    );
  }

  const handleSelect = (questionIndex: number, optionIndex: number, isMultiple: boolean) => {
    if (submitted) return;
    setAnswers(prev => {
      if (!isMultiple) {
        return { ...prev, [questionIndex]: optionIndex };
      }
      const currentSelections = (prev[questionIndex] as number[]) || [];
      if (currentSelections.includes(optionIndex)) {
        return {
          ...prev,
          [questionIndex]: currentSelections.filter(i => i !== optionIndex)
        };
      } else {
        return {
          ...prev,
          [questionIndex]: [...currentSelections, optionIndex]
        };
      }
    });
  };

  const calculateScore = async () => {
    let points = 0;
    allQuestions.forEach((q: any, i: number) => {
      if (q.type === 'multiple') {
        const correctSets = new Set<number>(q.correctAnswers || []);
        const answerSets = new Set<number>((answers[i] as number[]) || []);
        if (correctSets.size === answerSets.size && [...correctSets].every((v: number) => answerSets.has(v))) {
          points++;
        }
      } else {
        if (answers[i] === q.correctAnswer) points++;
      }
    });
    const finalScore = (points / allQuestions.length) * 100;
    setScore(finalScore);
    setSubmitted(true);

    try {
      await api.post(`/courses/${courseId}/progress`, { score: finalScore });
    } catch (err) {
      console.error('Failed to save score', err);
    }
  };

  const isComplete = allQuestions.every((_: any, i: number) => {
    const ans = answers[i];
    if (ans === undefined) return false;
    if (Array.isArray(ans) && ans.length === 0) return false;
    return true;
  });

  return (
    <div className="max-w-3xl border border-gray-100 shadow-sm mx-auto bg-white p-8 rounded-xl mt-6">
      <div className="border-b border-gray-100 pb-6 mb-6">
        <h1 className="text-3xl font-bold text-primary">{course.title} - Final Assessment</h1>
        <p className="text-gray-500 mt-2">Please answer all questions before submitting.</p>
      </div>

      <div className="space-y-8">
        {allQuestions.map((q: any, qIndex: number) => (
          <div key={q._id || qIndex} className="bg-gray-50 border border-gray-100 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-primary mb-4">{qIndex + 1}. {q.question}</h3>
            <div className="space-y-3">
              {q.options.map((opt: string, oIndex: number) => {
                const isMultiple = q.type === 'multiple';
                const isSelected = isMultiple ? (answers[qIndex] as number[] || []).includes(oIndex) : answers[qIndex] === oIndex;
                const isCorrect = isMultiple ? (q.correctAnswers || []).includes(oIndex) : q.correctAnswer === oIndex;
                const showCorrect = submitted && isCorrect;
                const showWrong = submitted && isSelected && !isCorrect;

                return (
                  <button
                    key={oIndex}
                    onClick={() => handleSelect(qIndex, oIndex, isMultiple)}
                    disabled={submitted}
                    className={`w-full text-left p-4 rounded-lg border-2 transition-all flex items-center gap-3
                      ${isSelected && !submitted ? 'border-secondary bg-blue-50/30' : 'border-gray-200 hover:border-accent'}
                      ${showCorrect ? 'border-green-500 bg-green-50 text-green-900' : ''}
                      ${showWrong ? 'border-red-500 bg-red-50 text-red-900' : ''}
                      ${!isSelected && !showCorrect && submitted ? 'opacity-50' : ''}
                    `}
                  >
                    <input 
                      type={isMultiple ? "checkbox" : "radio"}
                      checked={isSelected}
                      readOnly
                      className={`w-5 h-5 ${isMultiple ? 'rounded' : 'rounded-full'} border-2 flex-shrink-0
                        ${showCorrect ? 'border-green-500 text-green-600' : ''}
                        ${showWrong ? 'border-red-500 text-red-600' : ''}
                        ${!submitted && isSelected ? 'border-secondary text-secondary' : ''}
                        ${!submitted && !isSelected ? 'border-gray-300' : ''}
                      `}
                    />
                    <span className="font-medium flex-1">{opt}</span>
                    {showCorrect && <CheckCircle className="text-green-500" />}
                    {showWrong && <XCircle className="text-red-500" />}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 pt-6 border-t border-gray-100 flex flex-col items-center">
        {!submitted ? (
          <button
            onClick={calculateScore}
            disabled={!isComplete}
            className="bg-primary hover:bg-secondary disabled:opacity-50 disabled:cursor-not-allowed text-white px-8 py-3 rounded-lg font-bold text-lg transition-colors shadow-sm"
          >
            Submit Quiz
          </button>
        ) : (
          <div className="text-center w-full bg-background rounded-xl p-8 border border-secondary">
            <h2 className="text-2xl font-bold text-primary mb-2">Quiz Results</h2>
            <p className="text-gray-600 mb-4">You scored</p>
            <div className={`text-6xl font-black mb-6 ${score >= 80 ? 'text-green-600' : 'text-red-600'}`}>
              {Math.round(score)}%
            </div>
            {score >= 80 ? (
              <p className="text-green-700 font-medium mb-6">Congratulations! You've successfully passed the assessment and completed the course.</p>
            ) : (
              <p className="text-red-700 font-medium mb-6">You did not meet the passing criteria (80%). The score was recorded, but you may need to review the material.</p>
            )}
            <button
              onClick={() => navigate(`/courses/${courseId}`)}
              className="bg-secondary hover:bg-primary text-white px-6 py-2 rounded-lg transition-colors font-medium shadow-sm"
            >
              Return to Course
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quiz;
