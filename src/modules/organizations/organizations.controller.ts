import { Controller, Get, Put, Body, UseGuards, ValidationPipe, Param } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequiresRole } from '../../common/decorators/requires-role.decorator';
import { Organization } from '../../common/decorators/organization.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/plans/plan.types';
import { OrganizationsService } from './organizations.service';
import { UpdateOrganizationDto, OrganizationDto } from './dto/organization.dto';

@ApiTags('organizations')
@Controller('organizations')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('me')
  @ApiOperation({ summary: 'Obter dados da organização do usuário logado' })
  @ApiResponse({ status: 200, description: 'Organização obtida', type: OrganizationDto })
  async getMyOrganization(@Organization('id') organizationId: string): Promise<OrganizationDto> {
    return this.organizationsService.findOne(organizationId);
  }

  @Get('me/stats')
  @RequiresRole(UserRole.ADMIN, UserRole.DIRETORIA, UserRole.COORDENADOR)
  @ApiOperation({ summary: 'Obter estatísticas da organização' })
  @ApiResponse({ status: 200, description: 'Estatísticas obtidas' })
  async getMyOrganizationStats(@Organization('id') organizationId: string): Promise<any> {
    return this.organizationsService.getStats(organizationId);
  }

  @Get(':id')
  @RequiresRole(UserRole.ADMIN, UserRole.DIRETORIA)
  @ApiOperation({ summary: 'Buscar organização por ID' })
  @ApiResponse({ status: 200, description: 'Organização encontrada', type: OrganizationDto })
  @ApiResponse({ status: 404, description: 'Organização não encontrada' })
  async findOne(@Param('id') id: string): Promise<OrganizationDto> {
    return this.organizationsService.findOne(id);
  }

  @Put('me')
  @RequiresRole(UserRole.ADMIN, UserRole.DIRETORIA)
  @ApiOperation({ summary: 'Atualizar organização' })
  @ApiResponse({ status: 200, description: 'Organização atualizada', type: OrganizationDto })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  async update(
    @Organization('id') organizationId: string,
    @CurrentUser('role') userRole: UserRole,
    @Body(ValidationPipe) updateDto: UpdateOrganizationDto,
  ): Promise<OrganizationDto> {
    return this.organizationsService.update(organizationId, updateDto, userRole);
  }
}
