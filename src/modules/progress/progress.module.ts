import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { PermissionsModule } from '../../common/permissions/permissions.module';
import { GuardsModule } from '../../common/guards/guards.module';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

/**
 * Módulo de gerenciamento de progresso usando Supabase
 */
@Module({
  imports: [SupabaseModule, PermissionsModule, GuardsModule],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [ProgressService],
})
export class ProgressModule {}
