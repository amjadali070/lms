import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import courseRoutes from './routes/course.routes';
import userRoutes from './routes/user.routes';
import aiRoutes from './routes/ai.routes';
import gamificationRoutes from './routes/gamification.routes';
import dashboardRoutes from './routes/dashboard.routes';
import { connectDB } from './config/db';


const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/users', userRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/gamification', gamificationRoutes);
app.use('/api/dashboard', dashboardRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Simple LMS API is running' });
});

app.listen(PORT, async () => {
  await connectDB();
  console.log(`Server running on port ${PORT}`);
});
