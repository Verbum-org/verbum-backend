import { Injectable, Logger } from '@nestjs/common';
import { RedisService } from '../redis/redis.service';
import { SupabaseService } from '../../supabase/supabase.service';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    private readonly redisService: RedisService,
    private readonly supabaseService: SupabaseService,
  ) {}

  async checkDatabase() {
    try {
      const supabase = this.supabaseService.getClient();
      // Simple query to check Supabase connection
      const { error } = await supabase.from('trial_accounts').select('count').limit(1).single();

      return {
        database: {
          status: error && error.code !== 'PGRST116' ? 'down' : 'up',
          type: 'supabase',
        },
      } as any;
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return {
        database: {
          status: 'down',
          type: 'supabase',
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
