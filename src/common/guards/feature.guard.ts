import { Injectable, CanActivate, ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { PlansService } from '../plans/plans.service';
import { REQUIRED_FEATURE_KEY } from '../decorators/requires-feature.decorator';
import { Feature } from '../plans/plan.types';

/**
 * Guard para verificar se organização tem acesso a uma feature
 */
@Injectable()
export class FeatureGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private plansService: PlansService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiredFeature = this.reflector.getAllAndOverride<Feature>(REQUIRED_FEATURE_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // Se não especificou feature, permitir acesso
    if (!requiredFeature) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;

    if (!user || !user.organization_id) {
      throw new ForbiddenException('Usuário ou organização não encontrados');
    }

    // Verificar se organização tem a feature
    const hasFeature = await this.plansService.hasFeature(user.organization_id, requiredFeature);

    if (!hasFeature) {
      throw new ForbiddenException(
        `Acesso negado. Esta funcionalidade (${requiredFeature}) não está disponível no seu plano`,
      );
    }

    return true;
  }
}
