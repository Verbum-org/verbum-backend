import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { SupabaseModule } from '../../supabase/supabase.module';
import { PermissionsModule } from '../../common/permissions/permissions.module';
import { GuardsModule } from '../../common/guards/guards.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';

/**
 * Módulo de autenticação usando Supabase Auth
 * Consolidado e simplificado - sem JWT local, sem MongoDB
 */
@Module({
  imports: [ConfigModule, SupabaseModule, PermissionsModule, GuardsModule],
  controllers: [AuthController],
  providers: [AuthService],
  exports: [AuthService],
})
export class AuthModule {}
