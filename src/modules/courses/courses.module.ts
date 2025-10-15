import { Module } from '@nestjs/common';
import { SupabaseModule } from '../../supabase/supabase.module';
import { PermissionsModule } from '../../common/permissions/permissions.module';
import { GuardsModule } from '../../common/guards/guards.module';
import { CoursesController } from './courses.controller';
import { CoursesService } from './courses.service';

/**
 * Módulo de gerenciamento de cursos usando Supabase
 */
@Module({
  imports: [SupabaseModule, PermissionsModule, GuardsModule],
  controllers: [CoursesController],
  providers: [CoursesService],
  exports: [CoursesService],
})
export class CoursesModule {}
