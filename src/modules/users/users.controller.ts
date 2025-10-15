import {
  Controller,
  Get,
  Put,
  Delete,
  Post,
  Param,
  Body,
  UseGuards,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RequiresRole } from '../../common/decorators/requires-role.decorator';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RoleHierarchyGuard } from '../../common/guards/role-hierarchy.guard';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Organization } from '../../common/decorators/organization.decorator';
import { UserRole } from '../../common/plans/plan.types';
import { UsersService } from './users.service';
import { UserDto, UpdateUserDto } from './dto/user.dto';

@ApiTags('users')
@Controller('users')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @RequiresRole(UserRole.ADMIN, UserRole.DIRETORIA, UserRole.COORDENADOR, UserRole.PROFESSOR)
  @ApiOperation({ summary: 'Listar usuários da organização' })
  @ApiResponse({ status: 200, description: 'Lista de usuários', type: [UserDto] })
  async findAll(@Organization('id') organizationId: string): Promise<UserDto[]> {
    return this.usersService.findAll(organizationId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar usuário por ID' })
  @ApiResponse({ status: 200, description: 'Usuário encontrado', type: UserDto })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async findOne(@Param('id') id: string): Promise<UserDto> {
    return this.usersService.findOne(id);
  }

  @Get('role/:role')
  @RequiresRole(UserRole.ADMIN, UserRole.DIRETORIA, UserRole.COORDENADOR)
  @ApiOperation({ summary: 'Listar usuários por role' })
  @ApiResponse({ status: 200, description: 'Lista de usuários', type: [UserDto] })
  async findByRole(
    @Param('role') role: UserRole,
    @Organization('id') organizationId: string,
  ): Promise<UserDto[]> {
    return this.usersService.findByRole(organizationId, role);
  }

  @Put(':id')
  @UseGuards(RoleHierarchyGuard)
  @ApiOperation({ summary: 'Atualizar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário atualizado', type: UserDto })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateDto: UpdateUserDto,
    @CurrentUser('sub') editorAuthUserId: string,
  ): Promise<UserDto> {
    return this.usersService.update(id, updateDto, editorAuthUserId);
  }

  @Delete(':id')
  @RequiresRole(UserRole.ADMIN, UserRole.DIRETORIA, UserRole.COORDENADOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar usuário' })
  @ApiResponse({ status: 204, description: 'Usuário desativado' })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async deactivate(
    @Param('id') id: string,
    @CurrentUser('sub') editorAuthUserId: string,
  ): Promise<void> {
    return this.usersService.deactivate(id, editorAuthUserId);
  }

  @Post(':id/reactivate')
  @RequiresRole(UserRole.ADMIN, UserRole.DIRETORIA, UserRole.COORDENADOR)
  @ApiOperation({ summary: 'Reativar usuário' })
  @ApiResponse({ status: 200, description: 'Usuário reativado', type: UserDto })
  @ApiResponse({ status: 403, description: 'Sem permissão' })
  @ApiResponse({ status: 404, description: 'Usuário não encontrado' })
  async reactivate(
    @Param('id') id: string,
    @CurrentUser('sub') editorAuthUserId: string,
  ): Promise<UserDto> {
    return this.usersService.reactivate(id, editorAuthUserId);
  }
}
