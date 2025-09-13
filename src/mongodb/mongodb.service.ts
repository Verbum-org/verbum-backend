import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';

@Injectable()
export class MongodbService {
  private readonly logger = new Logger(MongodbService.name);

  constructor(@InjectConnection() private readonly connection: Connection) {}

  async onModuleInit() {
    this.logger.log('MongoDB connection established');
  }

  async onModuleDestroy() {
    await this.connection.close();
    this.logger.log('MongoDB connection closed');
  }

  getConnection(): Connection {
    return this.connection;
  }
}
