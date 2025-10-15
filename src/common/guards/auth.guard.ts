import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { SupabaseService } from '../../supabase/supabase.service';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

/**
 * Guard de autenticação usando Supabase Auth
 * Migrado e consolidado de modules/trial/guards/supabase-auth.guard.ts
 */
@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private reflector: Reflector,
    private supabaseService: SupabaseService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    // Verificar se a rota é pública
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token não fornecido');
    }

    const token = authHeader.substring(7);

    try {
      // Validar token com Supabase
      const supabase = this.supabaseService.getClient();
      const {
        data: { user },
        error,
      } = await supabase.auth.getUser(token);

      if (error || !user) {
        throw new UnauthorizedException('Token inválido ou expirado');
      }

      // Buscar dados completos do usuário no banco
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*, organization:organizations(*)')
        .eq('auth_user_id', user.id)
        .single();

      if (userError || !userData) {
        throw new UnauthorizedException('Usuário não encontrado');
      }

      // Verificar se usuário está ativo
      if (!userData.is_active) {
        throw new UnauthorizedException('Usuário inativo');
      }

      // Anexar dados ao request para uso nos handlers
      request.user = {
        ...user,
        ...userData,
        sub: user.id, // ID do Supabase Auth
        dbId: userData.id, // ID do banco de dados
      };

      // Salvar token para uso posterior (logout, etc)
      request.user.accessToken = token;

      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Erro ao validar token');
    }
  }
}
