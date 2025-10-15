import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../plans/plan.types';

export const ROLES_KEY = 'roles';

/**
 * Decorator para exigir roles específicos
 * Migrado de modules/trial/decorators
 *
 * @param roles - Array de roles permitidos (OR logic)
 *
 * @example
 * ```typescript
 * @RequiresRole(UserRole.ADMIN, UserRole.DIRETORIA)
 * @Delete(':id')
 * async deleteUser() {
 *   // Apenas admin ou diretoria podem deletar
 * }
 * ```
 */
export const RequiresRole = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
