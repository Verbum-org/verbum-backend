import { InjectQueue } from '@nestjs/bull';
import { Injectable, Logger } from '@nestjs/common';
import { Queue } from 'bull';
import {
  SyncCoursesDto,
  SyncEnrollmentsDto,
  SyncUsersDto,
} from '../moodle-adapter/dto/moodle-adapter.dto';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);

  constructor(
    @InjectQueue('sync') private syncQueue: Queue,
    @InjectQueue('webhook') private webhookQueue: Queue,
    @InjectQueue('report') private reportQueue: Queue,
  ) {}

  /**
   * Sync Jobs
   */
  async queueUsersSync(syncDto: SyncUsersDto, options?: any) {
    try {
      const job = await this.syncQueue.add('users', syncDto, {
        ...options,
        removeOnComplete: 10,
        removeOnFail: 5,
      });

      this.logger.log(`Users sync job queued with ID: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error('Error queuing users sync job:', error);
      throw error;
    }
  }

  async queueCoursesSync(syncDto: SyncCoursesDto, options?: any) {
    try {
      const job = await this.syncQueue.add('courses', syncDto, {
        ...options,
        removeOnComplete: 10,
        removeOnFail: 5,
      });

      this.logger.log(`Courses sync job queued with ID: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error('Error queuing courses sync job:', error);
      throw error;
    }
  }

  async queueEnrollmentsSync(syncDto: SyncEnrollmentsDto, options?: any) {
    try {
      const job = await this.syncQueue.add('enrollments', syncDto, {
        ...options,
        removeOnComplete: 10,
        removeOnFail: 5,
      });

      this.logger.log(`Enrollments sync job queued with ID: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error('Error queuing enrollments sync job:', error);
      throw error;
    }
  }

  async queueAllSync(options?: any) {
    try {
      const job = await this.syncQueue.add('all', options, {
        removeOnComplete: 5,
        removeOnFail: 3,
      });

      this.logger.log(`All sync job queued with ID: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error('Error queuing all sync job:', error);
      throw error;
    }
  }

  /**
   * Webhook Jobs
   */
  async queueWebhookEvent(eventData: any, options?: any) {
    try {
      const job = await this.webhookQueue.add('event', eventData, {
        ...options,
        removeOnComplete: 20,
        removeOnFail: 10,
      });

      this.logger.log(`Webhook event job queued with ID: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error('Error queuing webhook event job:', error);
      throw error;
    }
  }

  /**
   * Report Jobs
   */
  async queueReportGeneration(reportData: any, options?: any) {
    try {
      const job = await this.reportQueue.add('generate', reportData, {
        ...options,
        removeOnComplete: 5,
        removeOnFail: 3,
      });

      this.logger.log(`Report generation job queued with ID: ${job.id}`);
      return job;
    } catch (error) {
      this.logger.error('Error queuing report generation job:', error);
      throw error;
    }
  }

  /**
   * Job Management
   */
  async getJobStatus(queueName: string, jobId: string) {
    try {
      let queue: Queue;

      switch (queueName) {
        case 'sync':
          queue = this.syncQueue;
          break;
        case 'webhook':
          queue = this.webhookQueue;
          break;
        case 'report':
          queue = this.reportQueue;
          break;
        default:
          throw new Error(`Unknown queue: ${queueName}`);
      }

      const job = await queue.getJob(jobId);

      if (!job) {
        return { status: 'not_found' };
      }

      return {
        id: job.id,
        name: job.name,
        data: job.data,
        progress: job.progress(),
        state: await job.getState(),
        processedOn: job.processedOn,
        finishedOn: job.finishedOn,
        failedReason: job.failedReason,
        returnvalue: job.returnvalue,
      };
    } catch (error) {
      this.logger.error('Error getting job status:', error);
      throw error;
    }
  }

  async getQueueStats(queueName: string) {
    try {
      let queue: Queue;

      switch (queueName) {
        case 'sync':
          queue = this.syncQueue;
          break;
        case 'webhook':
          queue = this.webhookQueue;
          break;
        case 'report':
          queue = this.reportQueue;
          break;
        default:
          throw new Error(`Unknown queue: ${queueName}`);
      }

      const [waiting, active, completed, failed, delayed] = await Promise.all([
        queue.getWaiting(),
        queue.getActive(),
        queue.getCompleted(),
        queue.getFailed(),
        queue.getDelayed(),
      ]);

      return {
        waiting: waiting.length,
        active: active.length,
        completed: completed.length,
        failed: failed.length,
        delayed: delayed.length,
        total: waiting.length + active.length + completed.length + failed.length + delayed.length,
      };
    } catch (error) {
      this.logger.error('Error getting queue stats:', error);
      throw error;
    }
  }

  async cancelJob(queueName: string, jobId: string) {
    try {
      let queue: Queue;

      switch (queueName) {
        case 'sync':
          queue = this.syncQueue;
          break;
        case 'webhook':
          queue = this.webhookQueue;
          break;
        case 'report':
          queue = this.reportQueue;
          break;
        default:
          throw new Error(`Unknown queue: ${queueName}`);
      }

      const job = await queue.getJob(jobId);

      if (!job) {
        throw new Error('Job not found');
      }

      await job.remove();
      this.logger.log(`Job ${jobId} cancelled from queue ${queueName}`);

      return { message: 'Job cancelled successfully' };
    } catch (error) {
      this.logger.error('Error cancelling job:', error);
      throw error;
    }
  }

  async clearQueue(queueName: string, status?: string) {
    try {
      let queue: Queue;

      switch (queueName) {
        case 'sync':
          queue = this.syncQueue;
          break;
        case 'webhook':
          queue = this.webhookQueue;
          break;
        case 'report':
          queue = this.reportQueue;
          break;
        default:
          throw new Error(`Unknown queue: ${queueName}`);
      }

      if (status) {
        await queue.clean(0, status as any);
      } else {
        await queue.empty();
      }

      this.logger.log(`Queue ${queueName} cleared (status: ${status || 'all'})`);

      return { message: `Queue ${queueName} cleared successfully` };
    } catch (error) {
      this.logger.error('Error clearing queue:', error);
      throw error;
    }
  }
}
