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
      coins: 60,
      equippedTitle: 'Cadete de las Letras',
      equippedFrame: 'frame-default',
      unlockedAchievements: ['ach-welcome'],
      claimedMissions: [],
      lastChestClaimDate: '',
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
    const isStudent = role === 'STUDENT_ROLE';
    const newUser: UserDocument = {
      email: email.toLowerCase(),
      password: hashedPassword,
      name,
      avatarUrl: '',
      role,
      grade: isStudent ? (grade || '') : '',
      section: isStudent ? (section || '') : '',
      stats: this.getDefaultStats(),
      coins: 60,
      equippedTitle: 'Cadete de las Letras',
      equippedFrame: 'frame-default',
      unlockedAchievements: ['ach-welcome'],
      claimedMissions: [],
      lastChestClaimDate: '',
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
    try {
      const result = await this.collection.deleteOne({ _id: new ObjectId(id) });
      return result.deletedCount > 0;
    } catch {
      return false;
    }
  }

  async updateRole(
    id: string,
    role: UserRole,
    grade?: string,
    section?: string,
  ): Promise<UserDocument | null> {
    try {
      const updateFields: any = { role, updatedAt: new Date() };
      if (role !== 'STUDENT_ROLE') {
        updateFields.grade = '';
        updateFields.section = '';
      } else {
        if (grade !== undefined) updateFields.grade = grade;
        if (section !== undefined) updateFields.section = section;
      }

      await this.collection.updateOne(
        { _id: new ObjectId(id) },
        { $set: updateFields },
      );

      return this.findById(id);
    } catch {
      return null;
    }
  }


  async recordReadingAttempt(
    id: string,
    attempt: {
      wpm: number;
      comprehensionScore: number;
      xpEarned: number;
      readingLevel: number;
      readingTitle?: string;
      readingId?: string;
    },
  ): Promise<UserDocument | null> {
    const user = await this.findById(id);
    if (!user) return null;

    const isAdmin = user.role === 'ADMIN_ROLE';
    const currentStats = user.stats || this.getDefaultStats();
    const prevCompleted = currentStats.completedReadings || 0;
    const newCompleted = isAdmin ? 38 : prevCompleted + 1;

    const newAvgWpm = isAdmin
      ? Math.max(currentStats.averageWpm || 160, attempt.wpm)
      : (prevCompleted === 0 
          ? attempt.wpm 
          : Math.round((currentStats.averageWpm * prevCompleted + attempt.wpm) / newCompleted));

    const newAvgComp = isAdmin
      ? 100
      : (prevCompleted === 0 
          ? attempt.comprehensionScore 
          : Math.round((currentStats.comprehensionRate * prevCompleted + attempt.comprehensionScore) / newCompleted));

    const newXp = (currentStats.totalXp || 0) + attempt.xpEarned;
    const newLevel = isAdmin ? 38 : Math.max(currentStats.currentLevel || 1, attempt.readingLevel + 1);

    // Cálculo dinámico de racha por fechas
    const now = new Date();
    let newStreak = currentStats.streakDays || 0;
    if (currentStats.lastReadingDate) {
      const lastDate = new Date(currentStats.lastReadingDate);
      const diffTime = Math.abs(now.getTime() - lastDate.getTime());
      const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
      if (diffDays === 1) {
        newStreak += 1;
      } else if (diffDays > 1) {
        newStreak = 1;
      } else if (diffDays === 0 && newStreak === 0) {
        newStreak = 1;
      }
    } else {
      newStreak = 1;
    }

    // Monedas ganadas en este intento
    let coinsWon = 20;
    if (attempt.comprehensionScore === 100) coinsWon += 15;
    else if (attempt.comprehensionScore >= 80) coinsWon += 8;
    if (attempt.wpm >= 130) coinsWon += 10;
    const newCoins = isAdmin ? 99999 : (user.coins || 0) + coinsWon;

    // Desbloqueo progresivo de logros Kinal
    const currentAchievements = new Set(user.unlockedAchievements || ['ach-welcome']);
    if (newCompleted >= 1) currentAchievements.add('ach-first-step');
    if (attempt.wpm >= 140) currentAchievements.add('ach-speed-140');
    if (attempt.wpm >= 170) currentAchievements.add('ach-speed-170');
    if (attempt.comprehensionScore === 100) currentAchievements.add('ach-perfect-comp');
    if (newAvgComp >= 85 && newCompleted >= 3) currentAchievements.add('ach-critical-mind');
    if (newStreak >= 3) currentAchievements.add('ach-streak-3');
    if (newStreak >= 7) currentAchievements.add('ach-streak-7');
    if (newCompleted >= 5) currentAchievements.add('ach-bibliophile');
    if (newLevel >= 10) currentAchievements.add('ach-kinal-master');
    if (newCoins >= 200) currentAchievements.add('ach-coins-200');

    const updatedStats: UserStats = {
      ...currentStats,
      totalXp: isAdmin ? Math.max(newXp, 10000) : newXp,
      currentLevel: newLevel,
      averageWpm: newAvgWpm,
      comprehensionRate: newAvgComp,
      completedReadings: newCompleted,
      streakDays: isAdmin ? Math.max(newStreak, 30) : newStreak,
      lastReadingDate: now,
    };

    const historyItem = {
      readingId: attempt.readingId || '',
      readingTitle: attempt.readingTitle || `Lectura de Nivel ${attempt.readingLevel}`,
      readingLevel: attempt.readingLevel,
      wpm: attempt.wpm,
      comprehensionScore: attempt.comprehensionScore,
      xpEarned: attempt.xpEarned,
      completedAt: now,
    };

    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          stats: updatedStats,
          coins: newCoins,
          unlockedAchievements: Array.from(currentAchievements),
          updatedAt: now,
        },
        $push: {
          readingHistory: {
            $each: [historyItem],
            $slice: -50,
          },
        } as any,
      },
    );

    return this.findById(id);
  }

  async getLeaderboard(grade?: string, section?: string, limit = 20): Promise<any[]> {
    const filter: any = { role: 'STUDENT_ROLE' };
    if (grade) filter.grade = grade;
    if (section) filter.section = section;

    const students = await this.collection
      .find(filter)
      .sort({ 'stats.totalXp': -1, 'stats.averageWpm': -1 })
      .limit(limit)
      .toArray();

    return students.map((s, index) => ({
      rank: index + 1,
      id: s._id?.toString(),
      name: s.name,
      avatarUrl: s.avatarUrl,
      grade: s.grade || 'Grado General',
      section: s.section || 'A',
      totalXp: s.stats?.totalXp || 0,
      currentLevel: s.stats?.currentLevel || 1,
      averageWpm: s.stats?.averageWpm || 0,
      comprehensionRate: s.stats?.comprehensionRate || 0,
      streakDays: s.stats?.streakDays || 0,
      equippedTitle: s.equippedTitle || 'Cadete de las Letras',
      equippedFrame: s.equippedFrame || 'frame-default',
    }));
  }

  async claimDailyChest(id: string): Promise<{ success: boolean; message: string; xpWon?: number; coinsWon?: number; user?: any }> {
    const user = await this.findById(id);
    if (!user) return { success: false, message: 'Estudiante no encontrado' };

    const todayStr = new Date().toISOString().slice(0, 10);
    if (user.lastChestClaimDate === todayStr) {
      return { success: false, message: 'Ya has reclamado tu cofre del día. ¡Vuelve mañana!' };
    }

    const xpWon = 65;
    const coinsWon = 30;
    const currentStats = user.stats || this.getDefaultStats();
    const newStats: UserStats = {
      ...currentStats,
      totalXp: (currentStats.totalXp || 0) + xpWon,
    };
    const newCoins = (user.coins || 0) + coinsWon;

    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          stats: newStats,
          coins: newCoins,
          lastChestClaimDate: todayStr,
          updatedAt: new Date(),
        },
      },
    );

    const updated = await this.findById(id);
    const { password, ...safeUser } = updated as any;
    return {
      success: true,
      message: '¡Cofre abierto con éxito!',
      xpWon,
      coinsWon,
      user: safeUser,
    };
  }

  async claimMission(
    id: string,
    missionId: string,
    rewardXp: number,
    rewardCoins: number,
  ): Promise<{ success: boolean; message: string; user?: any }> {
    const user = await this.findById(id);
    if (!user) return { success: false, message: 'Estudiante no encontrado' };

    const claimed = user.claimedMissions || [];
    if (claimed.includes(missionId)) {
      return { success: false, message: 'Esta misión ya ha sido reclamada hoy' };
    }

    const currentStats = user.stats || this.getDefaultStats();
    const newStats: UserStats = {
      ...currentStats,
      totalXp: (currentStats.totalXp || 0) + rewardXp,
    };
    const newCoins = (user.coins || 0) + rewardCoins;
    const newClaimed = [...claimed, missionId];

    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          stats: newStats,
          coins: newCoins,
          claimedMissions: newClaimed,
          updatedAt: new Date(),
        },
      },
    );

    const updated = await this.findById(id);
    const { password, ...safeUser } = updated as any;
    return { success: true, message: '¡Recompensa de misión reclamada!', user: safeUser };
  }

  async updateCosmetics(
    id: string,
    equippedTitle?: string,
    equippedFrame?: string,
  ): Promise<any> {
    const updateFields: any = { updatedAt: new Date() };
    if (equippedTitle !== undefined) updateFields.equippedTitle = equippedTitle;
    if (equippedFrame !== undefined) updateFields.equippedFrame = equippedFrame;

    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields },
    );

    const updated = await this.findById(id);
    if (!updated) return null;
    const { password, ...safeUser } = updated as any;
    return safeUser;
  }

  async buyCosmetic(
    id: string,
    cost: number,
    itemType: 'frame' | 'title',
    itemId: string,
  ): Promise<{ success: boolean; message: string; user?: any }> {
    const user = await this.findById(id);
    if (!user) return { success: false, message: 'Estudiante no encontrado' };

    const isAdmin = user.role === 'ADMIN_ROLE';
    const currentCoins = isAdmin ? 99999 : (user.coins || 0);
    if (!isAdmin && currentCoins < cost) {
      return { success: false, message: 'No dispones de suficientes Monedas Kinal' };
    }

    const newCoins = isAdmin ? 99999 : Math.max(0, currentCoins - cost);
    const updateFields: any = { coins: newCoins, updatedAt: new Date() };
    if (itemType === 'frame') updateFields.equippedFrame = itemId;
    if (itemType === 'title') updateFields.equippedTitle = itemId;

    await this.collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: updateFields },
    );

    const updated = await this.findById(id);
    const { password, ...safeUser } = updated as any;
    if (isAdmin) {
      safeUser.coins = 99999;
    }
    return { success: true, message: '¡Artículo adquirido y equipado!', user: safeUser };
  }
}
