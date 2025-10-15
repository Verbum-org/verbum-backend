import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsUrl,
  IsArray,
  IsInt,
} from 'class-validator';

/**
 * DTO para criar curso
 */
export class CreateCourseDto {
  @ApiProperty({ example: 'Matemática Básica' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 'MAT-101' })
  @IsString()
  @IsNotEmpty()
  shortName: string;

  @ApiPropertyOptional({ example: 'Curso introdutório de matemática' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ example: 'https://example.com/image.jpg' })
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional({ example: 123 })
  @IsInt()
  @IsOptional()
  moodleId?: number;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  modules?: CourseModuleDto[];
}

/**
 * DTO para atualizar curso
 */
export class UpdateCourseDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  shortName?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  imageUrl?: string;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;

  @ApiPropertyOptional()
  @IsArray()
  @IsOptional()
  modules?: CourseModuleDto[];
}

/**
 * DTO para módulo de curso
 */
export class CourseModuleDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  url?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  content?: string;

  @ApiProperty()
  @IsBoolean()
  isVisible: boolean;

  @ApiPropertyOptional()
  @IsInt()
  @IsOptional()
  moodleId?: number;
}

/**
 * DTO de resposta do curso
 */
export class CourseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  shortName: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  imageUrl?: string;

  @ApiProperty()
  isActive: boolean;

  @ApiPropertyOptional()
  moodleId?: number;

  @ApiPropertyOptional()
  moodleShortName?: string;

  @ApiPropertyOptional()
  moodleFullName?: string;

  @ApiProperty({ type: [CourseModuleDto] })
  modules: CourseModuleDto[];

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

/**
 * DTO para matricular usuário em curso
 */
export class EnrollUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  courseId: string;
}

/**
 * DTO de resposta de matrícula
 */
export class EnrollmentDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  organizationId: string;

  @ApiProperty()
  status: string;

  @ApiProperty()
  enrolledAt: string;

  @ApiPropertyOptional()
  completedAt?: string;

  @ApiProperty()
  createdAt: string;
}
