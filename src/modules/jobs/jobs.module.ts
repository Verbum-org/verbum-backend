import { BullModule } from '@nestjs/bull';
import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { GuardsModule } from '../../common/guards/guards.module';
import { MoodleAdapterModule } from '../moodle-adapter/moodle-adapter.module';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { ReportProcessor } from './processors/report.processor';
import { SyncProcessor } from './processors/sync.processor';
import { WebhookProcessor } from './processors/webhook.processor';

/**
 * Módulo de gerenciamento de jobs usando BullMQ + Supabase
 */
@Module({
  imports: [
    SupabaseModule,
    GuardsModule,
    BullModule.registerQueue({ name: 'sync' }, { name: 'webhook' }, { name: 'report' }),
    MoodleAdapterModule,
  ],
  controllers: [JobsController],
  providers: [JobsService, SyncProcessor, WebhookProcessor, ReportProcessor],
  exports: [JobsService],
})
export class JobsModule {}
