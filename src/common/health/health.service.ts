import { Injectable, Logger } from '@nestjs/common';
import { InjectConnection } from '@nestjs/mongoose';
import { Connection } from 'mongoose';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly redisService: RedisService,
    @InjectConnection() private readonly connection: Connection,
  ) {}

  async checkDatabase() {
    try {
      await this.connection.db.admin().ping();
      return {
        database: {
          status: 'up',
        },
      } as any;
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        database: {
          status: 'down',
          error: error.message,
        },
      } as any;
    }
  }

  async checkRedis() {
    try {
      const result = await this.redisService.ping();
      return {
        redis: {
          status: result === 'PONG' ? 'up' : 'down',
          response: result,
        },
      } as any;
    } catch (error) {
      this.logger.error('Redis health check failed:', error);
      return {
        redis: {
          status: 'down',
          error: error.message,
        },
      } as any;
    }
  }
}
