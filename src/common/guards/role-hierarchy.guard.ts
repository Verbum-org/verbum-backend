import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PermissionsService } from '../permissions/permissions.service';
import { UserRole } from '../plans/plan.types';

/**
 * Guard para validar hierarquia de roles ao criar/editar usuários
 * Migrado de modules/trial/guards/role-hierarchy.guard.ts
 *
 * Verifica se o usuário pode criar/editar um usuário com o role especificado
 */
@Injectable()
export class RoleHierarchyGuard implements CanActivate {
  constructor(private permissionsService: PermissionsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const targetRole = request.body?.role;

    if (!user || !targetRole) {
      return true; // Se não há role no body, deixar passar (outro validator vai pegar)
    }

    // Verificar se pode criar/editar este role
    const canCreate = this.permissionsService.canCreateRole(
      user.role as UserRole,
      targetRole as UserRole,
    );

    if (!canCreate) {
      throw new ForbiddenException(
        `Você (${user.role}) não tem permissão para criar/editar usuários com role ${targetRole}`,
      );
    }

    return true;
  }
}
