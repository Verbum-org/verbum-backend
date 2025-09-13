import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';

export class JobResponseDto {
  @ApiProperty({ example: 'job123' })
  id: string;

  @ApiProperty({ example: 'webhook-processing' })
  name: string;

  @ApiProperty({ example: { eventId: 'event123' } })
  data: any;

  @ApiProperty({ example: 'completed' })
  status: string;

  @ApiProperty({ example: 0 })
  priority: number;

  @ApiProperty({ example: 1 })
  attempts: number;

  @ApiProperty({ example: 3 })
  maxAttempts: number;

  @ApiProperty({ example: 'Error processing job' })
  error: string;

  @ApiProperty({ example: { result: 'success' } })
  result: any;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  scheduledAt: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  startedAt: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  completedAt: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: string;
}

export class JobListResponseDto {
  @ApiProperty({ type: [JobResponseDto] })
  data: JobResponseDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

export class JobQueryDto {
  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 10, minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number = 10;

  @ApiPropertyOptional({ example: 'webhook-processing' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ example: 'completed' })
  @IsOptional()
  @IsEnum(['pending', 'processing', 'completed', 'failed'])
  status?: string;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsEnum(['createdAt', 'scheduledAt', 'startedAt', 'completedAt'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class JobStatsDto {
  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 10 })
  pending: number;

  @ApiProperty({ example: 5 })
  processing: number;

  @ApiProperty({ example: 80 })
  completed: number;

  @ApiProperty({ example: 5 })
  failed: number;

  @ApiProperty({ example: 95.0 })
  successRate: number;

  @ApiProperty({ example: 120.5 })
  averageProcessingTime: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  lastProcessedAt: string;
}

export class QueueStatusDto {
  @ApiProperty({ example: 'webhook-processing' })
  name: string;

  @ApiProperty({ example: 10 })
  waiting: number;

  @ApiProperty({ example: 2 })
  active: number;

  @ApiProperty({ example: 5 })
  completed: number;

  @ApiProperty({ example: 1 })
  failed: number;

  @ApiProperty({ example: 0 })
  delayed: number;

  @ApiProperty({ example: 0 })
  paused: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;
}

export class JobRetryDto {
  @ApiProperty({ example: 'job123' })
  id: string;

  @ApiProperty({ example: 'retry_initiated' })
  status: string;

  @ApiProperty({ example: 'Job retry has been initiated' })
  message: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  retryAt: string;
}

export class JobCancelDto {
  @ApiProperty({ example: 'job123' })
  id: string;

  @ApiProperty({ example: 'cancelled' })
  status: string;

  @ApiProperty({ example: 'Job has been cancelled' })
  message: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  cancelledAt: string;
}

export class JobCleanDto {
  @ApiProperty({ example: 50 })
  cleaned: number;

  @ApiProperty({ example: 'Jobs older than 7 days have been cleaned' })
  message: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  cleanedAt: string;
}
