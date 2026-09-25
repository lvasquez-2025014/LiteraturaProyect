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
  submittedAt: string | Date;
  micUsed: boolean;
  infractionsCount?: number;
}

export interface ClassroomActivity {
  id: string;
  _id?: string;
  title: string;
  description?: string;
  readingId?: string;
  readingTitle: string;
  content: string;
  wordCount: number;
  timeLimitMinutes: number; // Ej: 3, 5, 10
  allowMic: boolean; // Si el profesor activa el micrófono o solo lectura
  questions: ClassroomActivityQuestion[];
  teacherId: string;
  teacherName: string;
  gradeLevel?: string;
  career?: string;
  section?: string;
  status: 'ACTIVE' | 'FINISHED' | 'DRAFT';
  submissions: ClassroomActivitySubmission[];
  createdAt: string | Date;
  updatedAt: string | Date;
}
