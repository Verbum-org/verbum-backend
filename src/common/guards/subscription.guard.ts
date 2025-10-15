import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { PlansService } from '../plans/plans.service';

/**
 * Guard para verificar se assinatura da organização está ativa
 * Bloqueia acesso se trial/assinatura expirou
 */
@Injectable()
export class SubscriptionGuard implements CanActivate {
  constructor(private plansService: PlansService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.organization_id) {
      throw new ForbiddenException('Usuário ou organização não encontrados');
    }

    // Verificar se assinatura está ativa
    const isActive = await this.plansService.isSubscriptionActive(user.organization_id);

    if (!isActive) {
      throw new ForbiddenException(
        'Acesso negado. Sua assinatura expirou. Entre em contato para renovar.',
      );
    }

    return true;
  }
}
