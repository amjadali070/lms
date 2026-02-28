import express, { Response } from 'express';
import OpenAI from 'openai';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import User from '../models/User';
import { authenticate, AuthRequest, requireRole } from '../middlewares/auth.middleware';

const router = express.Router();

// AI Course Generator — takes a topic + sector and generates a full course structure
router.post('/generate-course', authenticate, requireRole(['admin', 'instructor']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topic, description, sector, moduleCount } = req.body;

    if (!topic) {
      res.status(400).json({ message: 'Topic is required' });
      return;
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `You are an expert instructional designer for a Learning Management System used by ${sector || 'government/public sector'} organizations.

Generate a complete course structure for the topic: "${topic}"
${description ? `\nAdditional requirements and details from the course creator:\n"${description}"\n\nMake sure to incorporate these specific details, content requirements, and learning objectives into the generated course structure.\n` : ''}

Requirements:
- Create ${moduleCount || 3} modules
- Each module should have 2-3 lessons with varied content types (video, text)
- Each module should have 2-3 quiz questions (mix of single and multiple choice)
- Video lessons should have realistic YouTube URLs (use placeholder: https://www.youtube.com/watch?v=dQw4w9WgXcQ)
- Text lessons should have rich, educational text content (2-3 paragraphs)
- Quiz questions should be challenging and relevant

Return ONLY valid JSON (no markdown, no code fences) in this exact format:
{
  "title": "Course Title",
  "description": "2-3 sentence course description",
  "sectors": ["${sector || 'Government'}"],
  "modules": [
    {
      "title": "Module Title",
      "lessons": [
        {
          "title": "Lesson Title",
          "contentType": "text",
          "textContent": "Full lesson text content here...",
          "durationMinutes": 15
        },
        {
          "title": "Video Lesson Title",
          "contentType": "video",
          "contentUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
          "durationMinutes": 10
        }
      ],
      "quiz": [
        {
          "question": "Question text?",
          "options": ["Option A", "Option B", "Option C", "Option D"],
          "correctAnswer": 0,
          "type": "single"
        },
        {
          "question": "Select all that apply?",
          "options": ["Option A", "Option B", "Option C"],
          "correctAnswers": [0, 2],
          "type": "multiple"
        }
      ]
    }
  ]
}`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 4000,
    });

    const raw = completion.choices[0].message.content || '';
    
    // Strip any markdown fences if present
    const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const courseData = JSON.parse(jsonStr);

    res.json(courseData);
  } catch (err: any) {
    console.error('AI Generation Error:', err);
    res.status(500).json({ error: err.message || 'AI generation failed' });
  }
});

