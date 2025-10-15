import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { UserRole } from '../plans/plan.types';
import { Permission } from './permission.types';

/**
 * Serviço de gerenciamento de permissões
 */
@Injectable()
export class PermissionsService {
  private readonly logger = new Logger(PermissionsService.name);
  private permissionsCache: Map<string, Permission> = new Map();

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Carrega permissões do banco
   */
  async loadPermissions(): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.from('user_permissions').select('*');

    if (error) {
      this.logger.error('Erro ao carregar permissões:', error);
      return;
    }

    this.permissionsCache.clear();
    data.forEach((perm) => {
      this.permissionsCache.set(perm.name, {
        name: perm.name,
        description: perm.description,
        category: perm.category,
        defaultRoles: perm.default_roles,
      });
    });

    this.logger.log(`${this.permissionsCache.size} permissões carregadas`);
  }

  /**
   * Verifica se um role tem uma permissão específica
   */
  hasPermission(role: UserRole, permissionName: string, customPermissions: string[] = []): boolean {
    // Verifica se tem permissão customizada
    if (customPermissions.includes(permissionName)) {
      return true;
    }

    // Verifica permissão padrão do role
    const permission = this.permissionsCache.get(permissionName);
    if (!permission) {
      this.logger.warn(`Permissão não encontrada: ${permissionName}`);
      return false;
    }

    return permission.defaultRoles.includes(role);
  }

  /**
   * Obtém todas as permissões de um role
   */
  getRolePermissions(role: UserRole, customPermissions: string[] = []): string[] {
    const defaultPerms = Array.from(this.permissionsCache.values())
      .filter((perm) => perm.defaultRoles.includes(role))
      .map((perm) => perm.name);

    // Adicionar permissões customizadas
    const allPerms = [...new Set([...defaultPerms, ...customPermissions])];

    return allPerms;
  }

  /**
   * Valida hierarquia de roles (quem pode criar quem)
   */
  canCreateRole(creatorRole: UserRole, targetRole: UserRole): boolean {
    const hierarchy: Record<UserRole, UserRole[]> = {
      [UserRole.ADMIN]: [
        UserRole.ADMIN,
        UserRole.DIRETORIA,
        UserRole.COORDENADOR,
        UserRole.PROFESSOR,
        UserRole.ALUNO,
      ],
      [UserRole.DIRETORIA]: [UserRole.COORDENADOR, UserRole.PROFESSOR, UserRole.ALUNO],
      [UserRole.COORDENADOR]: [UserRole.PROFESSOR, UserRole.ALUNO],
      [UserRole.PROFESSOR]: [UserRole.ALUNO],
      [UserRole.ALUNO]: [],
    };

    return hierarchy[creatorRole]?.includes(targetRole) || false;
  }

  /**
   * Valida se usuário pode editar outro usuário
   */
  canEditUser(editorRole: UserRole, targetRole: UserRole): boolean {
    // Admin pode editar todos
    if (editorRole === UserRole.ADMIN) {
      return true;
    }

    // Diretoria pode editar todos exceto admin
    if (editorRole === UserRole.DIRETORIA && targetRole !== UserRole.ADMIN) {
      return true;
    }

    // Coordenador pode editar professor e aluno
    if (
      editorRole === UserRole.COORDENADOR &&
      (targetRole === UserRole.PROFESSOR || targetRole === UserRole.ALUNO)
    ) {
      return true;
    }

    // Professor pode editar aluno
    if (editorRole === UserRole.PROFESSOR && targetRole === UserRole.ALUNO) {
      return true;
    }

    return false;
  }

  /**
   * Obtém nível hierárquico do role (quanto maior, mais poder)
   */
  getRoleLevel(role: UserRole): number {
    const levels: Record<UserRole, number> = {
      [UserRole.ADMIN]: 5,
      [UserRole.DIRETORIA]: 4,
      [UserRole.COORDENADOR]: 3,
      [UserRole.PROFESSOR]: 2,
      [UserRole.ALUNO]: 1,
    };

    return levels[role] || 0;
  }

  /**
   * Lista todas as permissões disponíveis
   */
  getAllPermissions(): Permission[] {
    return Array.from(this.permissionsCache.values());
  }

  /**
   * Obtém permissões por categoria
   */
  getPermissionsByCategory(category: string): Permission[] {
    return Array.from(this.permissionsCache.values()).filter((perm) => perm.category === category);
  }

  /**
   * Verifica se role pode acessar uma categoria de permissões
   */
  canAccessCategory(role: UserRole, category: string): boolean {
    const permissions = this.getPermissionsByCategory(category);
    return permissions.some((perm) => perm.defaultRoles.includes(role));
  }
}
