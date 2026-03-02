import mongoose, { Schema, Document } from "mongoose";

export interface ILesson {
  title: string;
  contentType: "video" | "text" | "assignment" | "lab";
  contentUrl?: string; // e.g Video URL, external links
  textContent?: string;
  durationMinutes: number;
}

export interface IQuiz {
  question: string;
  options: string[];
  correctAnswer?: number;
  correctAnswers?: number[];
  type?: "single" | "multiple";
  isFinalAssessment?: boolean;
}

export interface IModule {
  title: string;
  lessons: ILesson[];
  quiz?: IQuiz[];
}

export interface ICourse extends Document {
  title: string;
  description: string;
  sectors: string[]; // Course can belong to multiple sectors
  instructorId: mongoose.Types.ObjectId;
  modules: IModule[];
  status: "draft" | "published";
  createdAt: Date;
  updatedAt: Date;
}

const LessonSchema = new Schema({
  title: { type: String, required: true },
  contentType: {
    type: String,
    enum: ["video", "text", "assignment", "lab"],
    default: "text",
  },
  contentUrl: { type: String },
  textContent: { type: String },
  durationMinutes: { type: Number, default: 0 },
});

const QuizSchema = new Schema({
  question: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctAnswer: { type: Number },
  correctAnswers: [{ type: Number }],
  type: { type: String, enum: ["single", "multiple"], default: "single" },
  isFinalAssessment: { type: Boolean, default: false },
});

const ModuleSchema = new Schema({
  title: { type: String, required: true },
  lessons: [LessonSchema],
  quiz: [QuizSchema],
});

const CourseSchema: Schema = new Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    sectors: [{ type: String, required: true }],
    instructorId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    modules: [ModuleSchema],
    status: { type: String, enum: ["draft", "published"], default: "draft" },
  },
  { timestamps: true },
);

export default mongoose.model<ICourse>("Course", CourseSchema);
