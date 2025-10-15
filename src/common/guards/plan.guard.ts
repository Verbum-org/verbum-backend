import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PlansService } from '../plans/plans.service';
import { REQUIRED_PLANS_KEY } from '../decorators/requires-plan.decorator';
import { PlanType } from '../plans/plan.types';

/**
 * Guard para verificar se organização tem um dos planos requeridos
 */
@Injectable()
export class PlanGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private plansService: PlansService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredPlans = this.reflector.getAllAndOverride<PlanType[]>(REQUIRED_PLANS_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se não especificou planos, permitir acesso
    if (!requiredPlans || requiredPlans.length === 0) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.organization_id) {
      throw new ForbiddenException('Usuário ou organização não encontrados');
    }

    // Verificar se organização tem um dos planos
    const hasAnyPlan = await this.plansService.hasAnyPlan(user.organization_id, requiredPlans);

    if (!hasAnyPlan) {
      throw new ForbiddenException(
        `Acesso negado. Esta funcionalidade requer um dos seguintes planos: ${requiredPlans.join(', ')}`,
      );
    }

    return true;
  }
}
