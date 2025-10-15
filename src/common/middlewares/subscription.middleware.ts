import { Injectable, NestMiddleware, Logger, ForbiddenException } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SupabaseService } from '../../supabase/supabase.service';
import { SubscriptionStatus } from '../plans/plan.types';

/**
 * Middleware para verificar status da assinatura
 * Consolidado com TrialExpirationMiddleware
 *
 * Bloqueia acesso se:
 * - Trial expirado
 * - Assinatura expirada
 * - Conta suspensa ou cancelada
 */
@Injectable()
export class SubscriptionMiddleware implements NestMiddleware {
  private readonly logger = new Logger(SubscriptionMiddleware.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Se não tem user no request, pular (não autenticado)
    if (!(req as any).user) {
      return next();
    }

    const user = (req as any).user;
    const organizationId = user.organization_id;

    if (!organizationId) {
      return next();
    }

    try {
      // Buscar status da conta
      const supabase = this.supabaseService.getClient();
      const { data: org, error } = await supabase
        .from('organizations')
        .select('trial_account_id, trial_accounts(status, is_expired, trial_ends_at)')
        .eq('id', organizationId)
        .single();

      if (error || !org) {
        this.logger.warn(`Organização ${organizationId} não encontrada`);
        return next();
      }

      const account = (org as any).trial_accounts;

      // Verificar se está expirado
      if (account.is_expired) {
        throw new ForbiddenException(
          'Seu período de trial expirou. Entre em contato para assinar um plano.',
        );
      }

      // Verificar status
      if (account.status === SubscriptionStatus.EXPIRED) {
        throw new ForbiddenException('Sua assinatura expirou. Entre em contato para renovar.');
      }

      if (account.status === SubscriptionStatus.SUSPENDED) {
        throw new ForbiddenException('Sua conta está suspensa. Entre em contato com o suporte.');
      }

      if (account.status === SubscriptionStatus.CANCELLED) {
        throw new ForbiddenException(
          'Sua assinatura foi cancelada. Entre em contato para reativar.',
        );
      }

      // Se for trial, verificar data de expiração
      if (account.status === SubscriptionStatus.TRIAL) {
        const now = new Date();
        const endsAt = new Date(account.trial_ends_at);

        if (now >= endsAt) {
          // Atualizar status para expirado
          await supabase
            .from('trial_accounts')
            .update({ is_expired: true, status: SubscriptionStatus.EXPIRED })
            .eq('id', org.trial_account_id);

          throw new ForbiddenException(
            'Seu período de trial expirou. Entre em contato para assinar um plano.',
          );
        }

        // Se faltam menos de 3 dias, logar warning
        const daysLeft = Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysLeft <= 3) {
          this.logger.warn(`Trial da organização ${organizationId} expira em ${daysLeft} dia(s)`);
        }
      }

      next();
    } catch (error) {
      if (error instanceof ForbiddenException) {
        throw error;
      }
      this.logger.error('Erro ao verificar assinatura:', error);
      next();
    }
  }
}
