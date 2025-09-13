import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Job, JobSchema } from '../../schemas/job.schema';
import { MoodleAdapterModule } from '../moodle-adapter/moodle-adapter.module';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { ReportProcessor } from './processors/report.processor';
import { SyncProcessor } from './processors/sync.processor';
import { WebhookProcessor } from './processors/webhook.processor';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Job.name, schema: JobSchema }]),
    BullModule.registerQueue({ name: 'sync' }, { name: 'webhook' }, { name: 'report' }),
    MoodleAdapterModule,
  ],
  controllers: [JobsController],
  providers: [JobsService, SyncProcessor, WebhookProcessor, ReportProcessor],
  exports: [JobsService],
})
export class JobsModule {}
