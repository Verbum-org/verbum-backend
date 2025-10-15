import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, IsNumber, IsBoolean, Min, Max } from 'class-validator';

/**
 * DTO para atualizar progresso
 */
export class UpdateProgressDto {
  @ApiProperty({ example: 75.5, description: 'Porcentagem de conclusão (0-100)' })
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @ApiPropertyOptional({ example: 3600, description: 'Tempo gasto em segundos' })
  @IsNumber()
  @IsOptional()
  @Min(0)
  timeSpent?: number;

  @ApiPropertyOptional({ example: false })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean;

  @ApiPropertyOptional({ description: 'Metadados adicionais (scores, tentativas, etc)' })
  @IsOptional()
  metadata?: Record<string, any>;
}

/**
 * DTO de resposta de progresso
 */
export class ProgressDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  organizationId: string;

  @ApiPropertyOptional()
  moduleId?: string;

  @ApiProperty()
  progress: number;

  @ApiProperty()
  timeSpent: number;

  @ApiProperty()
  isCompleted: boolean;

  @ApiPropertyOptional()
  completedAt?: string;

  @ApiPropertyOptional()
  lastAccessedAt?: string;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;
}

/**
 * DTO para log de atividade
 */
export class CreateActivityLogDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  courseId: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  moduleId?: string;

  @ApiProperty({ example: 'module_view' })
  @IsString()
  @IsNotEmpty()
  activityType: string;

  @ApiProperty({ example: 'view' })
  @IsString()
  @IsNotEmpty()
  action: string;

  @ApiPropertyOptional()
  @IsOptional()
  metadata?: Record<string, any>;
}

/**
 * DTO de resposta de log de atividade
 */
export class ActivityLogDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  userId: string;

  @ApiProperty()
  courseId: string;

  @ApiProperty()
  organizationId: string;

  @ApiPropertyOptional()
  moduleId?: string;

  @ApiProperty()
  activityType: string;

  @ApiProperty()
  action: string;

  @ApiPropertyOptional()
  metadata?: Record<string, any>;

  @ApiProperty()
  createdAt: string;
}
