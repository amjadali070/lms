import express, { Response } from 'express';
import User from '../models/User';
import Enrollment from '../models/Enrollment';
import { authenticate, AuthRequest, requireRole } from '../middlewares/auth.middleware';
import bcrypt from 'bcrypt';

const router = express.Router();

// Get users (Admin only)
router.get('/', authenticate, requireRole(['admin']), async (req: AuthRequest, res: Response) => {
  try {
    const users = await User.find({}).select('-passwordHash');
    res.json(users);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin can create new users (instructors, students, other admins)
router.post('/', authenticate, requireRole(['admin']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    const passwordHash = await bcrypt.hash(password || 'password123', 10);
    const user = new User({ name, email, passwordHash, role: role || 'student' });
    await user.save();

    res.status(201).json({ message: 'User created successfully', user: { id: user._id, name, email, role } });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin or Instructor can get comprehensive student details
router.get('/:userId/details', authenticate, requireRole(['admin', 'instructor']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.userId).select('-passwordHash');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const enrollments = await Enrollment.find({ studentId: user._id }).populate('courseId', 'title description');
    
    const courses = enrollments.map((e: any) => ({
      enrollmentId: e._id,
      courseId: e.courseId?._id,
      title: e.courseId?.title || 'Unknown Course',
      description: e.courseId?.description || '',
      status: e.status,
      progress: e.progress || 0,
      score: e.score,
      completedAt: e.completedAt,
      enrolledAt: e.createdAt
    }));

    res.json({ user, courses });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
