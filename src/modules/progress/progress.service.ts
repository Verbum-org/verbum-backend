import { Injectable, Logger, NotFoundException, BadRequestException } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import {
  UpdateProgressDto,
  ProgressDto,
  CreateActivityLogDto,
  ActivityLogDto,
} from './dto/progress.dto';

/**
 * Serviço de gerenciamento de progresso de usuários
 */
@Injectable()
export class ProgressService {
  private readonly logger = new Logger(ProgressService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Obtém progresso do usuário em um curso
   */
  async getProgressByCourse(userId: string, courseId: string): Promise<ProgressDto[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Erro ao buscar progresso:', error);
      throw new BadRequestException('Erro ao buscar progresso');
    }

    return data.map((item) => this.mapToDto(item));
  }

  /**
   * Obtém progresso do usuário em um módulo específico
   */
  async getProgressByModule(
    userId: string,
    courseId: string,
    moduleId: string,
  ): Promise<ProgressDto | null> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('module_id', moduleId)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 = not found
      this.logger.error('Erro ao buscar progresso do módulo:', error);
      throw new BadRequestException('Erro ao buscar progresso do módulo');
    }

    return data ? this.mapToDto(data) : null;
  }

  /**
   * Atualiza progresso do usuário
   */
  async updateProgress(
    userId: string,
    courseId: string,
    moduleId: string | null,
    organizationId: string,
    updateDto: UpdateProgressDto,
  ): Promise<ProgressDto> {
    const supabase = this.supabaseService.getClient();

    // Verificar se já existe registro de progresso
    const { data: existing } = await supabase
      .from('user_progress')
      .select('*')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .eq('module_id', moduleId || '')
      .single();

    let data, error;

    if (existing) {
      // Atualizar existente
      const update = await supabase
        .from('user_progress')
        .update({
          progress: updateDto.progress,
          time_spent: updateDto.timeSpent ?? existing.time_spent,
          is_completed: updateDto.isCompleted ?? existing.is_completed,
          metadata: updateDto.metadata ?? existing.metadata,
          last_accessed_at: new Date().toISOString(),
        })
        .eq('id', existing.id)
        .select()
        .single();

      data = update.data;
      error = update.error;
    } else {
      // Criar novo
      const insert = await supabase
        .from('user_progress')
        .insert({
          user_id: userId,
          course_id: courseId,
          module_id: moduleId,
          organization_id: organizationId,
          progress: updateDto.progress,
          time_spent: updateDto.timeSpent || 0,
          is_completed: updateDto.isCompleted || false,
          metadata: updateDto.metadata || {},
          last_accessed_at: new Date().toISOString(),
        })
        .select()
        .single();

      data = insert.data;
      error = insert.error;
    }

    if (error) {
      this.logger.error('Erro ao atualizar progresso:', error);
      throw new BadRequestException('Erro ao atualizar progresso');
    }

    this.logger.log(`Progresso atualizado: user ${userId}, course ${courseId}`);
    return this.mapToDto(data);
  }

  /**
   * Registra atividade do usuário
   */
  async logActivity(
    userId: string,
    organizationId: string,
    createDto: CreateActivityLogDto,
    ipAddress?: string,
    userAgent?: string,
  ): Promise<ActivityLogDto> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('activity_logs')
      .insert({
        user_id: userId,
        course_id: createDto.courseId,
        module_id: createDto.moduleId,
        organization_id: organizationId,
        activity_type: createDto.activityType,
        action: createDto.action,
        metadata: createDto.metadata || {},
        ip_address: ipAddress,
        user_agent: userAgent,
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Erro ao registrar atividade:', error);
      throw new BadRequestException('Erro ao registrar atividade');
    }

    return this.mapActivityToDto(data);
  }

  /**
   * Obtém atividades recentes do usuário
   */
  async getRecentActivities(
    userId: string,
    limit = 50,
    courseId?: string,
  ): Promise<ActivityLogDto[]> {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('activity_logs')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (courseId) {
      query = query.eq('course_id', courseId);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error('Erro ao buscar atividades:', error);
      throw new BadRequestException('Erro ao buscar atividades');
    }

    return data.map((item) => this.mapActivityToDto(item));
  }

  /**
   * Obtém estatísticas de progresso do usuário
   */
  async getUserStats(userId: string, organizationId: string): Promise<any> {
    const supabase = this.supabaseService.getClient();

    // Total de cursos matriculados
    const { count: enrolledCourses } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'active');

    // Cursos completados
    const { count: completedCourses } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed');

    // Progresso médio
    const { data: progressData } = await supabase
      .from('user_progress')
      .select('progress')
      .eq('user_id', userId)
      .eq('organization_id', organizationId);

    const avgProgress =
      progressData && progressData.length > 0
        ? progressData.reduce((sum, item) => sum + item.progress, 0) / progressData.length
        : 0;

    // Tempo total gasto
    const { data: timeData } = await supabase
      .from('user_progress')
      .select('time_spent')
      .eq('user_id', userId)
      .eq('organization_id', organizationId);

    const totalTimeSpent =
      timeData && timeData.length > 0
        ? timeData.reduce((sum, item) => sum + item.time_spent, 0)
        : 0;

    return {
      enrolledCourses: enrolledCourses || 0,
      completedCourses: completedCourses || 0,
      averageProgress: Math.round(avgProgress * 100) / 100,
      totalTimeSpentHours: Math.round((totalTimeSpent / 3600) * 100) / 100,
    };
  }

  /**
   * Mapeia dados do banco para DTO
   */
  private mapToDto(data: any): ProgressDto {
    return {
      id: data.id,
      userId: data.user_id,
      courseId: data.course_id,
      organizationId: data.organization_id,
      moduleId: data.module_id,
      progress: data.progress,
      timeSpent: data.time_spent,
      isCompleted: data.is_completed,
      completedAt: data.completed_at,
      lastAccessedAt: data.last_accessed_at,
      metadata: data.metadata,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Mapeia activity log do banco para DTO
   */
  private mapActivityToDto(data: any): ActivityLogDto {
    return {
      id: data.id,
      userId: data.user_id,
      courseId: data.course_id,
      organizationId: data.organization_id,
      moduleId: data.module_id,
      activityType: data.activity_type,
      action: data.action,
      metadata: data.metadata,
      createdAt: data.created_at,
    };
  }
}
