import {
  Injectable,
  Logger,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import { UpdateOrganizationDto, OrganizationDto } from './dto/organization.dto';
import { UserRole } from '../../common/plans/plan.types';

/**
 * Serviço de gerenciamento de organizações
 */
@Injectable()
export class OrganizationsService {
  private readonly logger = new Logger(OrganizationsService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Busca organização por ID
   */
  async findOne(id: string): Promise<OrganizationDto> {
    const supabase = this.supabaseService.getClient();

    const { data, error } = await supabase
      .from('organizations')
      .select('*, trial_account:trial_accounts(*)')
      .eq('id', id)
      .single();

    if (error || !data) {
      throw new NotFoundException('Organização não encontrada');
    }

    return this.mapToDto(data);
  }

  /**
   * Atualiza organização
   */
  async update(
    id: string,
    updateDto: UpdateOrganizationDto,
    userRole: UserRole,
  ): Promise<OrganizationDto> {
    const supabase = this.supabaseService.getClient();

    // Apenas admin e diretoria podem atualizar
    if (userRole !== UserRole.ADMIN && userRole !== UserRole.DIRETORIA) {
      throw new ForbiddenException('Você não tem permissão para atualizar a organização');
    }

    const { data, error } = await supabase
      .from('organizations')
      .update({
        name: updateDto.name,
        description: updateDto.description,
        email: updateDto.email,
        phone: updateDto.phone,
        website: updateDto.website,
        address: updateDto.address,
        logo_url: updateDto.logoUrl,
        brand_colors: updateDto.brandColors,
        settings: updateDto.settings,
        is_active: updateDto.isActive,
      })
      .eq('id', id)
      .select('*, trial_account:trial_accounts(*)')
      .single();

    if (error) {
      this.logger.error('Erro ao atualizar organização:', error);
      throw new BadRequestException('Erro ao atualizar organização');
    }

    if (!data) {
      throw new NotFoundException('Organização não encontrada');
    }

    this.logger.log(`Organização atualizada: ${data.name}`);
    return this.mapToDto(data);
  }

  /**
   * Obtém estatísticas da organização
   */
  async getStats(organizationId: string): Promise<any> {
    const supabase = this.supabaseService.getClient();

    // Total de usuários
    const { count: totalUsers } = await supabase
      .from('users')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    // Total de cursos
    const { count: totalCourses } = await supabase
      .from('courses')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    // Total de matrículas ativas
    const { count: activeEnrollments } = await supabase
      .from('enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('organization_id', organizationId)
      .eq('status', 'active');

    // Distribuição de usuários por role
    const { data: usersByRole } = await supabase
      .from('users')
      .select('role')
      .eq('organization_id', organizationId)
      .eq('is_active', true);

    const roleDistribution = (usersByRole || []).reduce((acc: any, user: any) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {});

    return {
      totalUsers: totalUsers || 0,
      totalCourses: totalCourses || 0,
      activeEnrollments: activeEnrollments || 0,
      roleDistribution,
    };
  }

  /**
   * Mapeia dados do banco para DTO
   */
  private mapToDto(data: any): OrganizationDto {
    const trialAccount = data.trial_account;
    let planInfo = undefined;

    if (trialAccount) {
      const now = new Date();
      const trialEndsAt = new Date(trialAccount.trial_ends_at);
      const daysRemaining = Math.max(
        0,
        Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)),
      );

      planInfo = {
        type: trialAccount.plan,
        status: trialAccount.status,
        isExpired: trialAccount.is_expired,
        trialEndsAt: trialAccount.trial_ends_at,
        daysRemaining,
      };
    }

    return {
      id: data.id,
      trialAccountId: data.trial_account_id,
      name: data.name,
      slug: data.slug,
      description: data.description,
      email: data.email,
      phone: data.phone,
      website: data.website,
      address: data.address,
      logoUrl: data.logo_url,
      brandColors: data.brand_colors || { primary: '#000000', secondary: '#ffffff' },
      settings: data.settings || {},
      isActive: data.is_active,
      createdAt: data.created_at,
      updatedAt: data.updated_at,
      plan: planInfo,
    };
  }
}
