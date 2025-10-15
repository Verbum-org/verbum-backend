import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Decorator para obter dados da organização do usuário autenticado
 * Os dados são injetados pelo OrganizationMiddleware
 *
 * Uso:
 * - @Organization() org - retorna objeto completo da organização
 * - @Organization('id') orgId - retorna apenas o ID
 * - @Organization('name') orgName - retorna apenas o nome
 */
export const Organization = createParamDecorator(
  (data: string | undefined, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const organization = request.organization;

    if (!organization) {
      return undefined;
    }

    // Se especificou uma propriedade, retornar apenas ela
    if (data) {
      return organization[data];
    }

    // Retornar objeto completo
    return organization;
  },
);
