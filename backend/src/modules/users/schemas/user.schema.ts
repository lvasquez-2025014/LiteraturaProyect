import { ObjectId } from 'mongodb';

export type UserRole = 'STUDENT_ROLE' | 'TEACHER_ROLE' | 'ADMIN_ROLE';

export interface UserStats {
  totalXp: number;
  currentLevel: number;
  averageWpm: number;
  comprehensionRate: number;
  streakDays: number;
  completedReadings: number;
  lastReadingDate?: Date;
}

export interface UserDocument {
  _id?: ObjectId;
  googleId?: string;
  email: string;
  password?: string;
  name: string;
  avatarUrl?: string;
  role: UserRole;
  grade?: string;      // ej. "5to Perito", "4to Bachillerato"
  section?: string;    // ej. "A", "B"
  stats: UserStats;
  createdAt: Date;
  updatedAt: Date;
}
