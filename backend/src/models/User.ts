import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  role: 'student' | 'instructor' | 'admin';
  xp: number;
  level: number;
  badges: string[];
  streak: number;
  lastActiveDate?: Date;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['student', 'instructor', 'admin'], default: 'student' },
    xp: { type: Number, default: 0 },
    level: { type: Number, default: 1 },
    badges: [{ type: String }],
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date },
  },
  { timestamps: true }
);

export default mongoose.model<IUser>('User', UserSchema);
