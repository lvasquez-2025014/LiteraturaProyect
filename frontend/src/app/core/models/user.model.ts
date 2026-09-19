export type UserRole = 'STUDENT_ROLE' | 'TEACHER_ROLE' | 'ADMIN_ROLE';

export interface UserStats {
  totalXp: number;
  currentLevel: number;
  averageWpm: number;
  comprehensionRate: number;
  streakDays: number;
  completedReadings: number;
  lastReadingDate?: string | Date;
}

export interface User {
  id: string;
  _id?: string;
  email: string;
  name: string;
  role: UserRole;
  avatarUrl?: string;
  grade?: string;
  section?: string;
  stats?: UserStats;
  coins?: number;
  equippedTitle?: string;
  equippedFrame?: string;
  unlockedAchievements?: string[];
  claimedMissions?: string[];
  lastChestClaimDate?: string;
  status?: 'Activo' | 'Inactivo';
  isSuperAdmin?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}
