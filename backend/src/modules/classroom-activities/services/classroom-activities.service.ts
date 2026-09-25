import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { Collection, ObjectId } from 'mongodb';
import { DatabaseService } from '../../../core/database/database.service.js';
import {
  ClassroomActivityDocument,
  ClassroomActivitySubmission,
} from '../schemas/classroom-activity.schema.js';

@Injectable()
export class ClassroomActivitiesService implements OnModuleInit {
  private collection!: Collection<ClassroomActivityDocument>;

  constructor(@Inject(DatabaseService) private readonly dbService: DatabaseService) {}

  onModuleInit() {
    this.collection = this.dbService.getCollection<ClassroomActivityDocument>('classroom_activities');
    this.seedDefaultActivityIfEmpty().catch((err) => {
      console.error('[ClassroomActivitiesService] Error inicializando actividad por defecto:', err);
    });
  }

  async findActive(grade?: string, section?: string): Promise<ClassroomActivityDocument | null> {
    // Buscar actividad con status ACTIVE
    const query: any = { status: 'ACTIVE' };
    
    // Si viene grado específico, buscar la que corresponda al grado o a 'all'
    if (grade && grade !== 'all') {
      query.$or = [
        { gradeLevel: 'all' },
        { gradeLevel: grade },
        { gradeLevel: { $exists: false } },
      ];
    }

    const activity = await this.collection.findOne(query, { sort: { createdAt: -1 } });
    if (!activity) {
      // Fallback: buscar la más reciente activa sin importar filtros
      return this.collection.findOne({ status: 'ACTIVE' }, { sort: { createdAt: -1 } });
    }
    return activity;
  }

  async findAll(): Promise<ClassroomActivityDocument[]> {
    return this.collection.find().sort({ createdAt: -1 }).toArray();
  }

  async findById(id: string): Promise<ClassroomActivityDocument | null> {
    try {
      if (ObjectId.isValid(id)) {
        return this.collection.findOne({ _id: new ObjectId(id) });
      }
      return this.collection.findOne({ id } as any);
    } catch {
      return null;
    }
  }

  async create(data: Partial<ClassroomActivityDocument>, teacherId: string, teacherName: string): Promise<ClassroomActivityDocument> {
    // Si se crea como ACTIVE, podemos marcar las anteriores como FINISHED para evitar confusiones
    if (data.status === 'ACTIVE') {
      await this.collection.updateMany(
        { status: 'ACTIVE' },
        { $set: { status: 'FINISHED', updatedAt: new Date() } }
      );
    }

    const wordCount = data.content ? data.content.trim().split(/\s+/).length : 0;

    const newDoc: ClassroomActivityDocument = {
      title: data.title || 'Actividad en Clase - Lectura Guiada',
      description: data.description || 'Lectura obligatoria y evaluación en tiempo real.',
      readingId: data.readingId || '',
      readingTitle: data.readingTitle || data.title || 'Lectura de Clase',
      content: data.content || '',
      wordCount,
      timeLimitMinutes: Number(data.timeLimitMinutes) || 5,
      allowMic: data.allowMic !== undefined ? Boolean(data.allowMic) : true,
      questions: data.questions || [],
      teacherId,
      teacherName: teacherName || 'Profesor de Literatura',
      gradeLevel: data.gradeLevel || 'all',
      section: data.section || 'all',
      status: data.status || 'ACTIVE',
      submissions: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.collection.insertOne(newDoc);
    newDoc._id = result.insertedId;
    newDoc.id = result.insertedId.toString();
    return newDoc;
  }

  async updateStatus(id: string, status: 'ACTIVE' | 'FINISHED' | 'DRAFT'): Promise<boolean> {
    const filter: any = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id };
    const res = await this.collection.updateOne(filter, {
      $set: { status, updatedAt: new Date() },
    });
    return res.matchedCount > 0;
  }

