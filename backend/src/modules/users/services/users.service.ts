import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../../../core/database/database.service.js';
import { UserDocument, UserRole, UserStats } from '../schemas/user.schema.js';
import { ObjectId } from 'mongodb';
import bcrypt from 'bcryptjs';

@Injectable()
export class UsersService {
  constructor(private readonly dbService: DatabaseService) {}

  private get collection() {
    return this.dbService.getCollection<UserDocument>('users');
  }

  private getDefaultStats(): UserStats {
    return {
      totalXp: 0,
      currentLevel: 1,
      averageWpm: 0,
      comprehensionRate: 0,
      streakDays: 0,
      completedReadings: 0,
    };
  }

  async findByEmail(email: string): Promise<UserDocument | null> {
    return this.collection.findOne({ email: email.toLowerCase() });
  }

  async findById(id: string): Promise<UserDocument | null> {
    try {
      return this.collection.findOne({ _id: new ObjectId(id) });
    } catch {
      return null;
    }
  }

  async createStudent(email: string, name: string, avatarUrl?: string, googleId?: string): Promise<UserDocument> {
    const newUser: UserDocument = {
      email: email.toLowerCase(),
      name,
      avatarUrl: avatarUrl || '',
      googleId,
      role: 'STUDENT_ROLE',
      grade: '',
      section: '',
      stats: this.getDefaultStats(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.collection.insertOne(newUser);
    newUser._id = result.insertedId;
    return newUser;
  }

  async createUser(
    email: string,
    password: string,
    name: string,
    role: UserRole,
    grade?: string,
    section?: string,
  ): Promise<UserDocument> {
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser: UserDocument = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      avatarUrl: '',
      role,
      grade,
      section,
      stats: this.getDefaultStats(),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.collection.insertOne(newUser);
    newUser._id = result.insertedId;
    return newUser;
  }

  async updateProfile(id: string, updates: Partial<UserDocument>): Promise<void> {
    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { ...updates, updatedAt: new Date() } },
    );
  }

  async updateStats(id: string, newStats: Partial<UserStats>): Promise<void> {
    const user = await this.findById(id);
    if (!user) return;

    const mergedStats: UserStats = {
      ...user.stats,
      ...newStats,
    };

    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { stats: mergedStats, updatedAt: new Date() } },
    );
  }

  async findAll(role?: UserRole): Promise<UserDocument[]> {
    const filter = role ? { role } : {};
    return this.collection.find(filter).toArray();
  }

  async delete(id: string): Promise<boolean> {
    const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
    return result.deletedCount > 0;
  }

  async updateRole(
    id: string,
    role: UserRole,
    grade?: string,
    section?: string,
  ): Promise<UserDocument | null> {
    const updateFields: any = { role, updatedAt: new Date() };
    if (grade !== undefined) updateFields.grade = grade;
    if (section !== undefined) updateFields.section = section;

    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields },
    );

    return this.findById(id);
  }

  async recordReadingAttempt(
    id: string,
    attempt: { wpm: number; comprehensionScore: number; xpEarned: number; readingLevel: number },
  ): Promise<UserDocument | null> {
    const user = await this.findById(id);
    if (!user) return null;

    const currentStats = user.stats || this.getDefaultStats();
    const prevCompleted = currentStats.completedReadings || 0;
    const newCompleted = prevCompleted + 1;

    const newAvgWpm = prevCompleted === 0 
      ? attempt.wpm 
      : Math.round((currentStats.averageWpm * prevCompleted + attempt.wpm) / newCompleted);

    const newAvgComp = prevCompleted === 0 
      ? attempt.comprehensionScore 
      : Math.round((currentStats.comprehensionRate * prevCompleted + attempt.comprehensionScore) / newCompleted);

    const newXp = (currentStats.totalXp || 0) + attempt.xpEarned;
    const newLevel = Math.max(currentStats.currentLevel || 1, attempt.readingLevel + 1);

    const updatedStats: UserStats = {
      ...currentStats,
      totalXp: newXp,
      currentLevel: newLevel,
      averageWpm: newAvgWpm,
      comprehensionRate: newAvgComp,
      completedReadings: newCompleted,
      streakDays: Math.max(currentStats.streakDays || 1, 1),
    };

    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { stats: updatedStats, updatedAt: new Date() } },
    );

    return this.findById(id);
  }
}
