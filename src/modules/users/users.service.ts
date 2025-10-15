import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { PermissionsService } from '../../common/permissions/permissions.service';
import { UserRole } from '../../common/plans/plan.types';
import { UserDto, UpdateUserDto } from './dto/user.dto';

/**
 * Serviço de gerenciamento de usuários
 */
@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly permissionsService: PermissionsService,
  ) {}

  /**
   * Lista usuários da organização
   */
  async findAll(organizationId: string): Promise<UserDto[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('organization_id', organizationId)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Erro ao listar usuários:', error);
      throw new BadRequestException('Erro ao listar usuários');
    }

    return data.map((user) => this.mapToDto(user));
  }

  /**
   * Busca usuário por ID
   */
  async findOne(id: string): Promise<UserDto> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase.from('users').select('*').eq('id', id).single();

    if (error || !data) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.mapToDto(data);
  }

  /**
   * Busca usuário por auth_user_id (Supabase Auth ID)
   */
  async findByAuthId(authUserId: string): Promise<UserDto> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', authUserId)
      .single();

    if (error || !data) {
      throw new NotFoundException('Usuário não encontrado');
    }

    return this.mapToDto(data);
  }

  /**
   * Atualiza usuário
   */
  async update(id: string, updateDto: UpdateUserDto, editorAuthUserId: string): Promise<UserDto> {
    const supabase = this.supabaseService.getClient();

    // 1. Buscar usuário que está editando
    const { data: editor } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', editorAuthUserId)
      .single();

    if (!editor) {
      throw new ForbiddenException('Editor não encontrado');
    }

    // 2. Buscar usuário alvo
    const { data: targetUser } = await supabase.from('users').select('*').eq('id', id).single();

    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // 3. Validar se pode editar
    const canEdit = this.permissionsService.canEditUser(editor.role, targetUser.role);
    if (!canEdit) {
      throw new ForbiddenException('Você não tem permissão para editar este usuário');
    }

    // 4. Se está mudando role, validar hierarquia
    if (updateDto.role && updateDto.role !== targetUser.role) {
      const canChangeRole = this.permissionsService.canCreateRole(editor.role, updateDto.role);
      if (!canChangeRole) {
        throw new ForbiddenException(
          `Você não tem permissão para atribuir o role ${updateDto.role}`,
        );
      }
    }

    // 5. Atualizar usuário
    const { data: updatedUser, error } = await supabase
      .from('users')
      .update({
        first_name: updateDto.firstName,
        last_name: updateDto.lastName,
        phone: updateDto.phone,
        avatar_url: updateDto.avatarUrl,
        role: updateDto.role,
        custom_permissions: updateDto.customPermissions,
        department: updateDto.department,
        course: updateDto.course,
        grade: updateDto.grade,
        is_active: updateDto.isActive,
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Erro ao atualizar usuário:', error);
      throw new BadRequestException('Erro ao atualizar usuário');
    }

    this.logger.log(`Usuário atualizado: ${updatedUser.email}`);
    return this.mapToDto(updatedUser);
  }

  /**
   * Desativa usuário (soft delete)
   */
  async deactivate(id: string, editorAuthUserId: string): Promise<void> {
    const supabase = this.supabaseService.getClient();

    // 1. Buscar usuário que está editando
    const { data: editor } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', editorAuthUserId)
      .single();

    if (!editor) {
      throw new ForbiddenException('Editor não encontrado');
    }

    // 2. Buscar usuário alvo
    const { data: targetUser } = await supabase.from('users').select('*').eq('id', id).single();

    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    // 3. Não pode desativar a si mesmo
    if (targetUser.auth_user_id === editorAuthUserId) {
      throw new BadRequestException('Você não pode desativar sua própria conta');
    }

    // 4. Não pode desativar o owner do trial
    if (targetUser.is_trial_owner) {
      throw new BadRequestException('Não é possível desativar o dono da conta');
    }

    // 5. Validar se pode editar
    const canEdit = this.permissionsService.canEditUser(editor.role, targetUser.role);
    if (!canEdit) {
      throw new ForbiddenException('Você não tem permissão para desativar este usuário');
    }

    // 6. Desativar
    const { error } = await supabase.from('users').update({ is_active: false }).eq('id', id);

    if (error) {
      this.logger.error('Erro ao desativar usuário:', error);
      throw new BadRequestException('Erro ao desativar usuário');
    }

    this.logger.log(`Usuário desativado: ${targetUser.email}`);
  }

  /**
   * Reativa usuário
   */
  async reactivate(id: string, editorAuthUserId: string): Promise<UserDto> {
    const supabase = this.supabaseService.getClient();

    // Validações similares ao deactivate
    const { data: editor } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', editorAuthUserId)
      .single();

    if (!editor) {
      throw new ForbiddenException('Editor não encontrado');
    }

    const { data: targetUser } = await supabase.from('users').select('*').eq('id', id).single();

    if (!targetUser) {
      throw new NotFoundException('Usuário não encontrado');
    }

    const canEdit = this.permissionsService.canEditUser(editor.role, targetUser.role);
    if (!canEdit) {
      throw new ForbiddenException('Você não tem permissão para reativar este usuário');
    }

    const { data: reactivatedUser, error } = await supabase
      .from('users')
      .update({ is_active: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      this.logger.error('Erro ao reativar usuário:', error);
      throw new BadRequestException('Erro ao reativar usuário');
    }

    this.logger.log(`Usuário reativado: ${reactivatedUser.email}`);
    return this.mapToDto(reactivatedUser);
  }

  /**
   * Lista usuários por role
   */
  async findByRole(organizationId: string, role: UserRole): Promise<UserDto[]> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('users')
      .select('*')
      .eq('organization_id', organizationId)
      .eq('role', role)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) {
      this.logger.error('Erro ao listar usuários por role:', error);
      throw new BadRequestException('Erro ao listar usuários');
    }

    return data.map((user) => this.mapToDto(user));
  }

  /**
   * Mapeia dados do banco para DTO
   */
  private mapToDto(user: any): UserDto {
    return {
      id: user.id,
      organizationId: user.organization_id,
      trialAccountId: user.trial_account_id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      fullName: user.full_name || `${user.first_name} ${user.last_name}`,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      role: user.role,
      isTrialOwner: user.is_trial_owner,
      createdById: user.created_by_id,
      customPermissions: user.custom_permissions || [],
      department: user.department,
      course: user.course,
      grade: user.grade,
      isActive: user.is_active,
      emailVerified: user.email_verified,
      lastLoginAt: user.last_login_at,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
    };
  }
}
