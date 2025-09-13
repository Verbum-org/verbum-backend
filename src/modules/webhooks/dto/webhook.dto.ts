import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsEnum, IsInt, IsObject, IsOptional, IsString, Max, Min } from 'class-validator';

export class WebhookEventDto {
  @ApiProperty({ example: 'user_created' })
  @IsString()
  eventType: string;

  @ApiProperty({ example: 'moodle' })
  @IsString()
  source: string;

  @ApiProperty({ example: { userId: 123, email: 'user@example.com' } })
  @IsObject()
  payload: any;

  @ApiPropertyOptional({ example: 'webhook123' })
  @IsOptional()
  @IsString()
  webhookId?: string;

  @ApiPropertyOptional({ example: '2024-01-01T00:00:00.000Z' })
  @IsOptional()
  @IsString()
  timestamp?: string;
}

export class WebhookEventResponseDto {
  @ApiProperty({ example: 'event123' })
  id: string;

  @ApiProperty({ example: 'user_created' })
  eventType: string;

  @ApiProperty({ example: 'moodle' })
  source: string;

  @ApiProperty({ example: { userId: 123, email: 'user@example.com' } })
  payload: any;

  @ApiProperty({ example: false })
  processed: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  processedAt: string;

  @ApiProperty({ example: 'Error processing webhook' })
  error: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: string;
}

export class WebhookEventListResponseDto {
  @ApiProperty({ type: [WebhookEventResponseDto] })
  data: WebhookEventResponseDto[];

  @ApiProperty({ example: 100 })
  total: number;

  @ApiProperty({ example: 1 })
  page: number;

  @ApiProperty({ example: 10 })
  limit: number;

  @ApiProperty({ example: 10 })
  totalPages: number;
}

export class WebhookEventQueryDto {
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

  @ApiPropertyOptional({ example: 'user_created' })
  @IsOptional()
  @IsString()
  eventType?: string;

  @ApiPropertyOptional({ example: 'moodle' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ example: false })
  @IsOptional()
  @Transform(({ value }) => value === 'true')
  @IsBoolean()
  processed?: boolean;

  @ApiPropertyOptional({ example: 'createdAt' })
  @IsOptional()
  @IsEnum(['createdAt', 'processedAt', 'eventType', 'source'])
  sortBy?: string = 'createdAt';

  @ApiPropertyOptional({ example: 'desc' })
  @IsOptional()
  @IsEnum(['asc', 'desc'])
  sortOrder?: 'asc' | 'desc' = 'desc';
}

export class WebhookHealthDto {
  @ApiProperty({ example: 'healthy' })
  status: string;

  @ApiProperty({ example: 'Webhook service is running normally' })
  message: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  timestamp: string;

  @ApiProperty({ example: 10 })
  pendingEvents: number;

  @ApiProperty({ example: 5 })
  failedEvents: number;

  @ApiProperty({ example: 100 })
  totalEvents: number;
}

export class WebhookRetryDto {
  @ApiProperty({ example: 'event123' })
  id: string;

  @ApiProperty({ example: 'retry_initiated' })
  status: string;

  @ApiProperty({ example: 'Webhook event retry has been initiated' })
  message: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  retryAt: string;
}
