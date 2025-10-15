import { Module, Global, OnModuleInit } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { PermissionsService } from './permissions.service';
import { PermissionsGuard } from '../guards/permissions.guard';
import { RoleHierarchyGuard } from '../guards/role-hierarchy.guard';

/**
 * Módulo global de gerenciamento de permissões
 * Disponível em toda a aplicação sem precisar importar
 */
@Global()
@Module({
  imports: [SupabaseModule],
  providers: [PermissionsService, PermissionsGuard, RoleHierarchyGuard],
  exports: [PermissionsService, PermissionsGuard, RoleHierarchyGuard],
})
export class PermissionsModule implements OnModuleInit {
  constructor(private permissionsService: PermissionsService) {}

  async onModuleInit() {
    // Carregar permissões do banco ao inicializar
    await this.permissionsService.loadPermissions();
  }
}
