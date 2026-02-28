import express, { Response } from 'express';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import User from '../models/User';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = express.Router();

// GET /api/dashboard/stats — role-aware dashboard data
router.get('/stats', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;
    const role = req.user!.role;

    if (role === 'admin' || role === 'instructor') {
      // ─── Admin / Instructor Stats ───
      const totalStudents = await User.countDocuments({ role: 'student' });
      const totalInstructors = await User.countDocuments({ role: 'instructor' });
      const totalCourses = await Course.countDocuments();
      const publishedCourses = await Course.countDocuments({ status: 'published' });
      const draftCourses = totalCourses - publishedCourses;

      const allEnrollments = await Enrollment.find().populate('courseId', 'title sectors');
      const totalEnrollments = allEnrollments.length;
      const completedCount = allEnrollments.filter(e => e.status === 'completed').length;
      const inProgressCount = allEnrollments.filter(e => e.status === 'in_progress').length;
      const enrolledOnlyCount = allEnrollments.filter(e => e.status === 'enrolled').length;
      const completionRate = totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100) : 0;

      // Avg score
      const scores = allEnrollments.filter(e => e.score !== undefined && e.score !== null).map(e => e.score!);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

      // Sector breakdown
      const sectorCounts: Record<string, number> = {};
      allEnrollments.forEach((e: any) => {
        const sectors = e.courseId?.sectors || [];
        sectors.forEach((s: string) => {
          sectorCounts[s] = (sectorCounts[s] || 0) + 1;
        });
      });
      const sectorBreakdown = Object.entries(sectorCounts).map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count);

      // Top courses by enrollment
      const courseEnrollCounts: Record<string, { title: string; count: number; completed: number }> = {};
      allEnrollments.forEach((e: any) => {
        const title = e.courseId?.title || 'Unknown';
        if (!courseEnrollCounts[title]) courseEnrollCounts[title] = { title, count: 0, completed: 0 };
        courseEnrollCounts[title].count++;
        if (e.status === 'completed') courseEnrollCounts[title].completed++;
      });
      const topCourses = Object.values(courseEnrollCounts).sort((a, b) => b.count - a.count).slice(0, 5);

      // Top students by XP
      const topStudents = await User.find({ role: 'student' }).sort({ xp: -1 }).limit(5).select('name xp level badges streak');

      // Recent enrollments
      const recentEnrollments = await Enrollment.find()
        .sort({ createdAt: -1 })
        .limit(5)
        .populate('studentId', 'name')
        .populate('courseId', 'title');

      res.json({
        role: 'admin',
        totalStudents,
        totalInstructors,
        totalCourses,
        publishedCourses,
        draftCourses,
        totalEnrollments,
        completedCount,
        inProgressCount,
        enrolledOnlyCount,
        completionRate,
        avgScore,
        sectorBreakdown,
        topCourses,
        topStudents,
        recentEnrollments: recentEnrollments.map((e: any) => ({
          student: e.studentId?.name || 'Unknown',
          course: e.courseId?.title || 'Unknown',
          status: e.status,
          progress: e.progress,
          date: e.createdAt,
        })),
      });
    } else {
      // ─── Student Stats ───
      const enrollments = await Enrollment.find({ studentId: userId }).populate('courseId', 'title sectors modules');
      const totalEnrolled = enrollments.length;
      const completedCourses = enrollments.filter(e => e.status === 'completed');
      const inProgress = enrollments.filter(e => e.status === 'in_progress');
      const enrolledOnly = enrollments.filter(e => e.status === 'enrolled');

      const totalLessons = enrollments.reduce((sum: number, e: any) => {
        return sum + (e.courseId?.modules?.reduce((ms: number, m: any) => ms + (m.lessons?.length || 0), 0) || 0);
      }, 0);
      const completedLessons = enrollments.reduce((sum, e) => sum + e.completedLessons.length, 0);

      const scores = completedCourses.filter(e => e.score !== undefined && e.score !== null).map(e => e.score!);
      const avgScore = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
      const bestScore = scores.length > 0 ? Math.max(...scores) : 0;

      // Gamification
      const student = await User.findById(userId).select('xp level badges streak');

      // In-progress courses detail
      const activeCoursesDetail = inProgress.map((e: any) => ({
        title: e.courseId?.title || 'Unknown',
        progress: e.progress,
        sector: e.courseId?.sectors?.[0] || '',
      }));

      // Completed courses detail
      const completedCoursesDetail = completedCourses.map((e: any) => ({
        title: e.courseId?.title || 'Unknown',
        score: e.score,
        completedAt: e.completedAt,
      }));

      // Sector distribution of enrolled courses
      const studentSectors: Record<string, number> = {};
      enrollments.forEach((e: any) => {
        (e.courseId?.sectors || []).forEach((s: string) => {
          studentSectors[s] = (studentSectors[s] || 0) + 1;
        });
      });
      const sectorDistribution = Object.entries(studentSectors).map(([name, count]) => ({ name, count }));

      res.json({
        role: 'student',
        totalEnrolled,
        completedCount: completedCourses.length,
        inProgressCount: inProgress.length,
        enrolledOnlyCount: enrolledOnly.length,
        totalLessons,
        completedLessons,
        avgScore,
        bestScore,
        xp: student?.xp || 0,
        level: student?.level || 1,
        badges: student?.badges?.length || 0,
        streak: student?.streak || 0,
        activeCoursesDetail,
        completedCoursesDetail,
        sectorDistribution,
      });
    }
  } catch (err: any) {
    console.error('Dashboard stats error:', err);
    res.status(500).json({ error: 'Failed to load dashboard stats' });
  }
});

export default router;
