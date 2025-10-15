import { Module, Global } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { AuthGuard } from './auth.guard';

/**
 * Módulo global de guards de autenticação
 */
@Global()
@Module({
  imports: [SupabaseModule],
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class GuardsModule {}
