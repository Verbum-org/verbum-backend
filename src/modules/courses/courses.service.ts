import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { CreateCourseDto, UpdateCourseDto, CourseDto, EnrollmentDto } from './dto/course.dto';

/**
 * Serviço de gerenciamento de cursos
 */
@Injectable()
export class CoursesService {
  private readonly logger = new Logger(CoursesService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Cria novo curso
   */
  async create(organizationId: string, createDto: CreateCourseDto): Promise<CourseDto> {
    const supabase = this.supabaseService.getClient();

    // Verificar se já existe curso com mesmo short_name
    const { data: existing } = await supabase
      .from('courses')
      .select('id')
      .eq('organization_id', organizationId)
      .eq('short_name', createDto.shortName)
      .single();

    if (existing) {
      throw new ConflictException(`Curso com código ${createDto.shortName} já existe`);
    }

    const { data, error } = await supabase
      .from('courses')
      .insert({
        organization_id: organizationId,
        name: createDto.name,
        short_name: createDto.shortName,
        description: createDto.description,
        image_url: createDto.imageUrl,
        is_active: createDto.isActive ?? true,
        moodle_id: createDto.moodleId,
        modules: createDto.modules || [],
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Erro ao criar curso:', error);
      throw new BadRequestException('Erro ao criar curso');
    }

    this.logger.log(`Curso criado: ${data.name}`);
    return this.mapToDto(data);
  }

  /**
   * Lista cursos da organização
   */
  async findAll(organizationId: string, includeInactive = false): Promise<CourseDto[]> {
    const supabase = this.supabaseService.getClient();

    let query = supabase
      .from('courses')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (!includeInactive) {
      query = query.eq('is_active', true);
    }

    const { data, error } = await query;

    if (error) {
      this.logger.error('Erro ao listar cursos:', error);
      throw new BadRequestException('Erro ao listar cursos');
    }

    return data.map((course) => this.mapToDto(course));
  }

  /**
   * Busca curso por ID
   */
  async findOne(id: string): Promise<CourseDto> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.from('courses').select('*').eq('id', id).single();

    if (error || !data) {
      throw new NotFoundException('Curso não encontrado');
    }

    return this.mapToDto(data);
  }

  /**
   * Busca curso por short_name
   */
  async findByShortName(organizationId: string, shortName: string): Promise<CourseDto> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('courses')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('short_name', shortName)
      .single();

    if (error || !data) {
      throw new NotFoundException('Curso não encontrado');
    }

    return this.mapToDto(data);
  }

  /**
   * Atualiza curso
   */
  async update(id: string, updateDto: UpdateCourseDto): Promise<CourseDto> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('courses')
      .update({
        name: updateDto.name,
        short_name: updateDto.shortName,
        description: updateDto.description,
        image_url: updateDto.imageUrl,
        is_active: updateDto.isActive,
        modules: updateDto.modules,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Erro ao atualizar curso:', error);
      throw new BadRequestException('Erro ao atualizar curso');
    }

    if (!data) {
      throw new NotFoundException('Curso não encontrado');
    }

    this.logger.log(`Curso atualizado: ${data.name}`);
    return this.mapToDto(data);
  }

  /**
   * Desativa curso (soft delete)
   */
  async deactivate(id: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase.from('courses').update({ is_active: false }).eq('id', id);

    if (error) {
      this.logger.error('Erro ao desativar curso:', error);
      throw new BadRequestException('Erro ao desativar curso');
    }

    this.logger.log(`Curso desativado: ${id}`);
  }

  /**
   * Matricula usuário em curso
   */
  async enrollUser(
    userId: string,
    courseId: string,
    organizationId: string,
  ): Promise<EnrollmentDto> {
    const supabase = this.supabaseService.getClient();

    // Verificar se já está matriculado
    const { data: existing } = await supabase
      .from('enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single();

    if (existing) {
      throw new ConflictException('Usuário já está matriculado neste curso');
    }

    const { data, error } = await supabase
      .from('enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        organization_id: organizationId,
        status: 'active',
        enrolled_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (error) {
      this.logger.error('Erro ao matricular usuário:', error);
      throw new BadRequestException('Erro ao matricular usuário');
    }

    this.logger.log(`Usuário ${userId} matriculado no curso ${courseId}`);
    return this.mapEnrollmentToDto(data);
  }

  /**
   * Remove matrícula de usuário
   */
  async unenrollUser(userId: string, courseId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    const { error } = await supabase
      .from('enrollments')
      .update({ status: 'cancelled' })
      .eq('user_id', userId)
      .eq('course_id', courseId);

    if (error) {
      this.logger.error('Erro ao cancelar matrícula:', error);
      throw new BadRequestException('Erro ao cancelar matrícula');
    }

    this.logger.log(`Matrícula cancelada: user ${userId}, course ${courseId}`);
  }

  /**
   * Lista matrículas de um curso
   */
  async getEnrollmentsByCourse(courseId: string): Promise<EnrollmentDto[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('enrollments')
      .select('*')
      .eq('course_id', courseId)
      .order('enrolled_at', { ascending: false });

    if (error) {
      this.logger.error('Erro ao listar matrículas:', error);
      throw new BadRequestException('Erro ao listar matrículas');
    }

    return data.map((enrollment) => this.mapEnrollmentToDto(enrollment));
  }

  /**
   * Lista cursos de um usuário
   */
  async getCoursesByUser(userId: string): Promise<CourseDto[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('enrollments')
      .select('course:courses(*)')
      .eq('user_id', userId)
      .eq('status', 'active');

    if (error) {
      this.logger.error('Erro ao listar cursos do usuário:', error);
      throw new BadRequestException('Erro ao listar cursos do usuário');
    }

    return data.map((item: any) => this.mapToDto(item.course));
  }

  /**
   * Mapeia dados do banco para DTO
   */
  private mapToDto(data: any): CourseDto {
    return {
      id: data.id,
      organizationId: data.organization_id,
      name: data.name,
      shortName: data.short_name,
      description: data.description,
      imageUrl: data.image_url,
      isActive: data.is_active,
      moodleId: data.moodle_id,
      moodleShortName: data.moodle_short_name,
      moodleFullName: data.moodle_full_name,
      modules: data.modules || [],
      createdAt: data.created_at,
      updatedAt: data.updated_at,
    };
  }

  /**
   * Mapeia enrollment do banco para DTO
   */
  private mapEnrollmentToDto(data: any): EnrollmentDto {
    return {
      id: data.id,
      userId: data.user_id,
      courseId: data.course_id,
      organizationId: data.organization_id,
      status: data.status,
      enrolledAt: data.enrolled_at,
      completedAt: data.completed_at,
      createdAt: data.created_at,
    };
  }
}
