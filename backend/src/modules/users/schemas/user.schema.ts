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

export interface ReadingHistoryItem {
  readingId?: string;
  readingTitle: string;
  readingLevel?: number;
  wpm: number;
  oralAccuracy?: number;
  comprehensionScore: number;
  xpEarned?: number;
  completedAt: Date;
}

export interface UserDocument {
  _id?: ObjectId;
  googleId?: string;
  email: string;
  institutionalEmail?: string; // Correo institucional Kinal (ej. 2025014@kinal.edu.gt)
  carnet?: string;             // Número de carnet de estudiante Kinal (ej. 2025014)
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
  readingHistory?: ReadingHistoryItem[]; // Historial real de lecturas realizadas
  createdAt: Date;
  updatedAt: Date;
}
