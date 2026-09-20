import { Injectable, OnModuleInit } from '@nestjs/common';
import { Collection, ObjectId } from 'mongodb';
import { DatabaseService } from '../../../core/database/database.service.js';
import { StageDocument } from '../schemas/stage.schema.js';

const DEFAULT_STAGES: Omit<StageDocument, '_id' | 'createdAt' | 'updatedAt'>[] = [
  {
    stageNumber: 1,
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
    stageNumber: 2,
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
    stageNumber: 3,
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
    stageNumber: 4,
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
    stageNumber: 5,
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

@Injectable()
export class StagesService implements OnModuleInit {
  private collection!: Collection<StageDocument>;

  constructor(private readonly dbService: DatabaseService) {}

  onModuleInit() {
    this.collection = this.dbService.getCollection<StageDocument>('stages');
    this.seedDefaultStagesIfEmpty().catch((err) => {
      console.error('[StagesService] Error inicializando etapas predeterminadas:', err);
    });
  }

  private async seedDefaultStagesIfEmpty(): Promise<void> {
    const count = await this.collection.countDocuments();
    if (count === 0) {
      console.log('[StagesService] Inicializando colección de etapas pedagógicas en MongoDB...');
      const docsWithDates: StageDocument[] = DEFAULT_STAGES.map((stage) => ({
        ...stage,
        createdAt: new Date(),
        updatedAt: new Date(),
      }));
      await this.collection.insertMany(docsWithDates);
      console.log(`[StagesService] ${docsWithDates.length} etapas inicializadas con éxito.`);
    }
  }

  async findAll(): Promise<StageDocument[]> {
    return this.collection.find().sort({ startLevel: 1 }).toArray();
  }

  async findById(id: string | number): Promise<StageDocument | null> {
    try {
      if (typeof id === 'string' && ObjectId.isValid(id)) {
        const found = await this.collection.findOne({ _id: new ObjectId(id) });
        if (found) return found;
      }
      const numericId = Number(id);
      if (!isNaN(numericId)) {
        const byNum = await this.collection.findOne({ id: numericId });
        if (byNum) return byNum;
        const byStageNum = await this.collection.findOne({ stageNumber: numericId });
        if (byStageNum) return byStageNum;
      }
      return this.collection.findOne({ id: id as any });
    } catch {
      return null;
    }
  }

  async create(data: Partial<StageDocument>): Promise<StageDocument> {
    const allStages = await this.findAll();
    const nextStageNumber = data.stageNumber
      ? Number(data.stageNumber)
      : allStages.length > 0 ? Math.max(...allStages.map((s) => s.stageNumber || 0)) + 1 : 1;

    const startLevel = Number(data.startLevel) || 1;
    const endLevel = Number(data.endLevel) || startLevel;
    const totalLevels = Math.max(1, endLevel - startLevel + 1);

    const newDoc: StageDocument = {
      stageNumber: nextStageNumber,
      id: nextStageNumber,
      title: data.title || `Etapa ${nextStageNumber}: Nuevo Reto Literario`,
      subtitle: data.subtitle || `Niveles ${startLevel} al ${endLevel}`,
      startLevel,
      endLevel,
      totalLevels: data.totalLevels ? Number(data.totalLevels) : totalLevels,
      description: data.description || '',
      themeColor: data.themeColor || '#004AAD',
      badge: data.badge || 'Lector Kinal',
      rewardXp: Number(data.rewardXp) || 300,
      rewardCoins: Number(data.rewardCoins) || 120,
      milestoneTitle: data.milestoneTitle || `Cofre de Etapa ${nextStageNumber}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.collection.insertOne(newDoc);
    newDoc._id = result.insertedId;
    return newDoc;
  }

  async update(id: string | number, data: Partial<StageDocument>): Promise<StageDocument | null> {
    const existing = await this.findById(id);
    if (!existing || !existing._id) return null;

    const updateFields: any = { updatedAt: new Date() };
    if (data.title !== undefined) updateFields.title = data.title;
    if (data.subtitle !== undefined) updateFields.subtitle = data.subtitle;
    if (data.stageNumber !== undefined) updateFields.stageNumber = Number(data.stageNumber);
    if (data.startLevel !== undefined) updateFields.startLevel = Number(data.startLevel);
    if (data.endLevel !== undefined) updateFields.endLevel = Number(data.endLevel);
    if (data.totalLevels !== undefined) {
      updateFields.totalLevels = Number(data.totalLevels);
    } else if (data.startLevel !== undefined || data.endLevel !== undefined) {
      const s = data.startLevel !== undefined ? Number(data.startLevel) : existing.startLevel;
      const e = data.endLevel !== undefined ? Number(data.endLevel) : existing.endLevel;
      updateFields.totalLevels = Math.max(1, e - s + 1);
    }
    if (data.description !== undefined) updateFields.description = data.description;
    if (data.themeColor !== undefined) updateFields.themeColor = data.themeColor;
    if (data.badge !== undefined) updateFields.badge = data.badge;
    if (data.rewardXp !== undefined) updateFields.rewardXp = Number(data.rewardXp);
    if (data.rewardCoins !== undefined) updateFields.rewardCoins = Number(data.rewardCoins);
    if (data.milestoneTitle !== undefined) updateFields.milestoneTitle = data.milestoneTitle;

    await this.collection.updateOne(
      { _id: existing._id },
      { $set: updateFields },
    );

    return this.findById(existing._id.toString());
  }

  async delete(id: string | number): Promise<boolean> {
    const existing = await this.findById(id);
    if (!existing || !existing._id) return false;

    const result = await this.collection.deleteOne({ _id: existing._id });
    return result.deletedCount === 1;
  }
}
