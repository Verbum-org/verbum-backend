import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class UpdateProgressDto {
  @ApiPropertyOptional({ example: 'in_progress' })
  @IsOptional()
  @IsEnum(['not_started', 'in_progress', 'completed'])
  status?: string;

  @ApiPropertyOptional({ example: 75.5, minimum: 0, maximum: 100 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiPropertyOptional({ example: 85.5 })
  @IsOptional()
  @IsNumber()
  score?: number;

  @ApiPropertyOptional({ example: 3600 })
  @IsOptional()
  @IsNumber()
  timeSpent?: number;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  lastAccessed?: string;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsDateString()
  completedAt?: string;
}

export class ProgressResponseDto {
  @ApiProperty({ example: 'progress123' })
  id: string;

  @ApiProperty({ example: 'user123' })
  userId: string;

  @ApiProperty({ example: 'course123' })
  courseId: string;

  @ApiProperty({ example: 'module123' })
  moduleId: string;

  @ApiProperty({ example: 'in_progress' })
  status: string;

  @ApiProperty({ example: 75.5 })
  progress: number;

  @ApiProperty({ example: 85.5 })
  score: number;

  @ApiProperty({ example: 3600 })
  timeSpent: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  lastAccessed: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  completedAt: string;

  @ApiProperty({ example: 12345 })
  moodleId: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: string;
}

export class ProgressListResponseDto {
  @ApiProperty({ type: [ProgressResponseDto] })
  data: ProgressResponseDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

export class ProgressQueryDto {
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

  @ApiPropertyOptional({ example: 'course123' })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiPropertyOptional({ example: 'module123' })
  @IsOptional()
  @IsString()
  moduleId?: string;

  @ApiPropertyOptional({ example: 'in_progress' })
  @IsOptional()
  @IsEnum(['not_started', 'in_progress', 'completed'])
  status?: string;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt', 'lastAccessed', 'completedAt'])
  sortBy?: string = 'updatedAt';

  @ApiPropertyOptional({ example: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class ProgressReportDto {
  @ApiProperty({ example: 'user123' })
  userId: string;

  @ApiProperty({ example: 10 })
  totalCourses: number;

  @ApiProperty({ example: 5 })
  completedCourses: number;

  @ApiProperty({ example: 3 })
  inProgressCourses: number;

  @ApiProperty({ example: 2 })
  notStartedCourses: number;

  @ApiProperty({ example: 75.5 })
  overallProgress: number;

  @ApiProperty({ example: 85.5 })
  averageScore: number;

  @ApiProperty({ example: 36000 })
  totalTimeSpent: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  lastActivity: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  reportGeneratedAt: string;
}

export class CourseProgressReportDto {
  @ApiProperty({ example: 'course123' })
  courseId: string;

  @ApiProperty({ example: 'Advanced JavaScript' })
  courseName: string;

  @ApiProperty({ example: 'user123' })
  userId: string;

  @ApiProperty({ example: 'in_progress' })
  status: string;

  @ApiProperty({ example: 75.5 })
  progress: number;

  @ApiProperty({ example: 85.5 })
  score: number;

  @ApiProperty({ example: 3600 })
  timeSpent: number;

  @ApiProperty({ example: 10 })
  totalModules: number;

  @ApiProperty({ example: 7 })
  completedModules: number;

  @ApiProperty({ example: 2 })
  inProgressModules: number;

  @ApiProperty({ example: 1 })
  notStartedModules: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  lastAccessed: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  enrolledAt: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  completedAt: string;

  @ApiProperty({ type: [ProgressResponseDto] })
  moduleProgress: ProgressResponseDto[];
}

export class TimeSpentReportDto {
  @ApiProperty({ example: 'user123' })
  userId: string;

  @ApiProperty({ example: '2024-01-01' })
  startDate: string;

  @ApiProperty({ example: '2024-12-31' })
  endDate: string;

  @ApiProperty({ example: 36000 })
  totalTimeSpent: number;

  @ApiProperty({ example: 3600 })
  averageTimePerDay: number;

  @ApiProperty({ example: 10 })
  totalDays: number;

  @ApiProperty({ example: 5 })
  activeDays: number;

  @ApiProperty({ type: 'object' })
  dailyBreakdown: Record<string, number>;

  @ApiProperty({ type: 'object' })
  courseBreakdown: Record<string, number>;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  reportGeneratedAt: string;
}

export class SyncResultDto {
  @ApiProperty({ example: 10 })
  synced: number;

  @ApiProperty({ example: 2 })
  errors: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  completedAt: string;

  @ApiProperty({ example: ['Error syncing progress 123: Invalid data'] })
  errorMessages?: string[];
}
