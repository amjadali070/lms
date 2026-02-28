import express, { Response } from 'express';
import User from '../models/User';
import Enrollment from '../models/Enrollment';
import { authenticate, AuthRequest } from '../middlewares/auth.middleware';

const router = express.Router();

// XP reward values
const XP_VALUES = {
  ENROLL: 25,
  COMPLETE_LESSON: 50,
  COMPLETE_COURSE: 200,
  PERFECT_SCORE: 100,
  STREAK_BONUS: 30,
};

// Badge definitions
const BADGE_DEFINITIONS: Record<string, { name: string; description: string; check: (stats: any) => boolean }> = {
  first_enrollment: { name: 'First Step', description: 'Enrolled in your first course', check: (s) => s.totalEnrollments >= 1 },
  course_completer: { name: 'Course Completer', description: 'Completed your first course', check: (s) => s.completedCourses >= 1 },
  triple_threat: { name: 'Triple Threat', description: 'Completed 3 courses', check: (s) => s.completedCourses >= 3 },
  perfect_score: { name: 'Perfectionist', description: 'Scored 100% on a quiz', check: (s) => s.hasPerfectScore },
  streak_3: { name: 'On Fire', description: '3-day learning streak', check: (s) => s.streak >= 3 },
  streak_7: { name: 'Unstoppable', description: '7-day learning streak', check: (s) => s.streak >= 7 },
  xp_500: { name: 'Rising Star', description: 'Earned 500 XP', check: (s) => s.xp >= 500 },
  xp_1000: { name: 'Knowledge Seeker', description: 'Earned 1000 XP', check: (s) => s.xp >= 1000 },
  xp_2500: { name: 'Master Learner', description: 'Earned 2500 XP', check: (s) => s.xp >= 2500 },
  five_lessons: { name: 'Bookworm', description: 'Completed 5 lessons', check: (s) => s.completedLessons >= 5 },
};

// Helper: Calculate level from XP
const calculateLevel = (xp: number): number => {
  if (xp < 100) return 1;
  if (xp < 300) return 2;
  if (xp < 600) return 3;
  if (xp < 1000) return 4;
  if (xp < 1500) return 5;
  if (xp < 2100) return 6;
  if (xp < 2800) return 7;
  if (xp < 3600) return 8;
  if (xp < 4500) return 9;
  return 10;
};

// Helper: Update streak
const updateStreak = async (user: any) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (user.lastActiveDate) {
    const lastActive = new Date(user.lastActiveDate);
    const lastActiveDay = new Date(lastActive.getFullYear(), lastActive.getMonth(), lastActive.getDate());
    const diffDays = Math.floor((today.getTime() - lastActiveDay.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      user.streak = (user.streak || 0) + 1;
    } else if (diffDays > 1) {
      user.streak = 1;
    }
    // Same day: don't change streak
  } else {
    user.streak = 1;
  }

  user.lastActiveDate = now;
};

// Helper: Award XP and check badges
const awardXP = async (userId: string, amount: number) => {
  const user = await User.findById(userId);
  if (!user) return null;

  user.xp = (user.xp || 0) + amount;
  user.level = calculateLevel(user.xp);

  // Update streak
  await updateStreak(user);

  // Check badges
  const enrollments = await Enrollment.find({ studentId: userId });
  const stats = {
    totalEnrollments: enrollments.length,
    completedCourses: enrollments.filter(e => e.status === 'completed').length,
    completedLessons: enrollments.reduce((sum, e) => sum + (e.completedLessons?.length || 0), 0),
    hasPerfectScore: enrollments.some(e => e.score === 100),
    streak: user.streak || 0,
    xp: user.xp,
  };

  const currentBadges = new Set(user.badges || []);
  const newBadges: string[] = [];

  for (const [key, def] of Object.entries(BADGE_DEFINITIONS)) {
    if (!currentBadges.has(key) && def.check(stats)) {
      currentBadges.add(key);
      newBadges.push(key);
    }
  }

  user.badges = Array.from(currentBadges);
  await user.save();

  return { xp: user.xp, level: user.level, newBadges, streak: user.streak };
};

// GET /api/gamification/me — Get current user's gamification stats
router.get('/me', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.user!.userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const enrollments = await Enrollment.find({ studentId: user._id });

    // Calculate next level threshold
    const levelThresholds = [0, 100, 300, 600, 1000, 1500, 2100, 2800, 3600, 4500, 5500];
    const currentLevelXP = levelThresholds[Math.min((user.level || 1) - 1, levelThresholds.length - 1)];
    const nextLevelXP = levelThresholds[Math.min(user.level || 1, levelThresholds.length - 1)];

    res.json({
      xp: user.xp || 0,
      level: user.level || 1,
      badges: (user.badges || []).map(b => ({
        id: b,
        ...BADGE_DEFINITIONS[b],
      })),
      streak: user.streak || 0,
      lastActiveDate: user.lastActiveDate,
      currentLevelXP,
      nextLevelXP,
      totalEnrollments: enrollments.length,
      completedCourses: enrollments.filter(e => e.status === 'completed').length,
      allBadges: Object.entries(BADGE_DEFINITIONS).map(([id, def]) => ({
        id,
        name: def.name,
        description: def.description,
        earned: (user.badges || []).includes(id),
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/gamification/leaderboard — Get top students
router.get('/leaderboard', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const students = await User.find({ role: 'student' })
      .select('name email xp level badges streak')
      .sort({ xp: -1 })
      .limit(50);

    const leaderboard = students.map((s, index) => ({
      rank: index + 1,
      _id: s._id,
      name: s.name,
      email: s.email,
      xp: s.xp || 0,
      level: s.level || 1,
      badges: (s.badges || []).length,
      streak: s.streak || 0,
    }));

    res.json(leaderboard);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Export helper for use in course routes
export { awardXP, XP_VALUES };
export default router;
