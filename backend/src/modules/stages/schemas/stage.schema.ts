import { ObjectId } from 'mongodb';

export interface StageDocument {
  _id?: ObjectId;
  id?: number | string;
  stageNumber: number;
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
  createdAt?: Date;
  updatedAt?: Date;
}
