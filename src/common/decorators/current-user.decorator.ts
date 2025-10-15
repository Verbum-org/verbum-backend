import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator para obter dados do usuário autenticado
 * Substitui @TrialUser do módulo trial
 *
 * Uso:
 * - @CurrentUser() user - retorna objeto completo do user
 * - @CurrentUser('sub') userId - retorna apenas o ID do auth
 * - @CurrentUser('email') email - retorna apenas o email
 */
export const CurrentUser = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    if (!user) {
      return undefined;
    }

    // Se especificou uma propriedade, retornar apenas ela
    if (data) {
      return user[data];
    }

    // Retornar objeto completo
    return user;
  },
);
