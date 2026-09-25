import { ObjectId } from 'mongodb';

export interface ClassroomActivityQuestion {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface ClassroomActivitySubmission {
  studentId: string;
  studentName: string;
  studentEmail: string;
  grade?: string;
  section?: string;
  carnet?: string;
  avatarUrl?: string;
  score: number; // 0 to 100
  wpm: number;
  timeSpentSeconds: number;
  correctAnswersCount: number;
  totalQuestions: number;
  submittedAt: Date;
  micUsed: boolean;
  infractionsCount?: number;
}

export interface ClassroomActivityDocument {
  _id?: ObjectId;
  id?: string;
  title: string;
  description?: string;
  readingId?: string;
  readingTitle: string;
  content: string;
  wordCount: number;
  timeLimitMinutes: number; // Ej: 3, 5, 8 minutos
  allowMic: boolean; // Si el profesor activa el micrófono o solo lectura
  questions: ClassroomActivityQuestion[];
  teacherId: string;
  teacherName: string;
  gradeLevel?: string; // 'all' o '1ro Básico', etc.
  career?: string; // 'all' o 'Informática', 'Dibujo', etc.
  section?: string; // 'all' o 'A', 'B', etc.
  status: 'ACTIVE' | 'FINISHED' | 'DRAFT';
  submissions: ClassroomActivitySubmission[];
  createdAt: Date;
  updatedAt: Date;
}
