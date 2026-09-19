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
  coins?: number;                    // Monedas de Sabiduría Kinal
  equippedTitle?: string;            // Título honorífico activo (ej. 'Cadete de las Letras')
  equippedFrame?: string;            // Marco cosmético activo (ej. 'frame-gold')
  unlockedAchievements?: string[];   // Lista de IDs de logros desbloqueados
  claimedMissions?: string[];        // Lista de IDs de misiones reclamadas
  lastChestClaimDate?: string;       // Fecha ISO del último cofre reclamado
  createdAt: Date;
  updatedAt: Date;
}
