import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Courses from "./pages/Courses";
import Users from "./pages/Users";
import UserDetail from "./pages/UserDetail";
import CourseCreate from "./pages/CourseCreate";
import CourseDetail from "./pages/CourseDetail";
import CourseAnalytics from "./pages/CourseAnalytics";
import QuizTake from "./pages/QuizTake";
import AIGenerator from "./pages/AIGenerator";
import StudyHub from "./pages/StudyHub";
import Leaderboard from "./pages/Leaderboard";
import LearningPath from "./pages/LearningPath";
import PerformanceInsights from "./pages/PerformanceInsights";
import Certificates from "./pages/Certificates";
import Settings from "./pages/Settings";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login />} />

        <Route path="/" element={<MainLayout />}>
          <Route index element={<Navigate to="/dashboard" replace />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="courses" element={<Courses />} />
          <Route path="courses/new" element={<CourseCreate />} />
          <Route path="courses/:courseId" element={<CourseDetail />} />
          <Route
            path="courses/:courseId/analytics"
            element={<CourseAnalytics />}
          />
          <Route path="courses/:courseId/edit" element={<CourseCreate />} />
          <Route
            path="courses/:courseId/modules/:moduleIndex/quiz"
            element={<QuizTake />}
          />
          {/* Placeholders for scaling */}
          <Route path="users" element={<Users />} />
          <Route path="users/:userId" element={<UserDetail />} />
          <Route path="ai-generator" element={<AIGenerator />} />
          <Route path="study-hub" element={<StudyHub />} />
          <Route path="leaderboard" element={<Leaderboard />} />
          <Route path="learning-path" element={<LearningPath />} />
          <Route
            path="performance-insights"
            element={<PerformanceInsights />}
          />
          <Route path="certificates" element={<Certificates />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
