import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { PermissionsModule } from '../../common/permissions/permissions.module';
import { GuardsModule } from '../../common/guards/guards.module';
import { OrganizationsController } from './organizations.controller';
import { OrganizationsService } from './organizations.service';

/**
 * Módulo de gerenciamento de organizações
 */
@Module({
  imports: [SupabaseModule, PermissionsModule, GuardsModule],
  controllers: [OrganizationsController],
  providers: [OrganizationsService],
  exports: [OrganizationsService],
})
export class OrganizationsModule {}
