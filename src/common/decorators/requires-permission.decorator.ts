import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';

/**
 * Decorator para exigir permissões específicas
 * Migrado de modules/trial/decorators
 *
 * @param permissions - Array de permissões necessárias (OR logic - precisa de pelo menos uma)
 *
 * @example
 * ```typescript
 * @RequiresPermission(['users:edit', 'users:delete'])
 * @Put(':id')
 * async updateUser() {
 *   // Usuário precisa ter permissão users:edit OU users:delete
 * }
 * ```
 */
export const RequiresPermission = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);