// AI Study Assistant — answers student questions about course content
router.post('/ask', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { question, courseContext } = req.body;

    if (!question) {
      res.status(400).json({ message: 'Question is required' });
      return;
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const systemPrompt = `You are an intelligent, patient, and encouraging AI Study Assistant embedded in a Learning Management System. Your role is to help students understand course material better.

${courseContext ? `The student is currently learning about the following course content:\n${courseContext}\n\nAnswer questions specifically related to this content. If the question is outside the course scope, still try to help but note that it's supplementary material.` : 'Help the student with their learning queries.'}

Guidelines:
- Give clear, concise explanations  
- Use examples and analogies when helpful
- Break down complex topics into simple steps
- Encourage the student and be supportive
- If explaining a process, use numbered steps
- Keep responses focused and under 300 words unless more detail is needed`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: question }
      ],
      temperature: 0.7,
      max_tokens: 1000,
    });

    const answer = completion.choices[0].message.content || 'I was unable to generate a response. Please try again.';

    res.json({ answer });
  } catch (err: any) {
    console.error('AI Ask Error:', err);
    res.status(500).json({ error: err.message || 'AI query failed' });
  }
});

// AI Quiz Generator — generates quiz questions for a specific topic
router.post('/generate-quiz', authenticate, requireRole(['admin', 'instructor']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { topic, count } = req.body;

    if (!topic) {
      res.status(400).json({ message: 'Topic is required' });
      return;
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `Generate ${count || 5} quiz questions about "${topic}" for a professional training course.

Return ONLY valid JSON array (no markdown) in this format:
[
  {
    "question": "Question text?",
    "options": ["Option A", "Option B", "Option C", "Option D"],
    "correctAnswer": 0,
    "type": "single"
  }
]

Mix single-choice and multiple-choice questions. For multiple choice, use "correctAnswers": [0, 2] instead of "correctAnswer".`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2000,
    });

    const raw = completion.choices[0].message.content || '';
    const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const quizData = JSON.parse(jsonStr);

    res.json(quizData);
  } catch (err: any) {
    console.error('AI Quiz Generation Error:', err);
    res.status(500).json({ error: err.message || 'AI quiz generation failed' });
  }
});

// AI Study Notes Generator — generates concise study notes from course content
router.post('/study-notes', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseTitle, courseContent } = req.body;

    if (!courseTitle) {
      res.status(400).json({ message: 'Course title is required' });
      return;
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `You are an expert study coach. Generate comprehensive, well-structured study notes for the following course.

Course: "${courseTitle}"
Content overview: ${courseContent || 'General course material'}

Create study notes in this JSON format (return ONLY valid JSON, no markdown fences):
{
  "title": "Study Notes: Course Title",
  "summary": "A 2-3 sentence executive summary of the entire course",
  "sections": [
    {
      "heading": "Section heading",
      "keyPoints": ["Key point 1", "Key point 2", "Key point 3"],
      "explanation": "A detailed 2-3 sentence explanation of this section",
      "tip": "A practical study tip or mnemonic for remembering this section"
    }
  ],
  "vocabulary": [
    { "term": "Important Term", "definition": "Clear, concise definition" }
  ],
  "examTips": ["Tip 1 for exam preparation", "Tip 2"]
}

Generate 4-6 sections, 5-8 vocabulary terms, and 4-5 exam tips. Make the content educational, practical, and easy to review.`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const raw = completion.choices[0].message.content || '';
    const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const notes = JSON.parse(jsonStr);

    res.json(notes);
  } catch (err: any) {
    console.error('AI Study Notes Error:', err);
    res.status(500).json({ error: err.message || 'AI study notes generation failed' });
  }
});

// AI Flashcard Generator — generates interactive flashcards from course content
router.post('/flashcards', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { courseTitle, courseContent } = req.body;

    if (!courseTitle) {
      res.status(400).json({ message: 'Course title is required' });
      return;
    }

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `You are an expert study coach. Generate a set of flashcards for studying the following course.

Course: "${courseTitle}"
Content overview: ${courseContent || 'General course material'}

Create flashcards in this JSON format (return ONLY valid JSON, no markdown fences):
{
  "cards": [
    {
      "front": "Question or concept on the front of the card",
      "back": "Answer or explanation on the back of the card",
      "difficulty": "easy"
    }
  ]
}

Generate exactly 12 flashcards. Mix difficulties: 4 easy, 4 medium, 4 hard.
- Easy: Basic definitions and facts
- Medium: Application and understanding questions
- Hard: Analysis and critical thinking questions

Keep fronts concise (1-2 sentences). Keep backs clear but informative (2-3 sentences max).`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const raw = completion.choices[0].message.content || '';
    const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const flashcards = JSON.parse(jsonStr);

    res.json(flashcards);
  } catch (err: any) {
    console.error('AI Flashcards Error:', err);
    res.status(500).json({ error: err.message || 'AI flashcard generation failed' });
  }
});

// AI Learning Path Recommender — analyzes student progress and recommends personalized learning path
router.post('/learning-path', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.userId;

    // Get student's enrollments with course details
    const enrollments = await Enrollment.find({ studentId: userId }).populate('courseId', 'title description sectors modules');
    
    // Get all available courses
    const allCourses = await Course.find({ status: 'published' }).select('title description sectors modules');

    // Build context about student's learning history
    const completedCourses = enrollments
      .filter(e => e.status === 'completed')
      .map((e: any) => ({
        title: e.courseId?.title,
        sectors: e.courseId?.sectors,
        score: e.score,
        modules: e.courseId?.modules?.length || 0,
      }));

    const inProgressCourses = enrollments
      .filter(e => e.status === 'in_progress' || e.status === 'enrolled')
      .map((e: any) => ({
        title: e.courseId?.title,
        sectors: e.courseId?.sectors,
        progress: e.progress,
      }));

    const enrolledCourseIds = enrollments.map((e: any) => e.courseId?._id?.toString());
    const availableCourses = allCourses
      .filter(c => !enrolledCourseIds.includes(c._id.toString()))
      .map(c => ({
        id: c._id.toString(),
        title: c.title,
        description: c.description,
        sectors: (c as any).sectors || [],
        modules: (c as any).modules?.length || 0,
      }));

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `You are an expert learning advisor for a professional Learning Management System. Analyze this student's learning history and recommend a personalized learning path.

STUDENT'S COMPLETED COURSES:
${completedCourses.length > 0 ? JSON.stringify(completedCourses, null, 2) : 'None yet'}

COURSES IN PROGRESS:
${inProgressCourses.length > 0 ? JSON.stringify(inProgressCourses, null, 2) : 'None'}

AVAILABLE COURSES (not yet enrolled):
${JSON.stringify(availableCourses, null, 2)}

Generate a personalized learning path recommendation. Return ONLY valid JSON (no markdown):
{
  "overallAssessment": "A 2-3 sentence assessment of the student's current learning journey and strengths",
  "skillsAcquired": ["Skill 1", "Skill 2"],
  "skillGaps": ["Gap 1", "Gap 2"],
  "recommendedPath": [
    {
      "step": 1,
      "courseId": "actual_course_id_from_available_list",
      "courseTitle": "Course title",
      "reason": "Why this course is recommended next",
      "expectedSkills": ["Skills they'll gain"],
      "priority": "high"
    }
  ],
  "careerInsight": "A 2-3 sentence career development insight based on their learning pattern",
  "weeklyGoal": "A specific, actionable weekly learning goal recommendation"
}

Rules:
- Only recommend courses from the AVAILABLE list above (use the exact id and title)
- Order recommendations by priority (high, medium, low)
- Maximum 5 recommendations
- If no available courses, still provide assessment and career insights
- Be specific and actionable in your reasoning`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const raw = completion.choices[0].message.content || '';
    const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const pathData = JSON.parse(jsonStr);

    res.json({
      ...pathData,
      completedCourses,
      inProgressCourses,
      totalAvailable: availableCourses.length,
    });
  } catch (err: any) {
    console.error('AI Learning Path Error:', err);
    res.status(500).json({ error: err.message || 'AI learning path generation failed' });
  }
});

// AI Performance Insights — admin-level platform analytics powered by AI
router.post('/performance-insights', authenticate, requireRole(['admin', 'instructor']), async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    // Aggregate all platform data
    const totalStudents = await User.countDocuments({ role: 'student' });
    const totalInstructors = await User.countDocuments({ role: 'instructor' });
    const totalCourses = await Course.countDocuments();
    const publishedCourses = await Course.countDocuments({ status: 'published' });
    const allEnrollments = await Enrollment.find().populate('courseId', 'title sectors').populate('studentId', 'name');
    
    const totalEnrollments = allEnrollments.length;
    const completedEnrollments = allEnrollments.filter(e => e.status === 'completed');
    const inProgressEnrollments = allEnrollments.filter(e => e.status === 'in_progress');
    const justEnrolled = allEnrollments.filter(e => e.status === 'enrolled');

    // Course-level stats
    const courseStats: Record<string, any> = {};
    allEnrollments.forEach((e: any) => {
      const title = e.courseId?.title || 'Unknown';
      if (!courseStats[title]) {
        courseStats[title] = { title, enrolled: 0, inProgress: 0, completed: 0, scores: [], sectors: e.courseId?.sectors || [] };
      }
      courseStats[title].enrolled++;
      if (e.status === 'in_progress') courseStats[title].inProgress++;
      if (e.status === 'completed') {
        courseStats[title].completed++;
        if (e.score !== undefined && e.score !== null) courseStats[title].scores.push(e.score);
      }
    });

    const courseBreakdown = Object.values(courseStats).map((c: any) => ({
      title: c.title,
      sectors: c.sectors,
      totalEnrolled: c.enrolled,
      inProgress: c.inProgress,
      completed: c.completed,
      completionRate: c.enrolled > 0 ? Math.round((c.completed / c.enrolled) * 100) : 0,
      avgScore: c.scores.length > 0 ? Math.round(c.scores.reduce((a: number, b: number) => a + b, 0) / c.scores.length) : null,
      dropoffRate: c.enrolled > 0 ? Math.round(((c.enrolled - c.completed - c.inProgress) / c.enrolled) * 100) : 0,
    }));

    // Score distribution
    const allScores = completedEnrollments.filter(e => e.score !== undefined && e.score !== null).map(e => e.score!);
    const avgPlatformScore = allScores.length > 0 ? Math.round(allScores.reduce((a, b) => a + b, 0) / allScores.length) : 0;

    const platformMetrics = {
      totalStudents,
      totalInstructors,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      completedCount: completedEnrollments.length,
      inProgressCount: inProgressEnrollments.length,
      enrolledOnlyCount: justEnrolled.length,
      overallCompletionRate: totalEnrollments > 0 ? Math.round((completedEnrollments.length / totalEnrollments) * 100) : 0,
      avgPlatformScore,
    };

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

    const prompt = `You are a senior learning analytics consultant analyzing a Learning Management System for an organization. Provide executive-level insights and actionable recommendations.

PLATFORM METRICS:
${JSON.stringify(platformMetrics, null, 2)}

COURSE-LEVEL BREAKDOWN:
${JSON.stringify(courseBreakdown, null, 2)}

Generate a comprehensive performance analysis. Return ONLY valid JSON (no markdown):
{
  "executiveSummary": "A 3-4 sentence executive summary of the platform's overall health and performance",
  "healthScore": 75,
  "riskAlerts": [
    {
      "severity": "high",
      "title": "Alert title",
      "description": "What the issue is and why it matters",
      "recommendation": "Specific action to take"
    }
  ],
  "courseInsights": [
    {
      "courseTitle": "Course name",
      "status": "strong",
      "insight": "Specific insight about this course's performance",
      "action": "Recommended action"
    }
  ],
  "trends": [
    {
      "title": "Trend title",
      "description": "Description of the trend",
      "impact": "positive"
    }
  ],
  "recommendations": [
    {
      "priority": "high",
      "title": "Recommendation title",
      "description": "Detailed actionable recommendation",
      "expectedImpact": "What improvement to expect"
    }
  ],
  "engagementTips": ["Tip 1", "Tip 2", "Tip 3"]
}

Rules:
- healthScore is 0-100 (consider completion rates, engagement, score averages)
- riskAlerts: identify real problems (high dropout, low scores, inactive courses)
- courseInsights: status can be "strong", "needs_attention", or "at_risk"
- trends: impact can be "positive", "negative", or "neutral"
- recommendations: prioritize by urgency (high, medium, low), max 5
- Be data-driven, reference actual numbers from the metrics
- Be specific and actionable, avoid generic advice`;

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 3000,
    });

    const raw = completion.choices[0].message.content || '';
    const jsonStr = raw.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    const insights = JSON.parse(jsonStr);

    res.json({
      ...insights,
      platformMetrics,
      courseBreakdown,
    });
  } catch (err: any) {
    console.error('AI Performance Insights Error:', err);
    res.status(500).json({ error: err.message || 'AI performance insights failed' });
  }
});

export default router;
