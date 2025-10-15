import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
  ValidationPipe,
  Req,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { Request } from 'express';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequiresRole } from '../../common/decorators/requires-role.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Organization } from '../../common/decorators/organization.decorator';
import { UserRole } from '../../common/plans/plan.types';
import { ProgressService } from './progress.service';
import {
  UpdateProgressDto,
  ProgressDto,
  CreateActivityLogDto,
  ActivityLogDto,
} from './dto/progress.dto';

@ApiTags('progress')
@Controller('progress')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class ProgressController {
  constructor(private readonly progressService: ProgressService) {}

  @Get('my-stats')
  @ApiOperation({ summary: 'Obter estatísticas do usuário logado' })
  @ApiResponse({ status: 200, description: 'Estatísticas obtidas' })
  async getMyStats(
    @CurrentUser('dbId') userId: string,
    @Organization('id') organizationId: string,
  ): Promise<any> {
    return this.progressService.getUserStats(userId, organizationId);
  }

  @Get('course/:courseId')
  @ApiOperation({ summary: 'Obter progresso do usuário em um curso' })
  @ApiResponse({ status: 200, description: 'Progresso obtido', type: [ProgressDto] })
  async getProgressByCourse(
    @CurrentUser('dbId') userId: string,
    @Param('courseId') courseId: string,
  ): Promise<ProgressDto[]> {
    return this.progressService.getProgressByCourse(userId, courseId);
  }

  @Get('course/:courseId/module/:moduleId')
  @ApiOperation({ summary: 'Obter progresso do usuário em um módulo' })
  @ApiResponse({ status: 200, description: 'Progresso obtido', type: ProgressDto })
  async getProgressByModule(
    @CurrentUser('dbId') userId: string,
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
  ): Promise<ProgressDto | null> {
    return this.progressService.getProgressByModule(userId, courseId, moduleId);
  }

  @Put('course/:courseId')
  @ApiOperation({ summary: 'Atualizar progresso geral do curso' })
  @ApiResponse({ status: 200, description: 'Progresso atualizado', type: ProgressDto })
  async updateCourseProgress(
    @CurrentUser('dbId') userId: string,
    @Organization('id') organizationId: string,
    @Param('courseId') courseId: string,
    @Body(ValidationPipe) updateDto: UpdateProgressDto,
  ): Promise<ProgressDto> {
    return this.progressService.updateProgress(userId, courseId, null, organizationId, updateDto);
  }

  @Put('course/:courseId/module/:moduleId')
  @ApiOperation({ summary: 'Atualizar progresso de um módulo' })
  @ApiResponse({ status: 200, description: 'Progresso atualizado', type: ProgressDto })
  async updateModuleProgress(
    @CurrentUser('dbId') userId: string,
    @Organization('id') organizationId: string,
    @Param('courseId') courseId: string,
    @Param('moduleId') moduleId: string,
    @Body(ValidationPipe) updateDto: UpdateProgressDto,
  ): Promise<ProgressDto> {
    return this.progressService.updateProgress(
      userId,
      courseId,
      moduleId,
      organizationId,
      updateDto,
    );
  }

  @Post('activity')
  @ApiOperation({ summary: 'Registrar atividade do usuário' })
  @ApiResponse({ status: 201, description: 'Atividade registrada', type: ActivityLogDto })
  async logActivity(
    @CurrentUser('dbId') userId: string,
    @Organization('id') organizationId: string,
    @Body(ValidationPipe) createDto: CreateActivityLogDto,
    @Req() req: Request,
  ): Promise<ActivityLogDto> {
    const ipAddress = req.ip;
    const userAgent = req.headers['user-agent'];
    return this.progressService.logActivity(
      userId,
      organizationId,
      createDto,
      ipAddress,
      userAgent,
    );
  }

  @Get('activities')
  @ApiOperation({ summary: 'Obter atividades recentes' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'courseId', required: false, type: String })
  @ApiResponse({ status: 200, description: 'Atividades obtidas', type: [ActivityLogDto] })
  async getActivities(
    @CurrentUser('dbId') userId: string,
    @Query('limit') limit?: number,
    @Query('courseId') courseId?: string,
  ): Promise<ActivityLogDto[]> {
    return this.progressService.getRecentActivities(userId, limit, courseId);
  }

  @Get('user/:userId/stats')
  @RequiresRole(UserRole.ADMIN, UserRole.DIRETORIA, UserRole.COORDENADOR, UserRole.PROFESSOR)
  @ApiOperation({ summary: 'Obter estatísticas de um usuário (professores/admins)' })
  @ApiResponse({ status: 200, description: 'Estatísticas obtidas' })
  async getUserStats(
    @Param('userId') userId: string,
    @Organization('id') organizationId: string,
  ): Promise<any> {
    return this.progressService.getUserStats(userId, organizationId);
  }
}
