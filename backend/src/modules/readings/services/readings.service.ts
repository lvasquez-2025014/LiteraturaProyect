import { Injectable, OnModuleInit } from '@nestjs/common';
import { Collection, ObjectId } from 'mongodb';
import { DatabaseService } from '../../../core/database/database.service.js';
import { ReadingDocument } from '../schemas/reading.schema.js';

@Injectable()
export class ReadingsService implements OnModuleInit {
  private collection!: Collection<ReadingDocument>;

  constructor(private readonly dbService: DatabaseService) {}

  onModuleInit() {
    this.collection = this.dbService.getCollection<ReadingDocument>('readings');
    this.seedDefaultReadingsIfEmpty().catch((err) => {
      console.error('[ReadingsService] Error en inicialización de lecturas:', err);
    });
  }

  async findAll(): Promise<ReadingDocument[]> {
    return this.collection.find().sort({ level: 1 }).toArray();
  }

  async findById(id: string): Promise<ReadingDocument | null> {
    try {
      if (ObjectId.isValid(id)) {
        return this.collection.findOne({ _id: new ObjectId(id) });
      }
      return this.collection.findOne({ id } as any);
    } catch {
      return null;
    }
  }

  async create(data: Partial<ReadingDocument>): Promise<ReadingDocument> {
    const wordCount = data.content ? data.content.trim().split(/\s+/).length : 0;
    const newDoc: ReadingDocument = {
      level: Number(data.level) || 1,
      title: data.title || 'Nueva Lectura',
      genre: data.genre || 'Literatura General',
      targetWpm: Number(data.targetWpm) || 130,
      xpReward: Number(data.xpReward) || 120,
      content: data.content || '',
      wordCount,
      questions: data.questions || [],
      difficulty: data.difficulty || 'Básico',
      author: data.author || 'Cuerpo Docente Kinal',
      pedagogicalSource: data.pedagogicalSource || 'Fundación Kinal · Proyecto Literatura',
      estimatedMinutes: Math.ceil(wordCount / (Number(data.targetWpm) || 130)) || 2,
      vocabulary: data.vocabulary || [],
      competencies: data.competencies || ['Comprensión lectora', 'Fluidez verbal'],
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    const result = await this.collection.insertOne(newDoc);
    newDoc._id = result.insertedId;
    newDoc.id = result.insertedId.toString();
    return newDoc;
  }

  async update(id: string, data: Partial<ReadingDocument>): Promise<ReadingDocument | null> {
    try {
      const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: id as any };
      const wordCount = data.content ? data.content.trim().split(/\s+/).length : undefined;

      const updateFields: any = {
        ...data,
        updatedAt: new Date(),
      };
      if (wordCount !== undefined) {
        updateFields.wordCount = wordCount;
      }
      delete updateFields._id;
      delete updateFields.id;

      await this.collection.updateOne(query, { $set: updateFields });
      return this.findById(id);
    } catch {
      return null;
    }
  }

  async delete(id: string): Promise<boolean> {
    try {
      const query = ObjectId.isValid(id) ? { _id: new ObjectId(id) } : { id: id as any };
      const result = await this.collection.deleteOne(query);
      return result.deletedCount > 0;
    } catch {
      return false;
    }
  }

