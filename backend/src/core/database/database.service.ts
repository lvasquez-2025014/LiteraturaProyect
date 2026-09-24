import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { MongoClient, Db, Collection, type Document } from 'mongodb';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private client: MongoClient;
  private dbInstance!: Db;

  constructor() {
    const mongoUrl = process.env.MONGO_URL || 'mongodb://localhost:27017';
    this.client = new MongoClient(mongoUrl, {
      maxPoolSize: 50,
      minPoolSize: 5,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 8000,
      connectTimeoutMS: 10000,
    });
  }

  async onModuleInit() {
    const dbName = process.env.DB_NAME || 'literaturaProyect';
    try {
      await this.client.connect();
      this.dbInstance = this.client.db(dbName);
      console.log(`[DatabaseService] Conectado exitosamente a MongoDB en: ${dbName}`);
    } catch (error) {
      console.error('[DatabaseService] Error conectando a MongoDB:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.client.close();
    console.log('[DatabaseService] Conexión a MongoDB cerrada');
  }

  get db(): Db {
    return this.dbInstance;
  }

  getCollection<T extends Document = Document>(name: string): Collection<T> {
    return this.dbInstance.collection<T>(name);
  }
}
