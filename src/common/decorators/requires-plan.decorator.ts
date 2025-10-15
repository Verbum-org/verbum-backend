import { SetMetadata } from '@nestjs/common';
import { PlanType } from '../plans/plan.types';

export const REQUIRED_PLANS_KEY = 'requiredPlans';

/**
 * Decorator para exigir que a organização tenha um dos planos especificados
 *
 * @param plans - Array de planos permitidos
 *
 * @example
 * ```typescript
 * @RequiresPlan([PlanType.PREMIUM, PlanType.ENTERPRISE])
 * @Get('advanced-reports')
 * async getAdvancedReports() {
 *   // Apenas organizações com plano Premium ou Enterprise
 * }
 * ```
 */
export const RequiresPlan = (plans: PlanType[]) => SetMetadata(REQUIRED_PLANS_KEY, plans);
