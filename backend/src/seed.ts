import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import User from './models/User';
import Course from './models/Course';
import Enrollment from './models/Enrollment';

const MONGO_URI = process.env.MONGO_URI || '';

// ──────────────────── HELPERS ─────────────────────
const hashPw = async (pw: string) => bcrypt.hash(pw, 10);

const randomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const pick = <T>(arr: T[]): T => arr[Math.floor(Math.random() * arr.length)];
const daysAgo = (n: number) => new Date(Date.now() - n * 86400000);

// ──────────────── COURSE DATA (2 per sector) ────────────────
const COURSES = [
  // Government
  { title: 'Government Ethics & Accountability', description: 'Comprehensive training on ethical standards, transparency, and accountability mechanisms in government operations.', sectors: ['Government'], modules: [
    { title: 'Foundations of Government Ethics', lessons: [
      { title: 'Code of Conduct Overview', contentType: 'text', textContent: 'Government employees must adhere to strict ethical guidelines including conflict of interest rules, gift restrictions, and impartiality requirements. This lesson covers the foundational principles that guide ethical decision-making in public service.', durationMinutes: 20 },
      { title: 'Transparency & Disclosure', contentType: 'text', textContent: 'Public officials are required to disclose financial interests and ensure transparency in decision-making processes. Learn about FOIA requirements and open government initiatives.', durationMinutes: 25 },
      { title: 'Anti-Corruption Measures', contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', durationMinutes: 30 },
    ], quiz: [
      { question: 'What is the primary purpose of ethics training in government?', options: ['To increase revenue', 'To ensure accountability and public trust', 'To reduce workforce', 'To improve marketing'], correctAnswer: 1, type: 'single' },
      { question: 'Which law mandates government transparency?', options: ['HIPAA', 'FOIA', 'SOX', 'FERPA'], correctAnswer: 1, type: 'single' },
    ]},
    { title: 'Whistleblower Protection', lessons: [
      { title: 'Whistleblower Rights', contentType: 'text', textContent: 'Federal and state laws protect government employees who report fraud, waste, and abuse. Understand your rights under the Whistleblower Protection Act.', durationMinutes: 20 },
      { title: 'Reporting Mechanisms', contentType: 'text', textContent: 'Learn about the Inspector General system, hotlines, and proper channels for reporting unethical behavior in government agencies.', durationMinutes: 15 },
    ], quiz: [
      { question: 'What protects government whistleblowers?', options: ['First Amendment only', 'Whistleblower Protection Act', 'No protections exist', 'Executive orders only'], correctAnswer: 1, type: 'single' },
    ]},
  ]},
  { title: 'Public Policy Analysis Fundamentals', description: 'Learn the frameworks and methodologies for analyzing, developing, and evaluating public policy initiatives.', sectors: ['Government'], modules: [
    { title: 'Policy Analysis Frameworks', lessons: [
      { title: 'Cost-Benefit Analysis in Policy', contentType: 'text', textContent: 'Cost-benefit analysis (CBA) is a systematic approach to estimating the strengths and weaknesses of policy alternatives. Learn how to quantify social costs and benefits.', durationMinutes: 30 },
      { title: 'Stakeholder Analysis', contentType: 'text', textContent: 'Identifying and analyzing stakeholders is critical for successful policy implementation. This lesson covers stakeholder mapping, power-interest matrices, and engagement strategies.', durationMinutes: 25 },
      { title: 'Evidence-Based Policymaking', contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', durationMinutes: 35 },
    ], quiz: [
      { question: 'What is the purpose of stakeholder analysis?', options: ['To reduce costs', 'To identify affected parties and their interests', 'To eliminate opposition', 'To speed up implementation'], correctAnswer: 1, type: 'single' },
    ]},
  ]},
  // Education
  { title: 'Digital Literacy for Educators', description: 'Equip educators with essential digital skills to integrate technology effectively in classrooms and online learning environments.', sectors: ['Education'], modules: [
    { title: 'Digital Tools for Teaching', lessons: [
      { title: 'LMS Platforms Overview', contentType: 'text', textContent: 'Modern Learning Management Systems like Canvas, Moodle, and Blackboard offer powerful features for course management, assessment, and student engagement. This lesson explores key features and best practices.', durationMinutes: 25 },
      { title: 'Interactive Content Creation', contentType: 'text', textContent: 'Create engaging educational content using tools like H5P interactive videos, Kahoot quizzes, and Padlet collaborative boards.', durationMinutes: 30 },
      { title: 'Video Production for Education', contentType: 'video', contentUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', durationMinutes: 20 },
    ], quiz: [
      { question: 'Which tool is commonly used for interactive quizzes?', options: ['Excel', 'Kahoot', 'Photoshop', 'AutoCAD'], correctAnswer: 1, type: 'single' },
    ]},
    { title: 'Online Assessment Strategies', lessons: [
      { title: 'Formative vs Summative Assessment', contentType: 'text', textContent: 'Understanding the difference between formative assessments (ongoing feedback) and summative assessments (final evaluation) is key to effective online teaching.', durationMinutes: 20 },
      { title: 'Academic Integrity Online', contentType: 'text', textContent: 'Maintaining academic integrity in online environments requires proctoring tools, plagiarism detection, and proper assessment design.', durationMinutes: 25 },
    ], quiz: [
      { question: 'What is a formative assessment?', options: ['Final exam', 'Ongoing feedback during learning', 'Entrance test', 'Graduation requirement'], correctAnswer: 1, type: 'single' },
    ]},
  ]},
  { title: 'Curriculum Design & Development', description: 'Master the principles of curriculum design including backwards design, learning objectives alignment, and competency-based frameworks.', sectors: ['Education'], modules: [
    { title: 'Backwards Design Methodology', lessons: [
      { title: 'Understanding by Design (UbD)', contentType: 'text', textContent: 'Backwards design starts with defining desired learning outcomes, then determining assessment evidence, and finally planning learning experiences. This approach ensures alignment between goals and activities.', durationMinutes: 30 },
      { title: 'Writing Effective Learning Objectives', contentType: 'text', textContent: 'Use Bloom\'s Taxonomy to create measurable learning objectives that cover cognitive domains from knowledge recall to analysis and creation.', durationMinutes: 25 },
    ], quiz: [
      { question: 'What framework does Backwards Design follow?', options: ['Start with activities', 'Start with desired outcomes', 'Start with textbook selection', 'Start with scheduling'], correctAnswer: 1, type: 'single' },
    ]},
  ]},
  // Healthcare
  { title: 'Patient Safety & Quality Improvement', description: 'Training on patient safety protocols, error reporting, quality improvement methodologies, and evidence-based healthcare practices.', sectors: ['Healthcare'], modules: [
    { title: 'Patient Safety Fundamentals', lessons: [
      { title: 'Root Cause Analysis', contentType: 'text', textContent: 'Root Cause Analysis (RCA) is a systematic process for identifying the underlying causes of adverse events in healthcare. Learn the 5 Whys technique and fishbone diagrams.', durationMinutes: 30 },
      { title: 'Medication Safety', contentType: 'text', textContent: 'Medication errors are among the most common healthcare errors. Learn about the five rights of medication administration and barcode medication administration (BCMA) systems.', durationMinutes: 25 },
      { title: 'Fall Prevention Protocols', contentType: 'text', textContent: 'Patient falls are a leading cause of hospital-acquired injuries. This lesson covers the Morse Fall Scale, environmental modifications, and interdisciplinary fall prevention programs.', durationMinutes: 20 },
    ], quiz: [
      { question: 'What are the five rights of medication administration?', options: ['Right patient, drug, dose, route, time', 'Right doctor, nurse, pharmacy, dose, route', 'Right hospital, floor, room, bed, patient', 'Right insurance, authorization, co-pay, drug, dose'], correctAnswer: 0, type: 'single' },
    ]},
  ]},
  { title: 'Electronic Health Records (EHR) Mastery', description: 'Comprehensive training on EHR systems, clinical documentation, interoperability standards, and meaningful use requirements.', sectors: ['Healthcare'], modules: [
    { title: 'EHR Systems & Navigation', lessons: [
      { title: 'EHR Interface Fundamentals', contentType: 'text', textContent: 'Navigate EHR systems efficiently by understanding the clinical dashboard, patient charts, order entry, and documentation workflows. This lesson covers Epic, Cerner, and other major EHR platforms.', durationMinutes: 35 },
      { title: 'Clinical Documentation Best Practices', contentType: 'text', textContent: 'Proper clinical documentation ensures continuity of care, legal compliance, and accurate billing. Learn about SOAP notes, problem lists, and medication reconciliation.', durationMinutes: 30 },
    ], quiz: [
      { question: 'What does SOAP stand for in clinical notes?', options: ['Subject, Object, Analysis, Plan', 'Subjective, Objective, Assessment, Plan', 'Summary, Observation, Action, Protocol', 'Symptoms, Orders, Assessment, Prescription'], correctAnswer: 1, type: 'single' },
    ]},
  ]},
  // Transportation
  { title: 'Fleet Safety Management', description: 'Essential training for fleet managers covering vehicle safety, driver compliance, maintenance protocols, and DOT regulations.', sectors: ['Transportation'], modules: [
    { title: 'DOT Compliance & Regulations', lessons: [
      { title: 'Hours of Service Rules', contentType: 'text', textContent: 'The Federal Motor Carrier Safety Administration (FMCSA) regulates hours of service for commercial vehicle drivers. Learn about the 11-hour driving limit, 14-hour window, and mandatory rest periods.', durationMinutes: 30 },
      { title: 'Vehicle Inspection Protocols', contentType: 'text', textContent: 'Pre-trip and post-trip inspections are mandatory under DOT regulations. This lesson covers the key inspection points including brakes, tires, lights, and coupling devices.', durationMinutes: 25 },
      { title: 'Electronic Logging Devices (ELD)', contentType: 'text', textContent: 'ELDs are mandatory for tracking HOS compliance. Learn about ELD requirements, data transfer methods, and common compliance issues.', durationMinutes: 20 },
    ], quiz: [
      { question: 'What is the maximum continuous driving time under FMCSA rules?', options: ['8 hours', '10 hours', '11 hours', '14 hours'], correctAnswer: 2, type: 'single' },
    ]},
  ]},
  { title: 'Sustainable Transportation Planning', description: 'Explore green transportation strategies, electric vehicle integration, and sustainable urban mobility planning.', sectors: ['Transportation'], modules: [
    { title: 'Green Transportation Strategies', lessons: [
      { title: 'Electric Vehicle Fleet Transition', contentType: 'text', textContent: 'Transitioning to electric vehicles requires strategic planning around charging infrastructure, total cost of ownership, and fleet utilization patterns.', durationMinutes: 25 },
      { title: 'Multi-Modal Transportation', contentType: 'text', textContent: 'Integrating transit, cycling, walking, and shared mobility services creates a more sustainable and equitable transportation system.', durationMinutes: 20 },
    ], quiz: [
      { question: 'What is a key consideration for EV fleet transition?', options: ['Paint color', 'Charging infrastructure', 'Radio systems', 'Window tinting'], correctAnswer: 1, type: 'single' },
    ]},
  ]},
  // Public Administration
  { title: 'Public Budgeting & Financial Management', description: 'Master government budgeting processes, fiscal policy, revenue forecasting, and financial reporting standards for public sector organizations.', sectors: ['Public Administration'], modules: [
    { title: 'Government Budget Process', lessons: [
      { title: 'Budget Cycle Overview', contentType: 'text', textContent: 'The government budget cycle includes preparation, legislative approval, execution, and audit phases. Each phase has specific requirements and stakeholder responsibilities.', durationMinutes: 30 },
      { title: 'Revenue Forecasting', contentType: 'text', textContent: 'Accurate revenue forecasting is critical for balanced budgets. Learn about trend analysis, econometric models, and judgmental forecasting techniques.', durationMinutes: 25 },
      { title: 'Capital Budget Planning', contentType: 'text', textContent: 'Capital budgets fund long-term infrastructure investments. Understand debt financing, bond issuance, and capital improvement plans.', durationMinutes: 30 },
    ], quiz: [
      { question: 'What are the four phases of the budget cycle?', options: ['Plan, Build, Test, Deploy', 'Preparation, Approval, Execution, Audit', 'Draft, Review, Publish, Archive', 'Request, Approve, Spend, Report'], correctAnswer: 1, type: 'single' },
    ]},
  ]},
  { title: 'Emergency Management & Preparedness', description: 'Training on disaster preparedness, incident command systems, continuity of operations, and community resilience building.', sectors: ['Public Administration'], modules: [
    { title: 'Incident Command System (ICS)', lessons: [
      { title: 'ICS Structure & Principles', contentType: 'text', textContent: 'The Incident Command System provides a standardized approach to command, control, and coordination of emergency response. Learn the five functional areas: Command, Operations, Planning, Logistics, and Finance.', durationMinutes: 30 },
      { title: 'Emergency Operations Center', contentType: 'text', textContent: 'The EOC serves as the central coordination point during emergencies. Understand EOC activation levels, staffing, and communication protocols.', durationMinutes: 25 },
    ], quiz: [
      { question: 'How many functional areas does ICS have?', options: ['3', '4', '5', '6'], correctAnswer: 2, type: 'single' },
    ]},
  ]},
  // Finance
  { title: 'Financial Risk Management', description: 'Learn to identify, assess, and mitigate financial risks using modern frameworks, quantitative models, and regulatory compliance strategies.', sectors: ['Finance'], modules: [
    { title: 'Risk Assessment Frameworks', lessons: [
      { title: 'Types of Financial Risk', contentType: 'text', textContent: 'Financial institutions face market risk, credit risk, operational risk, and liquidity risk. Understanding each type and their interdependencies is crucial for effective risk management.', durationMinutes: 30 },
      { title: 'Value at Risk (VaR)', contentType: 'text', textContent: 'VaR is a statistical measure that quantifies the potential loss in value of a portfolio over a defined period for a given confidence interval. Learn calculation methods and limitations.', durationMinutes: 35 },
      { title: 'Basel III Requirements', contentType: 'text', textContent: 'Basel III regulations set minimum capital requirements, leverage ratios, and liquidity standards for banks. Understand the impact on risk management practices.', durationMinutes: 25 },
    ], quiz: [
      { question: 'What does VaR measure?', options: ['Revenue growth', 'Potential portfolio loss', 'Interest rates', 'Market share'], correctAnswer: 1, type: 'single' },
    ]},
  ]},
  { title: 'Anti-Money Laundering (AML) Compliance', description: 'Essential AML training covering suspicious activity reporting, customer due diligence, and global regulatory requirements.', sectors: ['Finance'], modules: [
    { title: 'AML Fundamentals', lessons: [
      { title: 'Know Your Customer (KYC)', contentType: 'text', textContent: 'KYC procedures are foundational to AML compliance. Learn about customer identification, verification, enhanced due diligence, and ongoing monitoring requirements.', durationMinutes: 25 },
      { title: 'Suspicious Activity Reporting', contentType: 'text', textContent: 'Financial institutions must file Suspicious Activity Reports (SARs) when they detect potentially illegal transactions. Understand red flags, filing requirements, and timelines.', durationMinutes: 30 },
    ], quiz: [
      { question: 'What is the purpose of KYC?', options: ['Marketing research', 'Customer identity verification for AML', 'Credit scoring', 'Customer satisfaction'], correctAnswer: 1, type: 'single' },
    ]},
  ]},
  // Technology
  { title: 'Cybersecurity Essentials', description: 'Foundational cybersecurity training covering threat landscape, network security, incident response, and security best practices.', sectors: ['Technology'], modules: [
    { title: 'Cyber Threat Landscape', lessons: [
      { title: 'Types of Cyber Attacks', contentType: 'text', textContent: 'Modern cyber threats include phishing, ransomware, DDoS attacks, SQL injection, and zero-day exploits. Understanding attack vectors helps in building effective defenses.', durationMinutes: 30 },
      { title: 'Network Security Fundamentals', contentType: 'text', textContent: 'Network security involves firewalls, intrusion detection systems, VPNs, and network segmentation. Learn how these technologies work together to protect organizational assets.', durationMinutes: 35 },
      { title: 'Incident Response Planning', contentType: 'text', textContent: 'An incident response plan outlines the procedures for detecting, containing, eradicating, and recovering from security incidents. Learn the NIST incident response framework.', durationMinutes: 25 },
    ], quiz: [
      { question: 'What is phishing?', options: ['A type of fishing', 'A social engineering attack using fraudulent emails', 'A network scanning tool', 'A programming language'], correctAnswer: 1, type: 'single' },
    ]},
  ]},
  { title: 'Cloud Computing & DevOps', description: 'Hands-on training on cloud platforms (AWS, Azure), containerization, CI/CD pipelines, and infrastructure as code.', sectors: ['Technology'], modules: [
    { title: 'Cloud Platforms Overview', lessons: [
      { title: 'AWS Core Services', contentType: 'text', textContent: 'Amazon Web Services offers 200+ services. Focus on core services: EC2 (compute), S3 (storage), RDS (databases), Lambda (serverless), and VPC (networking).', durationMinutes: 35 },
      { title: 'Containerization with Docker', contentType: 'text', textContent: 'Docker containers package applications with their dependencies, ensuring consistent deployment across environments. Learn about Dockerfiles, images, containers, and Docker Compose.', durationMinutes: 30 },
      { title: 'CI/CD Pipeline Design', contentType: 'text', textContent: 'Continuous Integration and Continuous Deployment pipelines automate the build, test, and deployment process. Learn about GitHub Actions, Jenkins, and GitLab CI.', durationMinutes: 25 },
    ], quiz: [
      { question: 'What is the purpose of Docker containers?', options: ['To ship physical goods', 'To package applications with dependencies', 'To design websites', 'To manage databases only'], correctAnswer: 1, type: 'single' },
    ]},
  ]},
];

// ──────────────── STUDENT DATA ────────────────
const STUDENTS = [
  { name: 'Sarah Mitchell', email: 'sarah.mitchell@edu.com' },
  { name: 'James Rodriguez', email: 'james.rodriguez@edu.com' },
  { name: 'Emily Chen', email: 'emily.chen@edu.com' },
  { name: 'Michael Johnson', email: 'michael.johnson@edu.com' },
  { name: 'Fatima Al-Hassan', email: 'fatima.alhassan@edu.com' },
  { name: 'David Kim', email: 'david.kim@edu.com' },
  { name: 'Olivia Brown', email: 'olivia.brown@edu.com' },
  { name: 'Ahmed Patel', email: 'ahmed.patel@edu.com' },
  { name: 'Jessica Taylor', email: 'jessica.taylor@edu.com' },
  { name: 'Robert Williams', email: 'robert.williams@edu.com' },
  { name: 'Maria Garcia', email: 'maria.garcia@edu.com' },
  { name: 'Daniel Lee', email: 'daniel.lee@edu.com' },
];

// ──────────────── SEED FUNCTION ────────────────
async function seed() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ Connected to MongoDB');

    // Delete seeded students (but keep original 3)
    await User.deleteMany({ email: { $nin: ['admin@edu.com', 'teacher@edu.com', 'john@edu.com'] }, role: 'student' });
    
    // Delete all courses and enrollments to start fresh
    await Course.deleteMany({});
    await Enrollment.deleteMany({});
    console.log('🗑️  Cleared old data (kept original accounts)');

    // Get or create instructor
    let instructor = await User.findOne({ email: 'teacher@edu.com' });
    if (!instructor) {
      instructor = await User.create({
        name: 'Teacher Smith',
        email: 'teacher@edu.com',
        passwordHash: await hashPw('password123'),
        role: 'instructor',
      });
    }

    // Create students
    const pw = await hashPw('password123');
    const studentDocs = [];
    for (const s of STUDENTS) {
      const existing = await User.findOne({ email: s.email });
      if (existing) {
        studentDocs.push(existing);
      } else {
        const newStudent = await User.create({
          name: s.name,
          email: s.email,
          passwordHash: pw,
          role: 'student',
          xp: 0,
          level: 1,
          badges: [],
          streak: 0,
        });
        studentDocs.push(newStudent);
      }
    }
    // Also include the original student (John Doe)
    const originalStudent = await User.findOne({ email: 'john@edu.com' });
    if (originalStudent) studentDocs.push(originalStudent);

    console.log(`👤 Created/found ${studentDocs.length} students`);

    // Create courses
    const courseDocs = [];
    for (const c of COURSES) {
      const course = await Course.create({
        ...c,
        instructorId: instructor._id,
        status: 'published',
      });
      courseDocs.push(course);
    }
    console.log(`📚 Created ${courseDocs.length} courses`);

    // Create enrollments with varied progress
    let enrollmentCount = 0;

    for (const student of studentDocs) {
      // Each student enrolls in 3-6 random courses
      const numCourses = randomInt(3, 6);
      const shuffled = [...courseDocs].sort(() => Math.random() - 0.5);
      const selectedCourses = shuffled.slice(0, numCourses);

      for (const course of selectedCourses) {
        // Determine random status
        const statusRoll = Math.random();
        let status: 'enrolled' | 'in_progress' | 'completed';
        let progress = 0;
        let score: number | undefined;
        let completedAt: Date | undefined;
        const completedLessons: mongoose.Types.ObjectId[] = [];

        // Gather all lesson IDs from the course
        const allLessonIds: mongoose.Types.ObjectId[] = [];
        course.modules.forEach((m: any) => {
          m.lessons.forEach((l: any) => {
            allLessonIds.push(l._id);
          });
        });

        if (statusRoll < 0.35) {
          // Completed (35% chance)
          status = 'completed';
          progress = 100;
          score = pick([70, 75, 80, 85, 90, 95, 100, 100, 85, 90]);
          completedAt = daysAgo(randomInt(1, 30));
          completedLessons.push(...allLessonIds);
        } else if (statusRoll < 0.7) {
          // In progress (35% chance)
          status = 'in_progress';
          const numCompleted = randomInt(1, Math.max(1, allLessonIds.length - 1));
          const shuffledLessons = [...allLessonIds].sort(() => Math.random() - 0.5);
          completedLessons.push(...shuffledLessons.slice(0, numCompleted));
          progress = allLessonIds.length > 0 ? Math.round((numCompleted / allLessonIds.length) * 100) : 0;
        } else {
          // Just enrolled (30% chance)
          status = 'enrolled';
          progress = 0;
        }

        await Enrollment.create({
          studentId: student._id,
          courseId: course._id,
          status,
          progress,
          completedLessons,
          score,
          completedAt,
        });
        enrollmentCount++;
      }

      // Update student XP based on their enrollments
      const studentEnrollments = await Enrollment.find({ studentId: student._id });
      let xp = 0;
      const badges: string[] = [];

      for (const e of studentEnrollments) {
        xp += 25; // enrollment XP
        if (e.status === 'in_progress') {
          xp += e.completedLessons.length * 50;
        }
        if (e.status === 'completed') {
          xp += 200; // course completion
          xp += e.completedLessons.length * 50;
          if (e.score === 100) xp += 100; // perfect score bonus
        }
      }

      // Calculate level
      let level = 1;
      if (xp >= 4500) level = 10;
      else if (xp >= 3600) level = 9;
      else if (xp >= 2800) level = 8;
      else if (xp >= 2100) level = 7;
      else if (xp >= 1500) level = 6;
      else if (xp >= 1000) level = 5;
      else if (xp >= 600) level = 4;
      else if (xp >= 300) level = 3;
      else if (xp >= 100) level = 2;

      // Award badges
      const completedCourses = studentEnrollments.filter(e => e.status === 'completed').length;
      const completedLessonsTotal = studentEnrollments.reduce((sum, e) => sum + e.completedLessons.length, 0);
      const hasPerfect = studentEnrollments.some(e => e.score === 100);

      if (studentEnrollments.length >= 1) badges.push('first_enrollment');
      if (completedCourses >= 1) badges.push('course_completer');
      if (completedCourses >= 3) badges.push('triple_threat');
      if (hasPerfect) badges.push('perfect_score');
      if (completedLessonsTotal >= 5) badges.push('five_lessons');
      if (xp >= 500) badges.push('xp_500');
      if (xp >= 1000) badges.push('xp_1000');
      if (xp >= 2500) badges.push('xp_2500');

      const streak = randomInt(0, 12);
      if (streak >= 3) badges.push('streak_3');
      if (streak >= 7) badges.push('streak_7');

      await User.findByIdAndUpdate(student._id, {
        xp,
        level,
        badges,
        streak,
        lastActiveDate: daysAgo(randomInt(0, 3)),
      });
    }

    console.log(`📝 Created ${enrollmentCount} enrollments`);
    console.log('');
    console.log('✨ Seed complete! Summary:');
    console.log(`   • ${courseDocs.length} courses (2 per sector)`);
    console.log(`   • ${studentDocs.length} students`);
    console.log(`   • ${enrollmentCount} enrollments with varied progress`);
    console.log(`   • XP, levels, and badges updated for all students`);
    console.log('');
    console.log('🔑 Login credentials (all passwords: password123):');
    console.log('   Admin: admin@edu.com');
    console.log('   Teacher: teacher@edu.com');
    console.log('   Student: john@edu.com (or any seeded student)');

    process.exit(0);
  } catch (err) {
    console.error('❌ Seed failed:', err);
    process.exit(1);
  }
}

seed();
