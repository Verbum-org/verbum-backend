import { Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { SupabaseService } from '../../supabase/supabase.service';

/**
 * Middleware para injetar dados da organização no request
 * Facilita acesso aos dados da org em qualquer handler
 */
@Injectable()
export class OrganizationMiddleware implements NestMiddleware {
  private readonly logger = new Logger(OrganizationMiddleware.name);

  constructor(private readonly supabaseService: SupabaseService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    // Se não tem user no request, pular (não autenticado)
    if (!(req as any).user) {
      return next();
    }

    const user = (req as any).user;
    const organizationId = user.organization_id;

    if (!organizationId) {
      this.logger.warn(`Usuário ${user.sub} não tem organização associada`);
      return next();
    }

    try {
      // Buscar dados completos da organização
      const supabase = this.supabaseService.getClient();
      const { data: org, error } = await supabase
        .from('organizations')
        .select('*, trial_account:trial_accounts(*)')
        .eq('id', organizationId)
        .single();

      if (error || !org) {
        this.logger.warn(`Organização ${organizationId} não encontrada`);
        return next();
      }

      // Injetar organização no request
      (req as any).organization = org;

      next();
    } catch (error) {
      this.logger.error('Erro ao buscar organização:', error);
      next();
    }
  }
}
