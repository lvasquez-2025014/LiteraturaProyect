import { ObjectId } from 'mongodb';

export interface QuestionDocument {
  id: string;
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}

export interface ReadingDocument {
  _id?: ObjectId;
  id?: string;
  level: number;
  title: string;
  genre: string;
  targetWpm: number;
  xpReward: number;
  content: string;
  wordCount: number;
  questions: QuestionDocument[];
  difficulty?: 'Básico' | 'Intermedio' | 'Avanzado';
  author?: string;
  pedagogicalSource?: string;
  estimatedMinutes?: number;
  vocabulary?: { word: string; meaning: string }[];
  competencies?: string[];
  createdAt?: Date;
  updatedAt?: Date;
}
