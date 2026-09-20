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

export interface ReadingHistoryItem {
  readingId?: string;
  readingTitle: string;
  readingLevel?: number;
  wpm: number;
  comprehensionScore: number;
  xpEarned?: number;
  completedAt: string | Date;
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
  readingHistory?: ReadingHistoryItem[];
  status?: 'Activo' | 'Inactivo';
  isSuperAdmin?: boolean;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export const KINAL_GRADES = [
  // Ciclo Básico
  'Primero Básico',
  'Segundo Básico',
  'Tercero Básico',
  // Cuarto Perito
  'Cuarto Perito en Informática',
  'Cuarto Perito en Dibujo',
  'Cuarto Perito en Electrónica',
  'Cuarto Perito en Electricidad',
  'Cuarto Perito en Mecánica',
  // Quinto Perito
  'Quinto Perito en Informática',
  'Quinto Perito en Dibujo',
  'Quinto Perito en Electrónica',
  'Quinto Perito en Electricidad',
  'Quinto Perito en Mecánica',
  // Sexto Perito
  'Sexto Perito en Informática',
  'Sexto Perito en Dibujo',
  'Sexto Perito en Electrónica',
  'Sexto Perito en Electricidad',
  'Sexto Perito en Mecánica',
] as const;

export type KinalGrade = typeof KINAL_GRADES[number];

export const KINAL_SECTIONS = [
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'
] as const;

export type KinalSection = typeof KINAL_SECTIONS[number];

export interface GradeGroup {
  group: string;
  grades: string[];
}

export const KINAL_GRADE_GROUPS: GradeGroup[] = [
  {
    group: 'Ciclo Básico',
    grades: ['Primero Básico', 'Segundo Básico', 'Tercero Básico'],
  },
  {
    group: 'Cuarto Perito',
    grades: [
      'Cuarto Perito en Informática',
      'Cuarto Perito en Dibujo',
      'Cuarto Perito en Electrónica',
      'Cuarto Perito en Electricidad',
      'Cuarto Perito en Mecánica',
    ],
  },
  {
    group: 'Quinto Perito',
    grades: [
      'Quinto Perito en Informática',
      'Quinto Perito en Dibujo',
      'Quinto Perito en Electrónica',
      'Quinto Perito en Electricidad',
      'Quinto Perito en Mecánica',
    ],
  },
  {
    group: 'Sexto Perito',
    grades: [
      'Sexto Perito en Informática',
      'Sexto Perito en Dibujo',
      'Sexto Perito en Electrónica',
      'Sexto Perito en Electricidad',
      'Sexto Perito en Mecánica',
    ],
  },
];
