import { Module, Global } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { PlansService } from './plans.service';
import { PlanGuard } from '../guards/plan.guard';
import { FeatureGuard } from '../guards/feature.guard';
import { SubscriptionGuard } from '../guards/subscription.guard';

/**
 * Módulo global de gerenciamento de planos
 * Disponível em toda a aplicação sem precisar importar
 */
@Global()
@Module({
  imports: [SupabaseModule],
  providers: [PlansService, PlanGuard, FeatureGuard, SubscriptionGuard],
  exports: [PlansService, PlanGuard, FeatureGuard, SubscriptionGuard],
})
export class PlansModule {}