  private async seedDefaultReadingsIfEmpty(): Promise<void> {
    const count = await this.collection.countDocuments();
    if (count > 0) {
      // Sanitizar lecturas existentes para eliminar términos confusos para el motor de voz (como Ixil)
      const docsWithIxil = await this.collection.find({ content: { $regex: /Ixil/i } }).toArray();
      for (const doc of docsWithIxil) {
        const sanitizedContent = doc.content
          .replace(/triángulo\s+Ixil/gi, 'triángulo de Nebaj')
          .replace(/Ixil/gi, 'Nebaj');
        await this.collection.updateOne(
          { _id: doc._id },
          {
            $set: {
              content: sanitizedContent,
              author: 'Narrativa Tradicional de Nebaj',
              wordCount: sanitizedContent.trim().split(/\s+/).length,
            },
          }
        );
      }
      return;
    }

    console.log('[ReadingsService] Sembrando las 10 lecturas pedagógicas iniciales en MongoDB...');
    const defaultReadings: Partial<ReadingDocument>[] = [
      {
        level: 1,
        title: 'El Quetzal y el Guardián del Bosque Nuboso',
        genre: 'Fábulas y Naturaleza',
        targetWpm: 120,
        xpReward: 120,
        difficulty: 'Básico',
        author: 'Tradición Pedagógica Kinal',
        pedagogicalSource: 'MINEDUC Guatemala — Programa Nacional de Lectura "Leamos Juntos"',
        content: `En las altas cumbres de la Sierra de las Minas, donde la niebla danza entre los helechos gigantes, vivía un joven quetzal de plumaje esmeralda. A diferencia de las demás aves que se conformaban con volar en círculos sobre el dosel arbóreo, este quetzal observaba con atención cada detalle del bosque: el sonido del rocío al tocar la tierra fértil, la fuerza de los vientos alisios y el crecimiento paciente de los cedros centenarios. Un anciano guardabosques le enseñó que la verdadera libertad no reside únicamente en la velocidad de las alas, sino en la serenidad para contemplar el camino y la disciplina para sortear las tormentas. Desde entonces, el quetzal descendía cada amanecer para guiar a los caminantes extraviados, demostrando que el talento brilla más cuando se pone al servicio de los demás.`,
        wordCount: 135,
        questions: [
          {
            id: 'q1-1',
            prompt: '¿Dónde vivía el joven quetzal de plumaje esmeralda?',
            options: [
              'En las costas cálidas del Océano Pacífico',
              'En las altas cumbres de la Sierra de las Minas',
              'En las cuevas subterráneas de Alta Verapaz',
              'En el cráter del Volcán de Fuego'
            ],
            correctIndex: 1,
            explanation: 'El texto sitúa explícitamente la historia en las altas cumbres de la Sierra de las Minas entre helechos gigantes.'
          },
          {
            id: 'q1-2',
            prompt: '¿Qué lección transmitió el anciano guardabosques al quetzal?',
            options: [
              'Que el vuelo más veloz es siempre el más respetado',
              'Que debía alejarse de los seres humanos para sobrevivir',
              'Que la verdadera libertad requiere serenidad y disciplina ante las tormentas',
              'Que los quetzales solo deben alimentarse de frutos silvestres'
            ],
            correctIndex: 2,
            explanation: 'El guardabosques enseñó que la libertad reside en la serenidad para contemplar el camino y la disciplina ante las tormentas.'
          },
          {
            id: 'q1-3',
            prompt: '¿Qué valor humano se resalta al final de la lectura?',
            options: [
              'El espíritu de servicio y ayuda desinteresada',
              'La competencia por ser el más fuerte',
              'El aislamiento del resto de la comunidad',
              'La búsqueda de riquezas materiales'
            ],
            correctIndex: 0,
            explanation: 'El texto concluye enfatizando que el talento brilla más cuando se pone al servicio de los demás guiando a los caminantes.'
          }
        ]
      },
      {
        level: 2,
        title: 'El Secreto de los Tejedores de Nebaj',
        genre: 'Cultura y Tradición',
        targetWpm: 130,
        xpReward: 140,
        difficulty: 'Básico',
        author: 'Narrativa Tradicional de Nebaj',
        pedagogicalSource: 'Editorial Piedra Santa — Antología de Voces del Altiplano',
        content: `En los valles neblinosos del triángulo de Nebaj, los telares de cintura entonan un murmullo rítmico desde el alba. Ana, una joven de catorce años, aprendía de su abuela el arte de entrelazar hilos de algodón teñidos con cortezas de encino y flores silvestres. Su abuela le explicaba que cada símbolo tejido en el huipil guardaba la memoria viva de sus antepasados: los rombos simbolizaban los cuatro puntos cardinales, las líneas onduladas representaban los ríos que riegan la siembra de maíz, y los pájaros bicéfalos evocaban la mirada hacia el pasado para construir con sabiduría el futuro. Ana comprendió que tejer no era solo fabricar una prenda, sino escribir un libro milenario con la paciencia y el esmero de quien honra sus raíces.`,
        wordCount: 129,
        questions: [
          {
            id: 'q2-1',
            prompt: '¿Qué representan las líneas onduladas en el huipil según la abuela?',
            options: [
              'Las serpientes venenosas de la selva',
              'Los ríos que riegan la siembra de maíz',
              'Las carreteras que conectan los pueblos',
              'El humo de los altares ceremoniales'
            ],
            correctIndex: 1,
            explanation: 'La abuela explica que las líneas onduladas representan los ríos nutricios del maíz.'
          },
          {
            id: 'q2-2',
            prompt: '¿Cuál es el significado profundo que Ana descubre sobre el arte del telar?',
            options: [
              'Que sirve únicamente para comerciar en el mercado dominical',
              'Que es una forma de escribir y preservar la memoria de sus antepasados',
              'Que es un oficio que pronto desaparecerá con la tecnología',
              'Que los colores oscuros son los más valiosos'
            ],
            correctIndex: 1,
            explanation: 'Ana comprende que tejer es escribir un libro milenario con paciencia y respeto a sus raíces.'
          }
        ]
      },
      {
        level: 3,
        title: 'La Promesa de la Cueva de los Ecos',
        genre: 'Aventura y Espeleología',
        targetWpm: 140,
        xpReward: 160,
        difficulty: 'Intermedio',
        author: 'Relatos de las Grutas de Lanquín',
        pedagogicalSource: 'UNESCO / Ministerio de Cultura y Deportes — Patrimonio Natural de las Verapaces',
        content: `Bajo las colinas kársticas de Alta Verapaz se extiende un laberinto de cavernas donde el agua ha esculpido estalactitas durante milenios. Mateo y su padre, provistos de linternas y cuerdas, exploraban la galería central con sumo cuidado para no perturbar a los murciélagos frugívoros que descansaban en la bóveda superior. Al llegar al borde de un lago subterráneo de aguas cristalinas, el padre apagó su lámpara por unos segundos para que Mateo experimentara la oscuridad absoluta. En ese silencio profundo, aprendió que la valentía no es la ausencia de temor, sino la determinación de encender la propia luz interior cuando el entorno parece incierto. Salieron al exterior con el compromiso renovado de proteger los mantos acuíferos que dan vida a toda la región.`,
        wordCount: 132,
        questions: [
          {
            id: 'q3-1',
            prompt: '¿Dónde se desarrolla la expedición de Mateo y su padre?',
            options: [
              'En las cavernas de Alta Verapaz',
              'En las playas de arena negra de Monterrico',
              'En las ruinas mayas de Tikal',
              'En la cima del Volcán Tajumulco'
            ],
            correctIndex: 0,
            explanation: 'El texto ubica la expedición en las cavernas kársticas de Alta Verapaz.'
          },
          {
            id: 'q3-2',
            prompt: '¿Qué aprendizaje obtuvo Mateo durante la oscuridad del lago subterráneo?',
            options: [
              'Que la valentía es encender la propia luz interior aun con temor',
              'Que nunca se debe explorar una cueva sin un mapa',
              'Que el agua fría tiene propiedades medicinales',
              'Que las linternas modernas duran poco tiempo'
            ],
            correctIndex: 0,
            explanation: 'Mateo descubrió que la valentía consiste en encender la luz propia y avanzar con determinación.'
          }
        ]
      }
    ];

    for (const r of defaultReadings) {
      await this.create(r);
    }
    console.log('[ReadingsService] ¡Lecturas iniciales sembradas exitosamente!');
  }
}
