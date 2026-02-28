import mongoose, { Schema, Document } from 'mongoose';

export interface IEnrollment extends Document {
  studentId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  status: 'enrolled' | 'in_progress' | 'completed';
  progress: number;
  completedLessons: mongoose.Types.ObjectId[];
  score?: number;
  completedAt?: Date;
}

const EnrollmentSchema: Schema = new Schema(
  {
    studentId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    courseId: { type: Schema.Types.ObjectId, ref: 'Course', required: true },
    status: { type: String, enum: ['enrolled', 'in_progress', 'completed'], default: 'enrolled' },
    progress: { type: Number, default: 0 },
    completedLessons: [{ type: Schema.Types.ObjectId }],
    score: { type: Number },
    completedAt: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IEnrollment>('Enrollment', EnrollmentSchema);