  async submitAttempt(
    activityId: string,
    submissionData: Omit<ClassroomActivitySubmission, 'submittedAt'>
  ): Promise<{ submission: ClassroomActivitySubmission; rank: number; totalStudents: number }> {
    const filter: any = ObjectId.isValid(activityId) ? { _id: new ObjectId(activityId) } : { id: activityId };
    const activity = await this.collection.findOne(filter);
    if (!activity) {
      throw new Error('Actividad en clase no encontrada');
    }

    const submission: ClassroomActivitySubmission = {
      ...submissionData,
      submittedAt: new Date(),
    };

    // Si el alumno ya había enviado, actualizar su intento o registrar el mejor
    const existingSubmissions = activity.submissions || [];
    const existingIndex = existingSubmissions.findIndex((s) => s.studentId === submission.studentId);

    if (existingIndex >= 0) {
      existingSubmissions[existingIndex] = submission;
    } else {
      existingSubmissions.push(submission);
    }

    // Guardar en la base de datos
    await this.collection.updateOne(filter, {
      $set: { submissions: existingSubmissions, updatedAt: new Date() },
    });

    // Calcular el ranking
    const sorted = [...existingSubmissions].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; // Mayor nota primero
      }
      return a.timeSpentSeconds - b.timeSpentSeconds; // Menor tiempo desempata
    });

    const rank = sorted.findIndex((s) => s.studentId === submission.studentId) + 1;

    return {
      submission,
      rank: rank > 0 ? rank : 1,
      totalStudents: sorted.length,
    };
  }

  async getRanking(activityId: string): Promise<ClassroomActivitySubmission[]> {
    const filter: any = ObjectId.isValid(activityId) ? { _id: new ObjectId(activityId) } : { id: activityId };
    const activity = await this.collection.findOne(filter);
    if (!activity || !activity.submissions) return [];

    return [...activity.submissions].sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score; // Nota más alta primero
      }
      return a.timeSpentSeconds - b.timeSpentSeconds; // Menor tiempo
    });
  }

  private async seedDefaultActivityIfEmpty(): Promise<void> {
    const count = await this.collection.countDocuments();
    if (count > 0) return;

    const defaultActivity: ClassroomActivityDocument = {
      title: 'El Señor Presidente y la Sombra del Dictador',
      description: 'Lectura oficial de actividad en clase. Análisis de fragmento de Miguel Ángel Asturias con evaluación inmediata.',
      readingId: 'asturias-senor-presidente',
      readingTitle: 'El Señor Presidente (Fragmento Crítico)',
      content: `¡Alumbra, lumbre de alumbre, Luzbel de piedra lumbre! Sobre la podredumbre de los muertos, lumbre de alumbre, sobre las tumbas, lumbre de piedra alumbre. En el portal del Señor se arrastraban los mendigos de la ciudad como gusanos bajo una lápida. La noche caía con pesadez de plomo sobre las calles coloniales de la urbe guatemalteca, donde las paredes parecían tener ojos y los adoquines oídos.\n\nNadie se atrevía a pronunciar el nombre del Dictador en voz alta. Los susurros corrían como polvo helado impulsado por el viento de noviembre. El miedo no era una emoción pasajera; era el aire que se respiraba en las esquinas, la sombra que acompañaba a cada transeúnte y el eco de las botas militares que resonaba a la distancia. El Portal del Señor cobijaba a los desamparados, los olvidados de un régimen donde pensar era una herejía y hablar con franqueza equivalía a una condena ineludible.\n\nAsturias teje con maestría poética un tapiz sonoro donde las palabras no solo narran, sino que retumban como campanas fúnebres. La opresión social se transforma en pesadilla colectiva, demostrando que la literatura no solo retrata la tiranía, sino que se convierte en un testimonio inquebrantable de resistencia y memoria histórica.`,
      wordCount: 198,
      timeLimitMinutes: 4,
      allowMic: true, // Con opción de micrófono habilitada por el profesor
      questions: [
        {
          id: 'q1',
          prompt: '¿Qué atmósfera sensorial transmite la repetición fónica inicial "¡Alumbra, lumbre de alumbre!"?',
          options: [
            'Una atmósfera festiva y alegre propia de una celebración popular.',
            'Un tono hipnótico, sofocante y fúnebre que evoca podredumbre y desesperanza.',
            'Un cántico de esperanza divina y salvación política.',
            'Un anuncio comercial de los mercaderes del portal.',
          ],
          correctIndex: 1,
          explanation: 'La sonoridad y aliteración fúnebre crean un clima de angustia y asfixia psicológica bajo la opresión del régimen.',
        },
        {
          id: 'q2',
          prompt: '¿Cómo describe el texto la presencia del miedo en la ciudad guatemalteca?',
          options: [
            'Como una sensación leve que solo sentían los delincuentes.',
            'Como una fuerza invisible pero tangible: era el aire que se respiraba y la sombra que acompañaba a todos.',
            'Como una mentira propagada por extranjeros.',
            'Como un mito que ya había desaparecido con las nuevas leyes.',
          ],
          correctIndex: 1,
          explanation: 'El texto señala textualmente: "El miedo no era una emoción pasajera; era el aire que se respiraba en las esquinas".',
        },
        {
          id: 'q3',
          prompt: '¿Quiénes se refugiaban y arrastraban bajo el Portal del Señor?',
          options: [
            'Los soldados de guardia del régimen.',
            'Los jueces y abogados de la corte suprema.',
            'Los mendigos y desamparados, olvidados por la sociedad y el poder.',
            'Los comerciantes ricos del centro de la ciudad.',
          ],
          correctIndex: 2,
          explanation: 'Bajo el Portal del Señor se arrastraban los mendigos de la ciudad como gusanos bajo una lápida.',
        },
        {
          id: 'q4',
          prompt: 'Según el fragmento, ¿cuál es el rol fundamental de la literatura frente a la tiranía?',
          options: [
            'Aceptar el orden establecido para evitar represalias violentas.',
            'Divertir a los ciudadanos para que olviden la realidad política.',
            'Ser un testimonio inquebrantable de resistencia y memoria histórica contra el olvido.',
            'Justificar las acciones del gobernante a través de fábulas épicas.',
          ],
          correctIndex: 2,
          explanation: 'El texto concluye destacando que la literatura es un testimonio inquebrantable de resistencia y memoria histórica.',
        },
      ],
      teacherId: 'teacher-kinal-lit-01',
      teacherName: 'Prof. Carlos Mendoza',
      gradeLevel: 'all',
      section: 'all',
      status: 'ACTIVE',
      submissions: [
        {
          studentId: 'demo-student-01',
          studentName: 'Mateo Alejandro Ruiz',
          studentEmail: 'mruiz@kinal.edu.gt',
          grade: '4to Perito',
          section: 'A',
          carnet: '2023001',
          avatarUrl: '',
          score: 100,
          wpm: 185,
          timeSpentSeconds: 142,
          correctAnswersCount: 4,
          totalQuestions: 4,
          submittedAt: new Date(Date.now() - 3600000 * 2),
          micUsed: true,
        },
        {
          studentId: 'demo-student-02',
          studentName: 'Sofía Isabel Morales',
          studentEmail: 'smorales@kinal.edu.gt',
          grade: '4to Perito',
          section: 'B',
          carnet: '2023045',
          avatarUrl: '',
          score: 100,
          wpm: 168,
          timeSpentSeconds: 165,
          correctAnswersCount: 4,
          totalQuestions: 4,
          submittedAt: new Date(Date.now() - 3600000 * 1.5),
          micUsed: true,
        },
        {
          studentId: 'demo-student-03',
          studentName: 'Diego Fernando Castillo',
          studentEmail: 'dcastillo@kinal.edu.gt',
          grade: '5to Perito',
          section: 'A',
          carnet: '2022019',
          avatarUrl: '',
          score: 75,
          wpm: 154,
          timeSpentSeconds: 180,
          correctAnswersCount: 3,
          totalQuestions: 4,
          submittedAt: new Date(Date.now() - 3600000),
          micUsed: false,
        },
      ],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await this.collection.insertOne(defaultActivity);
    console.log('[ClassroomActivitiesService] Actividad en clase predeterminada sembrada con éxito');
  }
}
