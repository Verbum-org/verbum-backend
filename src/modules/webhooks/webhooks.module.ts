import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { GuardsModule } from '../../common/guards/guards.module';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

/**
 * Módulo de gerenciamento de webhooks usando Supabase
 */
@Module({
  imports: [SupabaseModule, GuardsModule],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [WebhooksService],
})
export class WebhooksModule {}
