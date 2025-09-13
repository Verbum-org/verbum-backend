import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsArray, IsBoolean, IsInt, IsOptional, Max, Min } from 'class-validator';

export class SyncUsersDto {
  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 50, minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  perPage?: number = 50;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  forceUpdate?: boolean = false;
}

export class SyncCoursesDto {
  @ApiPropertyOptional({ example: 1, minimum: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  page?: number = 1;

  @ApiPropertyOptional({ example: 50, minimum: 1, maximum: 100 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  @Min(1)
  @Max(100)
  perPage?: number = 50;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  forceUpdate?: boolean = false;

  @ApiPropertyOptional({ example: [1, 2, 3] })
  @IsOptional()
  @IsArray()
  @IsInt({ each: true })
  categoryIds?: number[];
}

export class SyncEnrollmentsDto {
  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  courseId?: number;

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) => parseInt(value))
  @IsInt()
  userId?: number;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  forceUpdate?: boolean = false;
}

export class MoodleUserDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'john.doe' })
  username: string;

  @ApiProperty({ example: 'john.doe@example.com' })
  email: string;

  @ApiProperty({ example: 'John' })
  firstname: string;

  @ApiProperty({ example: 'Doe' })
  lastname: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  profileimageurl: string;

  @ApiProperty({ example: true })
  suspended: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  lastaccess: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timecreated: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timemodified: string;
}

export class MoodleCourseDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Sample Course' })
  fullname: string;

  @ApiProperty({ example: 'SAMPLE' })
  shortname: string;

  @ApiProperty({ example: 'This is a sample course' })
  summary: string;

  @ApiProperty({ example: 1 })
  categoryid: number;

  @ApiProperty({ example: 'https://example.com/course-image.jpg' })
  courseimage: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  startdate: string;

  @ApiProperty({ example: '2024-12-31T23:59:59.999Z' })
  enddate: string;

  @ApiProperty({ example: true })
  visible: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timecreated: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timemodified: string;
}

export class MoodleEnrollmentDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 1 })
  userid: number;

  @ApiProperty({ example: 1 })
  courseid: number;

  @ApiProperty({ example: 'student' })
  role: string;

  @ApiProperty({ example: 'active' })
  status: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timecreated: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timemodified: string;
}

export class MoodleModuleDto {
  @ApiProperty({ example: 1 })
  id: number;

  @ApiProperty({ example: 'Introduction' })
  name: string;

  @ApiProperty({ example: 'This is an introduction module' })
  description: string;

  @ApiProperty({ example: 'resource' })
  modname: string;

  @ApiProperty({ example: 'https://example.com/module' })
  url: string;

  @ApiProperty({ example: 1 })
  section: number;

  @ApiProperty({ example: true })
  visible: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timecreated: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timemodified: string;
}

export class MoodleProgressDto {
  @ApiProperty({ example: 1 })
  userid: number;

  @ApiProperty({ example: 1 })
  courseid: number;

  @ApiProperty({ example: 1 })
  moduleid: number;

  @ApiProperty({ example: 'completed' })
  completionstate: string;

  @ApiProperty({ example: 100 })
  progress: number;

  @ApiProperty({ example: 85.5 })
  score: number;

  @ApiProperty({ example: 3600 })
  timespent: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timecompleted: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timemodified: string;
}

export class MoodleApiResponseDto<T> {
  @ApiProperty()
  success: boolean;

  @ApiProperty()
  data: T;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 1 })
  page?: number;

  @ApiProperty({ example: 50 })
  perPage?: number;

  @ApiProperty({ example: 100 })
  total?: number;
}

export class SyncResultDto {
  @ApiProperty({ example: 10 })
  created: number;

  @ApiProperty({ example: 5 })
  updated: number;

  @ApiProperty({ example: 0 })
  errors: number;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  completedAt: string;

  @ApiProperty({ example: ['Error syncing user 123: Invalid data'] })
  errorMessages?: string[];
}
