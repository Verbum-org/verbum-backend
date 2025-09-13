import { Inject, Injectable, Logger } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class RedisService {
  private readonly logger = new Logger(RedisService.name);
  private readonly memoryStore = new Map<string, { value: string; expires?: number }>();

  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis | null) {}

  async get(key: string): Promise<string | null> {
    if (!this.redis) {
      const item = this.memoryStore.get(key);
      if (!item) return null;
      if (item.expires && Date.now() > item.expires) {
        this.memoryStore.delete(key);
        return null;
      }
      return item.value;
    }

    try {
      return await this.redis.get(key);
    } catch (error) {
      this.logger.error(`Error getting key ${key}:`, error);
      return null;
    }
  }

  async set(key: string, value: string, ttl?: number): Promise<boolean> {
    if (!this.redis) {
      const expires = ttl ? Date.now() + ttl * 1000 : undefined;
      this.memoryStore.set(key, { value, expires });
      return true;
    }

    try {
      if (ttl) {
        await this.redis.setex(key, ttl, value);
      } else {
        await this.redis.set(key, value);
      }
      return true;
    } catch (error) {
      this.logger.error(`Error setting key ${key}:`, error);
      return false;
    }
  }

  async del(key: string): Promise<boolean> {
    if (!this.redis) {
      return this.memoryStore.delete(key);
    }

    try {
      await this.redis.del(key);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting key ${key}:`, error);
      return false;
    }
  }

  async exists(key: string): Promise<boolean> {
    try {
      const result = await this.redis.exists(key);
      return result === 1;
    } catch (error) {
      this.logger.error(`Error checking existence of key ${key}:`, error);
      return false;
    }
  }

  async expire(key: string, ttl: number): Promise<boolean> {
    try {
      await this.redis.expire(key, ttl);
      return true;
    } catch (error) {
      this.logger.error(`Error setting expiration for key ${key}:`, error);
      return false;
    }
  }

  async hget(key: string, field: string): Promise<string | null> {
    try {
      return await this.redis.hget(key, field);
    } catch (error) {
      this.logger.error(`Error getting hash field ${field} from key ${key}:`, error);
      return null;
    }
  }

  async hset(key: string, field: string, value: string): Promise<boolean> {
    try {
      await this.redis.hset(key, field, value);
      return true;
    } catch (error) {
      this.logger.error(`Error setting hash field ${field} for key ${key}:`, error);
      return false;
    }
  }

  async hgetall(key: string): Promise<Record<string, string> | null> {
    try {
      return await this.redis.hgetall(key);
    } catch (error) {
      this.logger.error(`Error getting all hash fields for key ${key}:`, error);
      return null;
    }
  }

  async hdel(key: string, field: string): Promise<boolean> {
    try {
      await this.redis.hdel(key, field);
      return true;
    } catch (error) {
      this.logger.error(`Error deleting hash field ${field} from key ${key}:`, error);
      return false;
    }
  }

  async lpush(key: string, ...values: string[]): Promise<number> {
    try {
      return await this.redis.lpush(key, ...values);
    } catch (error) {
      this.logger.error(`Error pushing to list ${key}:`, error);
      return 0;
    }
  }

  async rpop(key: string): Promise<string | null> {
    try {
      return await this.redis.rpop(key);
    } catch (error) {
      this.logger.error(`Error popping from list ${key}:`, error);
      return null;
    }
  }

  async llen(key: string): Promise<number> {
    try {
      return await this.redis.llen(key);
    } catch (error) {
      this.logger.error(`Error getting list length for key ${key}:`, error);
      return 0;
    }
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.redis.sadd(key, ...members);
    } catch (error) {
      this.logger.error(`Error adding to set ${key}:`, error);
      return 0;
    }
  }

  async smembers(key: string): Promise<string[]> {
    try {
      return await this.redis.smembers(key);
    } catch (error) {
      this.logger.error(`Error getting set members for key ${key}:`, error);
      return [];
    }
  }

  async srem(key: string, ...members: string[]): Promise<number> {
    try {
      return await this.redis.srem(key, ...members);
    } catch (error) {
      this.logger.error(`Error removing from set ${key}:`, error);
      return 0;
    }
  }

  async publish(channel: string, message: string): Promise<number> {
    try {
      return await this.redis.publish(channel, message);
    } catch (error) {
      this.logger.error(`Error publishing to channel ${channel}:`, error);
      return 0;
    }
  }

  async subscribe(channel: string, callback: (message: string) => void): Promise<void> {
    try {
      await this.redis.subscribe(channel);
      this.redis.on('message', (receivedChannel, message) => {
        if (receivedChannel === channel) {
          callback(message);
        }
      });
    } catch (error) {
      this.logger.error(`Error subscribing to channel ${channel}:`, error);
    }
  }

  async ping(): Promise<string> {
    try {
      return await this.redis.ping();
    } catch (error) {
      this.logger.error('Error pinging Redis:', error);
      throw error;
    }
  }

  async flushdb(): Promise<void> {
    try {
      await this.redis.flushdb();
    } catch (error) {
      this.logger.error('Error flushing database:', error);
      throw error;
    }
  }
}
