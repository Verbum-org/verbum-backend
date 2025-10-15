import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PermissionsService } from '../permissions/permissions.service';
import { PERMISSIONS_KEY } from '../decorators/requires-permission.decorator';
import { ROLES_KEY } from '../decorators/requires-role.decorator';
import { UserRole } from '../plans/plan.types';

/**
 * Guard para validar permissões e roles
 * Migrado de modules/trial/guards/permissions.guard.ts
 */
@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private permissionsService: PermissionsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Obter permissões e roles requeridos do metadata
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(PERMISSIONS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(ROLES_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se não tem requisitos, permitir acesso
    if (!requiredPermissions && !requiredRoles) {
      return true;
    }

    // Obter usuário do request (já foi injetado pelo AuthGuard)
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      throw new ForbiddenException('Usuário não autenticado');
    }

    // Verificar roles
    if (requiredRoles && requiredRoles.length > 0) {
      const hasRole = requiredRoles.includes(user.role as UserRole);
      if (!hasRole) {
        throw new ForbiddenException(
          `Acesso negado. Roles permitidos: ${requiredRoles.join(', ')}`,
        );
      }
    }

    // Verificar permissões
    if (requiredPermissions && requiredPermissions.length > 0) {
      const hasAnyPermission = requiredPermissions.some((permission) =>
        this.permissionsService.hasPermission(
          user.role as UserRole,
          permission,
          user.custom_permissions || [],
        ),
      );

      if (!hasAnyPermission) {
        throw new ForbiddenException(
          `Acesso negado. Permissões necessárias: ${requiredPermissions.join(' ou ')}`,
        );
      }
    }

    return true;
  }
}
