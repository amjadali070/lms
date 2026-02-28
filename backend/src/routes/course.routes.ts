import express, { Response } from 'express';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import { authenticate, AuthRequest, requireRole } from '../middlewares/auth.middleware';
import { awardXP, XP_VALUES } from './gamification.routes';

const router = express.Router();

// Get courses (students see published, admins/instructors see all for now)
router.get('/', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    const { userId, role } = req.user!;
    
    // Students only see published courses
    const filter = role === 'student' ? { status: 'published' } : {};
    const courses = await Course.find(filter).populate('instructorId', 'name');
    
    if (role === 'student') {
      const enrollments = await Enrollment.find({ studentId: userId });
      const coursesWithStatus = courses.map(course => {
        const enrollment = enrollments.find(e => e.courseId.toString() === course._id.toString());
        return {
          ...course.toObject(),
          enrollmentStatus: enrollment ? enrollment.status : 'not_enrolled',
          enrollmentId: enrollment?._id,
          progress: enrollment?.progress || 0,
          score: enrollment?.score,
          completedAt: enrollment?.completedAt
        };
      });
      res.json(coursesWithStatus);
    } else {
      res.json(courses);
    }
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin or Instructor can create courses
router.post('/', authenticate, requireRole(['admin', 'instructor']), async (req: AuthRequest, res: Response) => {
  try {
    const { title, description, modules, sectors, status } = req.body;
    const { userId } = req.user!;

    const newCourse = new Course({
      title,
      description,
      sectors: sectors || [],
      instructorId: userId,
      modules: modules || [],
      status: status || 'draft',
    });

    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Admin or Instructor can update courses
router.put('/:courseId', authenticate, requireRole(['admin', 'instructor']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, modules, sectors, status } = req.body;
    
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    course.title = title || course.title;
    course.description = description || course.description;
    course.sectors = sectors || course.sectors;
    course.modules = modules || course.modules;
    if (status) course.status = status;

    await course.save();
    res.json(course);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});
// Get analytics for a single course (Admin/Instructor)
router.get('/:courseId/analytics', authenticate, requireRole(['admin', 'instructor']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const enrollments = await Enrollment.find({ courseId: course._id }).populate('studentId', 'name email');
    
    const total = enrollments.length;
    const completed = enrollments.filter(e => e.status === 'completed').length;
    const inProgress = enrollments.filter(e => e.status === 'in_progress').length;

    const students = enrollments.map((e: any) => ({
      _id: e.studentId._id,
      name: e.studentId.name,
      email: e.studentId.email,
      status: e.status,
      progress: e.progress || 0,
      score: e.score,
      completedAt: e.completedAt,
      enrolledAt: e.createdAt
    }));

    res.json({
      course: { title: course.title },
      metrics: { total, completed, inProgress },
      students
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Get a single course
router.get('/:courseId', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.courseId).populate('instructorId', 'name');
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }
    
    let enrollment = null;
    if (req.user!.role === 'student') {
      enrollment = await Enrollment.findOne({ courseId: course._id, studentId: req.user!.userId });
    }

    res.json({ course, enrollment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Student enroll in course
router.post('/:courseId/enroll', authenticate, requireRole(['student']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const course = await Course.findById(req.params.courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    const existing = await Enrollment.findOne({ courseId: course._id, studentId: req.user!.userId });
    if (existing) {
       res.status(400).json({ message: 'Already enrolled' });
       return;
    }

    const enrollment = new Enrollment({
      studentId: req.user!.userId,
      courseId: course._id,
      status: 'enrolled',
      progress: 0,
      completedLessons: []
    });
    
    await enrollment.save();
    
    // Award XP for enrollment
    await awardXP(req.user!.userId, XP_VALUES.ENROLL);
    
    res.status(201).json({ message: 'Enrolled successfully', enrollment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mark lesson as complete
router.post('/:courseId/lessons/:lessonId/complete', authenticate, requireRole(['student']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId, lessonId } = req.params;
    const enrollment = await Enrollment.findOne({ courseId, studentId: req.user!.userId });
    
    if (!enrollment) {
      res.status(404).json({ message: 'Enrollment not found' });
      return;
    }

    const course = await Course.findById(courseId);
    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    if (!enrollment.completedLessons.includes(lessonId as any)) {
      enrollment.completedLessons.push(lessonId as any);
      enrollment.status = 'in_progress';
      
      // Calculate progress
      let totalLessons = 0;
      course.modules.forEach(m => {
        totalLessons += m.lessons.length;
      });
      
      if (totalLessons > 0) {
        enrollment.progress = Math.round((enrollment.completedLessons.length / totalLessons) * 100);
      }
      
      await enrollment.save();
      
      // Award XP for lesson completion
      await awardXP(req.user!.userId, XP_VALUES.COMPLETE_LESSON);
    }
    
    res.json({ message: 'Lesson marked as complete', enrollment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Update progress/submit quiz
router.post('/:courseId/progress', authenticate, requireRole(['student']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { score } = req.body;
    const enrollment = await Enrollment.findOne({ courseId: req.params.courseId, studentId: req.user!.userId });
    
    if (!enrollment) {
      res.status(404).json({ message: 'Enrollment not found' });
      return;
    }

    enrollment.status = 'completed';
    enrollment.progress = 100;
    enrollment.score = score;
    enrollment.completedAt = new Date();
    
    await enrollment.save();
    
    // Award XP for course completion
    let totalXP = XP_VALUES.COMPLETE_COURSE;
    if (score === 100) totalXP += XP_VALUES.PERFECT_SCORE;
    await awardXP(req.user!.userId, totalXP);
    
    res.json({ message: 'Course completed successfully', enrollment });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// Mock certificate generation
router.post('/:courseId/certificate', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseId } = req.params;
    const userId = req.user!.userId;
    const course = await Course.findById(courseId);

    if (!course) {
      res.status(404).json({ message: 'Course not found' });
      return;
    }

    res.json({
      message: 'Certificate generated successfully',
      certificateUrl: `https://mock-certs.com/${userId}-${courseId}.pdf`,
      courseTitle: course.title
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
