import { Injectable, Logger } from '@nestjs/common';
import { SupabaseService } from '../../supabase/supabase.service';
import {
  PlanType,
  SubscriptionStatus,
  PLAN_CONFIGURATIONS,
  PlanConfiguration,
  Feature,
} from './plan.types';

/**
 * Serviço de gerenciamento de planos e features
 */
@Injectable()
export class PlansService {
  private readonly logger = new Logger(PlansService.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  /**
   * Obtém configuração de um plano
   */
  getPlanConfiguration(planType: PlanType): PlanConfiguration {
    return PLAN_CONFIGURATIONS[planType];
  }

  /**
   * Verifica se uma organização tem acesso a uma feature
   */
  async hasFeature(organizationId: string, feature: Feature): Promise<boolean> {
    try {
      const supabase = this.supabaseService.getClient();

      // Buscar organização e sua conta trial
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .select('trial_account_id, trial_accounts(plan, status, is_expired, settings)')
        .eq('id', organizationId)
        .single();

      if (orgError || !org) {
        this.logger.warn(`Organização não encontrada: ${organizationId}`);
        return false;
      }

      const account = org.trial_accounts as any;

      // Verificar se está expirado
      if (account.is_expired || account.status === SubscriptionStatus.EXPIRED) {
        return false;
      }

      // Verificar se está suspenso ou cancelado
      if (
        account.status === SubscriptionStatus.SUSPENDED ||
        account.status === SubscriptionStatus.CANCELLED
      ) {
        return false;
      }

      // Obter configuração do plano
      const planConfig = this.getPlanConfiguration(account.plan as PlanType);

      // Verificar se a feature está habilitada no plano
      return planConfig.features[feature] === true;
    } catch (error) {
      this.logger.error(`Erro ao verificar feature ${feature}:`, error);
      return false;
    }
  }

  /**
   * Verifica se organização tem um dos planos especificados
   */
  async hasAnyPlan(organizationId: string, plans: PlanType[]): Promise<boolean> {
    try {
      const supabase = this.supabaseService.getClient();

      const { data: org, error } = await supabase
        .from('organizations')
        .select('trial_account_id, trial_accounts(plan, status, is_expired)')
        .eq('id', organizationId)
        .single();

      if (error || !org) {
        return false;
      }

      const account = org.trial_accounts as any;

      // Verificar status
      if (
        account.is_expired ||
        account.status === SubscriptionStatus.EXPIRED ||
        account.status === SubscriptionStatus.SUSPENDED ||
        account.status === SubscriptionStatus.CANCELLED
      ) {
        return false;
      }

      // Verificar se tem algum dos planos
      return plans.includes(account.plan as PlanType);
    } catch (error) {
      this.logger.error('Erro ao verificar plano:', error);
      return false;
    }
  }

  /**
   * Verifica se assinatura está ativa (não expirada)
   */
  async isSubscriptionActive(organizationId: string): Promise<boolean> {
    try {
      const supabase = this.supabaseService.getClient();

      const { data: org, error } = await supabase
        .from('organizations')
        .select('trial_account_id, trial_accounts(status, is_expired, trial_ends_at)')
        .eq('id', organizationId)
        .single();

      if (error || !org) {
        return false;
      }

      const account = org.trial_accounts as any;

      // Verificar se está expirado
      if (account.is_expired) {
        return false;
      }

      // Verificar status
      if (
        account.status === SubscriptionStatus.EXPIRED ||
        account.status === SubscriptionStatus.SUSPENDED ||
        account.status === SubscriptionStatus.CANCELLED
      ) {
        return false;
      }

      // Se for trial, verificar data de expiração
      if (account.status === SubscriptionStatus.TRIAL) {
        const now = new Date();
        const endsAt = new Date(account.trial_ends_at);
        return now < endsAt;
      }

      // Se for active, está ok
      return account.status === SubscriptionStatus.ACTIVE;
    } catch (error) {
      this.logger.error('Erro ao verificar assinatura:', error);
      return false;
    }
  }

  /**
   * Obtém dados do plano de uma organização
   */
  async getOrganizationPlan(organizationId: string): Promise<{
    plan: PlanType;
    status: SubscriptionStatus;
    isExpired: boolean;
    trialEndsAt?: string;
    features: Partial<Record<Feature, boolean>>;
    limits: {
      maxUsers: number;
      maxStorageGb: number;
    };
  } | null> {
    try {
      const supabase = this.supabaseService.getClient();

      const { data: org, error } = await supabase
        .from('organizations')
        .select('trial_account_id, trial_accounts(*)')
        .eq('id', organizationId)
        .single();

      if (error || !org) {
        return null;
      }

      const account = org.trial_accounts as any;
      const planConfig = this.getPlanConfiguration(account.plan as PlanType);

      return {
        plan: account.plan,
        status: account.status,
        isExpired: account.is_expired,
        trialEndsAt: account.trial_ends_at,
        features: planConfig.features,
        limits: planConfig.limits,
      };
    } catch (error) {
      this.logger.error('Erro ao obter plano da organização:', error);
      return null;
    }
  }

  /**
   * Verifica se organização atingiu limite de usuários
   */
  async hasReachedUserLimit(organizationId: string): Promise<boolean> {
    try {
      const planData = await this.getOrganizationPlan(organizationId);
      if (!planData) {
        return true; // Se não achou plano, considerar limite atingido
      }

      // -1 significa ilimitado
      if (planData.limits.maxUsers === -1) {
        return false;
      }

      // Contar usuários da organização
      const supabase = this.supabaseService.getClient();
      const { count, error } = await supabase
        .from('users')
        .select('*', { count: 'exact', head: true })
        .eq('organization_id', organizationId)
        .eq('is_active', true);

      if (error) {
        this.logger.error('Erro ao contar usuários:', error);
        return true;
      }

      return (count || 0) >= planData.limits.maxUsers;
    } catch (error) {
      this.logger.error('Erro ao verificar limite de usuários:', error);
      return true;
    }
  }

  /**
   * Lista todos os planos disponíveis
   */
  getAllPlans(): PlanConfiguration[] {
    return Object.values(PLAN_CONFIGURATIONS);
  }

  /**
   * Verifica se um plano é superior a outro
   */
  isPlanHigherThan(plan1: PlanType, plan2: PlanType): boolean {
    const hierarchy = [PlanType.TRIAL, PlanType.BASIC, PlanType.PREMIUM, PlanType.ENTERPRISE];
    return hierarchy.indexOf(plan1) > hierarchy.indexOf(plan2);
  }
}
