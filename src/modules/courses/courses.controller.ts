import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
  ValidationPipe,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
import { RequiresRole } from '../../common/decorators/requires-role.decorator';
import { Organization } from '../../common/decorators/organization.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../../common/plans/plan.types';
import { CoursesService } from './courses.service';
import {
  CreateCourseDto,
  UpdateCourseDto,
  CourseDto,
  EnrollUserDto,
  EnrollmentDto,
} from './dto/course.dto';

@ApiTags('courses')
@Controller('courses')
@UseGuards(AuthGuard, PermissionsGuard)
@ApiBearerAuth()
export class CoursesController {
  constructor(private readonly coursesService: CoursesService) {}

  @Post()
  @RequiresRole(UserRole.ADMIN, UserRole.DIRETORIA, UserRole.COORDENADOR)
  @ApiOperation({ summary: 'Criar novo curso' })
  @ApiResponse({ status: 201, description: 'Curso criado com sucesso', type: CourseDto })
  @ApiResponse({ status: 409, description: 'Curso já existe' })
  async create(
    @Organization('id') organizationId: string,
    @Body(ValidationPipe) createDto: CreateCourseDto,
  ): Promise<CourseDto> {
    return this.coursesService.create(organizationId, createDto);
  }

  @Get()
  @ApiOperation({ summary: 'Listar cursos da organização' })
  @ApiQuery({ name: 'includeInactive', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'Lista de cursos', type: [CourseDto] })
  async findAll(
    @Organization('id') organizationId: string,
    @Query('includeInactive') includeInactive?: boolean,
  ): Promise<CourseDto[]> {
    return this.coursesService.findAll(organizationId, includeInactive);
  }

  @Get('my-courses')
  @ApiOperation({ summary: 'Listar cursos do usuário logado' })
  @ApiResponse({ status: 200, description: 'Lista de cursos', type: [CourseDto] })
  async getMyCourses(@CurrentUser('dbId') userId: string): Promise<CourseDto[]> {
    return this.coursesService.getCoursesByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Buscar curso por ID' })
  @ApiResponse({ status: 200, description: 'Curso encontrado', type: CourseDto })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  async findOne(@Param('id') id: string): Promise<CourseDto> {
    return this.coursesService.findOne(id);
  }

  @Get('short-name/:shortName')
  @ApiOperation({ summary: 'Buscar curso por código' })
  @ApiResponse({ status: 200, description: 'Curso encontrado', type: CourseDto })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  async findByShortName(
    @Organization('id') organizationId: string,
    @Param('shortName') shortName: string,
  ): Promise<CourseDto> {
    return this.coursesService.findByShortName(organizationId, shortName);
  }

  @Put(':id')
  @RequiresRole(UserRole.ADMIN, UserRole.DIRETORIA, UserRole.COORDENADOR)
  @ApiOperation({ summary: 'Atualizar curso' })
  @ApiResponse({ status: 200, description: 'Curso atualizado', type: CourseDto })
  @ApiResponse({ status: 404, description: 'Curso não encontrado' })
  async update(
    @Param('id') id: string,
    @Body(ValidationPipe) updateDto: UpdateCourseDto,
  ): Promise<CourseDto> {
    return this.coursesService.update(id, updateDto);
  }

  @Delete(':id')
  @RequiresRole(UserRole.ADMIN, UserRole.DIRETORIA)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Desativar curso' })
  @ApiResponse({ status: 204, description: 'Curso desativado' })
  async deactivate(@Param('id') id: string): Promise<void> {
    return this.coursesService.deactivate(id);
  }

  @Post('enroll')
  @RequiresRole(UserRole.ADMIN, UserRole.DIRETORIA, UserRole.COORDENADOR, UserRole.PROFESSOR)
  @ApiOperation({ summary: 'Matricular usuário em curso' })
  @ApiResponse({ status: 201, description: 'Usuário matriculado', type: EnrollmentDto })
  @ApiResponse({ status: 409, description: 'Usuário já matriculado' })
  async enrollUser(
    @Organization('id') organizationId: string,
    @Body(ValidationPipe) enrollDto: EnrollUserDto,
  ): Promise<EnrollmentDto> {
    return this.coursesService.enrollUser(enrollDto.userId, enrollDto.courseId, organizationId);
  }

  @Delete(':courseId/enrollments/:userId')
  @RequiresRole(UserRole.ADMIN, UserRole.DIRETORIA, UserRole.COORDENADOR, UserRole.PROFESSOR)
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Cancelar matrícula' })
  @ApiResponse({ status: 204, description: 'Matrícula cancelada' })
  async unenrollUser(
    @Param('courseId') courseId: string,
    @Param('userId') userId: string,
  ): Promise<void> {
    return this.coursesService.unenrollUser(userId, courseId);
  }

  @Get(':id/enrollments')
  @RequiresRole(UserRole.ADMIN, UserRole.DIRETORIA, UserRole.COORDENADOR, UserRole.PROFESSOR)
  @ApiOperation({ summary: 'Listar matrículas do curso' })
  @ApiResponse({ status: 200, description: 'Lista de matrículas', type: [EnrollmentDto] })
  async getEnrollments(@Param('id') courseId: string): Promise<EnrollmentDto[]> {
    return this.coursesService.getEnrollmentsByCourse(courseId);
  }
}
