import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SupabaseService } from '../../supabase/supabase.service';
import { PermissionsService } from '../../common/permissions/permissions.service';
import { RegisterDto, LoginDto, AuthResponseDto, InviteUserDto } from './dto/auth.dto';
import { UserRole } from '../../common/plans/plan.types';

/**
 * Serviço de autenticação consolidado usando Supabase Auth
 */
@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly supabaseService: SupabaseService,
    private readonly configService: ConfigService,
    private readonly permissionsService: PermissionsService,
  ) {}

  /**
   * Registra um novo trial completo (trial_account + organization + admin user)
   */
  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const supabase = this.supabaseService.getClient();
    const adminClient = this.supabaseService.getAdminClient();

    try {
      // 1. Criar usuário no Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: registerDto.user.email,
        password: registerDto.user.password,
      });

      if (authError) {
        this.logger.error('Erro no Supabase Auth signUp:', authError);
        if (authError.message.includes('already registered')) {
          throw new ConflictException('Usuário já existe');
        }
        throw new BadRequestException(authError.message);
      }

      if (!authData.user) {
        throw new BadRequestException('Falha ao criar usuário');
      }

      this.logger.log(`Usuário auth criado: ${authData.user.id}`);

      // 2. Criar trial_account
      const trialDays = this.configService.get<number>('trial.durationDays', 7);
      const trialStartsAt = new Date();
      const trialEndsAt = new Date();
      trialEndsAt.setDate(trialEndsAt.getDate() + trialDays);

      const { data: trialAccount, error: trialAccountError } = await supabase
        .from('trial_accounts')
        .insert({
          company_name: registerDto.organization.name,
          trial_starts_at: trialStartsAt.toISOString(),
          trial_ends_at: trialEndsAt.toISOString(),
        })
        .select()
        .single();

      if (trialAccountError) {
        this.logger.error('Erro ao criar trial_account:', trialAccountError);
        await adminClient.auth.admin.deleteUser(authData.user.id);
        throw new BadRequestException('Erro ao criar conta trial');
      }

      this.logger.log(`Trial account criado: ${trialAccount.id}`);

      // 3. Criar organization
      const { data: organization, error: orgError } = await supabase
        .from('organizations')
        .insert({
          trial_account_id: trialAccount.id,
          name: registerDto.organization.name,
          description: registerDto.organization.description,
        })
        .select()
        .single();

      if (orgError) {
        this.logger.error('Erro ao criar organization:', orgError);
        await adminClient.auth.admin.deleteUser(authData.user.id);
        throw new BadRequestException('Erro ao criar organização');
      }

      this.logger.log(`Organization criada: ${organization.id}`);

      // 4. Criar user (admin/owner)
      const { data: user, error: userError } = await supabase
        .from('users')
        .insert({
          organization_id: organization.id,
          trial_account_id: trialAccount.id,
          auth_user_id: authData.user.id,
          email: registerDto.user.email,
          first_name: registerDto.user.firstName,
          last_name: registerDto.user.lastName,
          phone: registerDto.user.phone,
          role: UserRole.ADMIN,
          is_trial_owner: true,
          is_active: true,
          email_verified: authData.user.email_confirmed_at ? true : false,
        })
        .select()
        .single();

      if (userError) {
        this.logger.error('Erro ao criar user:', userError);
        await adminClient.auth.admin.deleteUser(authData.user.id);
        throw new BadRequestException('Erro ao criar usuário');
      }

      this.logger.log(`User criado: ${user.email}`);

      // 5. Atualizar trial_account com owner_user_id
      await supabase
        .from('trial_accounts')
        .update({ owner_user_id: user.id })
        .eq('id', trialAccount.id);

      // 6. Retornar tokens e dados completos
      return this.buildAuthResponse(authData.session, user, organization, trialAccount);
    } catch (error) {
      if (
        error instanceof ConflictException ||
        error instanceof BadRequestException ||
        error instanceof UnauthorizedException
      ) {
        throw error;
      }
      this.logger.error('Erro no registro:', error);
      throw new BadRequestException('Erro ao registrar');
    }
  }

  /**
   * Login de usuário
   */
  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const supabase = this.supabaseService.getClient();

    try {
      // 1. Autenticar via Supabase Auth
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email: loginDto.email,
        password: loginDto.password,
      });

      if (authError || !authData.user || !authData.session) {
        throw new UnauthorizedException('Credenciais inválidas');
      }

      // 2. Buscar dados do user
      const { data: user, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', authData.user.id)
        .single();

      if (userError || !user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      // 3. Verificar se está ativo
      if (!user.is_active) {
        throw new UnauthorizedException('Conta inativa');
      }

      // 4. Buscar trial_account
      const { data: trialAccount } = await supabase
        .from('trial_accounts')
        .select('*')
        .eq('id', user.trial_account_id)
        .single();

      // 5. Verificar se trial expirou
      if (trialAccount) {
        const now = new Date();
        const trialEndsAt = new Date(trialAccount.trial_ends_at);

        if (now > trialEndsAt || trialAccount.is_expired) {
          if (!trialAccount.is_expired) {
            await supabase
              .from('trial_accounts')
              .update({ is_expired: true, status: 'expired' })
              .eq('id', trialAccount.id);
          }
          throw new UnauthorizedException('Período expirado. Entre em contato conosco.');
        }
      }

      // 6. Buscar organization
      const { data: organization } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', user.organization_id)
        .single();

      // 7. Atualizar last_login_at
      await supabase
        .from('users')
        .update({ last_login_at: new Date().toISOString() })
        .eq('id', user.id);

      this.logger.log(`User logado: ${user.email}`);

      // 8. Retornar dados completos
      return this.buildAuthResponse(authData.session, user, organization, trialAccount);
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      this.logger.error('Erro no login:', error);
      throw new UnauthorizedException('Erro ao fazer login');
    }
  }

  /**
   * Refresh token
   */
  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    const supabase = this.supabaseService.getClient();

    try {
      const { data, error } = await supabase.auth.refreshSession({
        refresh_token: refreshToken,
      });

      if (error || !data.session) {
        throw new UnauthorizedException('Token inválido');
      }

      // Buscar dados do usuário
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('auth_user_id', data.user?.id)
        .single();

      if (!user) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      const { data: organization } = await supabase
        .from('organizations')
        .select('*')
        .eq('id', user.organization_id)
        .single();

      const { data: trialAccount } = await supabase
        .from('trial_accounts')
        .select('*')
        .eq('id', user.trial_account_id)
        .single();

      return this.buildAuthResponse(data.session, user, organization, trialAccount);
    } catch (error) {
      throw new UnauthorizedException('Token inválido');
    }
  }

  /**
   * Obtém perfil do usuário autenticado
   */
  async getProfile(authUserId: string): Promise<any> {
    const supabase = this.supabaseService.getClient();

    const { data: user, error } = await supabase
      .from('users')
      .select('*, organization:organizations(*), trial_account:trial_accounts(*)')
      .eq('auth_user_id', authUserId)
      .single();

    if (error || !user) {
      throw new UnauthorizedException('Usuário não encontrado');
    }

    return {
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      fullName: user.full_name,
      phone: user.phone,
      avatarUrl: user.avatar_url,
      role: user.role,
      organizationId: user.organization_id,
      trialAccountId: user.trial_account_id,
      isTrialOwner: user.is_trial_owner,
      isActive: user.is_active,
      emailVerified: user.email_verified,
      customPermissions: user.custom_permissions || [],
      department: user.department,
      course: user.course,
      grade: user.grade,
      lastLoginAt: user.last_login_at,
      createdAt: user.created_at,
      updatedAt: user.updated_at,
      organization: user.organization,
      trialAccount: user.trial_account,
    };
  }

  /**
   * Convida/cria novo usuário
   */
  async inviteUser(
    creatorAuthUserId: string,
    inviteDto: InviteUserDto,
  ): Promise<{ user: any; inviteUrl: string }> {
    const supabase = this.supabaseService.getClient();
    const adminClient = this.supabaseService.getAdminClient();

    // 1. Buscar usuário criador
    const { data: creator } = await supabase
      .from('users')
      .select('*')
      .eq('auth_user_id', creatorAuthUserId)
      .single();

    if (!creator) {
      throw new UnauthorizedException('Criador não encontrado');
    }

    // 2. Validar hierarquia
    const canCreate = this.permissionsService.canCreateRole(creator.role, inviteDto.role);
    if (!canCreate) {
      throw new ForbiddenException(
        `Você (${creator.role}) não pode criar usuários com role ${inviteDto.role}`,
      );
    }

    // 3. Criar usuário no Supabase Auth (via Admin API)
    const tempPassword = this.generateTempPassword();

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: inviteDto.email,
      password: tempPassword,
      email_confirm: false,
    });

    if (authError) {
      this.logger.error('Erro ao criar auth user:', authError);
      if (authError.message.includes('already registered')) {
        throw new ConflictException('Email já está em uso');
      }
      throw new BadRequestException('Erro ao criar usuário');
    }

    // 4. Criar usuário na tabela users
    const { data: user, error: userError } = await supabase
      .from('users')
      .insert({
        organization_id: creator.organization_id,
        trial_account_id: creator.trial_account_id,
        auth_user_id: authData.user.id,
        email: inviteDto.email,
        first_name: inviteDto.firstName,
        last_name: inviteDto.lastName,
        phone: inviteDto.phone,
        role: inviteDto.role,
        created_by_id: creator.id,
        custom_permissions: inviteDto.customPermissions,
        department: inviteDto.department,
        course: inviteDto.course,
        grade: inviteDto.grade,
        invited_at: new Date().toISOString(),
      })
      .select()
      .single();

    if (userError) {
      this.logger.error('Erro ao criar user:', userError);
      await adminClient.auth.admin.deleteUser(authData.user.id);
      throw new BadRequestException('Erro ao criar usuário');
    }

    this.logger.log(`Usuário convidado: ${user.email} (role: ${user.role})`);

    // 5. TODO: Enviar email de convite
    const frontendUrl = this.configService.get<string>('FRONTEND_URL', 'http://localhost:3000');
    const inviteUrl = `${frontendUrl}/auth/setup-password?email=${user.email}`;

    return {
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        role: user.role,
        organizationId: user.organization_id,
        createdAt: user.created_at,
      },
      inviteUrl,
    };
  }

  /**
   * Logout
   */
  async logout(): Promise<{ message: string }> {
    const supabase = this.supabaseService.getClient();

    try {
      await supabase.auth.signOut();
      return { message: 'Logout realizado com sucesso' };
    } catch (error) {
      this.logger.error('Erro no logout:', error);
      return { message: 'Logout realizado' };
    }
  }

  /**
   * Gera senha temporária
   */
  private generateTempPassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%';
    let password = '';
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  /**
   * Constrói resposta de autenticação padronizada
   */
  private buildAuthResponse(
    session: any,
    user: any,
    organization: any,
    trialAccount: any,
  ): AuthResponseDto {
    const now = new Date();
    const trialEndsAt = trialAccount ? new Date(trialAccount.trial_ends_at) : null;
    const daysRemaining = trialEndsAt
      ? Math.max(0, Math.ceil((trialEndsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
      : 0;

    return {
      accessToken: session.access_token,
      refreshToken: session.refresh_token,
      tokenType: 'Bearer',
      expiresIn: session.expires_in,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        fullName: user.full_name || `${user.first_name} ${user.last_name}`,
        role: user.role,
        organizationId: user.organization_id,
        trialAccountId: user.trial_account_id,
        isTrialOwner: user.is_trial_owner,
        isActive: user.is_active,
        emailVerified: user.email_verified,
        createdAt: user.created_at,
      },
      organization: {
        id: organization.id,
        name: organization.name,
        slug: organization.slug,
        isActive: organization.is_active,
        createdAt: organization.created_at,
      },
      trialAccount: trialAccount
        ? {
            id: trialAccount.id,
            companyName: trialAccount.company_name,
            trialStartsAt: trialAccount.trial_starts_at,
            trialEndsAt: trialAccount.trial_ends_at,
            status: trialAccount.status,
            plan: trialAccount.plan,
            isExpired: trialAccount.is_expired,
            daysRemaining,
            createdAt: trialAccount.created_at,
          }
        : undefined,
    };
  }

  // Legacy methods for backward compatibility
  async handleOAuth2Callback(dto: any): Promise<any> {
    throw new BadRequestException('OAuth2 não implementado nesta versão');
  }

  async handleLTILaunch(dto: any): Promise<any> {
    throw new BadRequestException('LTI não implementado nesta versão');
  }

  async syncWithMoodle(userId: string): Promise<any> {
    throw new BadRequestException('Moodle sync será implementado no MoodleAdapterModule');
  }
}
