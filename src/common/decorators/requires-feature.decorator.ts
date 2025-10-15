import { SetMetadata } from '@nestjs/common';
import { Feature } from '../plans/plan.types';

export const REQUIRED_FEATURE_KEY = 'requiredFeature';

/**
 * Decorator para exigir que a organização tenha acesso a uma feature específica
 *
 * @param feature - Feature requerida
 *
 * @example
 * ```typescript
 * @RequiresFeature(Feature.MOODLE_INTEGRATION)
 * @Post('sync-moodle')
 * async syncWithMoodle() {
 *   // Apenas organizações com feature moodle habilitada
 * }
 * ```
 */
export const RequiresFeature = (feature: Feature) => SetMetadata(REQUIRED_FEATURE_KEY, feature);
