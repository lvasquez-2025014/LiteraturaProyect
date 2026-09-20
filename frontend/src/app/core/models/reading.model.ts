import { User } from './user.model';

export interface Question {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface RoadmapStage {
  id: number;
  stageNumber?: number;
  title: string;
  subtitle: string;
  startLevel: number;
  endLevel: number;
  totalLevels: number;
  description: string;
  themeColor: string;
  badge: string;
  rewardXp: number;
  rewardCoins: number;
  milestoneTitle: string;
  _id?: string;
}

export const ROADMAP_STAGES: RoadmapStage[] = [
  {
    id: 1,
    title: 'Etapa 1: Semillero Lector & Fábulas Ancestrales',
    subtitle: 'Primeros 3 Niveles (1 al 3)',
    startLevel: 1,
    endLevel: 3,
    totalLevels: 3,
    description: 'Iniciación a la fluidez rítmica, dicción de fonemas y comprensión literal de tradiciones guatemaltecas.',
    themeColor: '#004AAD',
    badge: 'Semillero Lector',
    rewardXp: 250,
    rewardCoins: 100,
    milestoneTitle: 'Gran Cofre del Semillero Lector',
  },
  {
    id: 2,
    title: 'Etapa 2: Expedición Silvestre & Tradición Oral',
    subtitle: 'Siguientes 5 Niveles (4 al 8)',
    startLevel: 4,
    endLevel: 8,
    totalLevels: 5,
    description: 'Relatos de la selva maya, narrativa costumbrista, ética laboral y leyendas coloniales (135 - 155 PPM).',
    themeColor: '#059669',
    badge: 'Explorador Silvestre',
    rewardXp: 450,
    rewardCoins: 180,
    milestoneTitle: 'Gran Cofre de la Expedición Maya',
  },
  {
    id: 3,
    title: 'Etapa 3: Crónicas Mayas & Desafíos Clásicos',
    subtitle: 'Siguientes 10 Niveles (9 al 18)',
    startLevel: 9,
    endLevel: 18,
    totalLevels: 10,
    description: 'Textos sagrados del Popol Vuh, crónicas coloniales, dramaturgia prehispánica y análisis crítico (160 - 188 PPM).',
    themeColor: '#D97706',
    badge: 'Cronista Maya',
    rewardXp: 800,
    rewardCoins: 300,
    milestoneTitle: 'Gran Relicario Prehispánico',
  },
  {
    id: 4,
    title: 'Etapa 4: Cumbres Literarias & Novela Social',
    subtitle: 'Siguientes 10 Niveles (19 al 28)',
    startLevel: 19,
    endLevel: 28,
    totalLevels: 10,
    description: 'Obras maestras de Miguel Ángel Asturias, realismo mágico y ensayos de memoria histórica (190 - 215 PPM).',
    themeColor: '#7C3AED',
    badge: 'Maestro de la Prosa',
    rewardXp: 1200,
    rewardCoins: 450,
    milestoneTitle: 'Bóveda del Premio Nobel',
  },
  {
    id: 5,
    title: 'Etapa 5: Cúspide Kinal & Maestría de la Palabra',
    subtitle: 'Siguientes 10 Niveles (29 al 38)',
    startLevel: 29,
    endLevel: 38,
    totalLevels: 10,
    description: 'La máxima expresión del estudiante kinalense: elocuencia, velocidad experta (218 - 250 PPM) y liderazgo transformador.',
    themeColor: '#DC2626',
    badge: 'Ingeniero Humanista',
    rewardXp: 2000,
    rewardCoins: 800,
    milestoneTitle: 'Cúspide Legendaria Kinal',
  },
];

export interface Reading {
  id: string;
  level: number;                // Nivel del 1 al 38
  title: string;
  genre: string;                // Ej: "Fábulas y Naturaleza", "Leyendas de Guatemala"
  targetWpm: number;            // Meta de palabras por minuto
  xpReward: number;
  content: string;              // Texto completo para lectura en voz alta
  wordCount: number;
  questions: Question[];
  difficulty?: 'Básico' | 'Intermedio' | 'Avanzado';
  author?: string;
  pedagogicalSource?: string;   // Fuente acreditada: MINEDUC Leamos Juntos, CERLALC/UNESCO, etc.
  estimatedMinutes?: number;
  unlocked?: boolean;
  completed?: boolean;
  bestWpm?: number;
  bestComprehension?: number;
  vocabulary?: { word: string; meaning: string }[];
  competencies?: string[];
}

export interface ReadingAttemptResult {
  readingId: string;
  readingTitle?: string;
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
  trendLabel?: string;
  trendDirection?: 'up' | 'down' | 'neutral';
  pedagogicalNote?: string;
}
