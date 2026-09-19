import { User } from './user.model';

export interface Question {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface Reading {
  id: string;
  level: number;                // Nivel del 1 al 10
  title: string;
  genre: string;                // Ej: "Fábulas y Naturaleza", "Leyendas de Guatemala"
  targetWpm: number;            // Meta de palabras por minuto
  xpReward: number;
  content: string;              // Texto completo para lectura en voz alta
  wordCount: number;
  questions: Question[];
  difficulty?: 'Básico' | 'Intermedio' | 'Avanzado';
  author?: string;
  estimatedMinutes?: number;
  unlocked?: boolean;
  completed?: boolean;
  bestWpm?: number;
  bestComprehension?: number;
}

export interface ReadingAttemptResult {
  readingId: string;
  studentId: string;
  wpm: number;
  accuracy: number;
  timeSeconds: number;
  comprehensionScore: number;
  xpEarned: number;
  date?: string;
}

export interface StudentPerformance {
  student: User;
  averageWpm: number;
  comprehensionRate: number;
  streakDays: number;
  completedReadings: number;
  status: 'Destacado' | 'En Progreso' | 'Atención Requerida';
  weeklyHistory: { week: string; wpm: number; comprehension: number }[];
  recentReadings: { title: string; date: string; wpm: number; score: number }[];
}
