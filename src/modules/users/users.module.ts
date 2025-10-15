import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { PermissionsModule } from '../../common/permissions/permissions.module';
import { GuardsModule } from '../../common/guards/guards.module';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

/**
 * Módulo de gerenciamento de usuários usando Supabase
 */
@Module({
  imports: [SupabaseModule, PermissionsModule, GuardsModule],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
