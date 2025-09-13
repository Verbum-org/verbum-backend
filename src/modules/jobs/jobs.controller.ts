import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import {
  SyncCoursesDto,
  SyncEnrollmentsDto,
  SyncUsersDto,
} from '../moodle-adapter/dto/moodle-adapter.dto';
import { JobsService } from './jobs.service';

@ApiTags('jobs')
@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  /**
   * Sync Jobs
   */
  @Post('sync/users')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Queue users sync job' })
  @ApiResponse({ status: 201, description: 'Users sync job queued successfully' })
  async queueUsersSync(@Body() syncDto: SyncUsersDto) {
    return this.jobsService.queueUsersSync(syncDto);
  }

  @Post('sync/courses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Queue courses sync job' })
  @ApiResponse({ status: 201, description: 'Courses sync job queued successfully' })
  async queueCoursesSync(@Body() syncDto: SyncCoursesDto) {
    return this.jobsService.queueCoursesSync(syncDto);
  }

  @Post('sync/enrollments')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Queue enrollments sync job' })
  @ApiResponse({ status: 201, description: 'Enrollments sync job queued successfully' })
  async queueEnrollmentsSync(@Body() syncDto: SyncEnrollmentsDto) {
    return this.jobsService.queueEnrollmentsSync(syncDto);
  }

  @Post('sync/all')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Queue all sync job' })
  @ApiResponse({ status: 201, description: 'All sync job queued successfully' })
  async queueAllSync(@Body() options?: any) {
    return this.jobsService.queueAllSync(options);
  }

  /**
   * Webhook Jobs
   */
  @Post('webhook/event')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Queue webhook event job' })
  @ApiResponse({ status: 201, description: 'Webhook event job queued successfully' })
  async queueWebhookEvent(@Body() eventData: any) {
    return this.jobsService.queueWebhookEvent(eventData);
  }

  /**
   * Report Jobs
   */
  @Post('report/generate')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Queue report generation job' })
  @ApiResponse({ status: 201, description: 'Report generation job queued successfully' })
  async queueReportGeneration(@Body() reportData: any) {
    return this.jobsService.queueReportGeneration(reportData);
  }

  /**
   * Job Management
   */
  @Get('status/:queueName/:jobId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get job status' })
  @ApiResponse({ status: 200, description: 'Job status retrieved successfully' })
  @ApiParam({ name: 'queueName', description: 'Queue name (sync, webhook, report)' })
  @ApiParam({ name: 'jobId', description: 'Job ID' })
  async getJobStatus(@Param('queueName') queueName: string, @Param('jobId') jobId: string) {
    return this.jobsService.getJobStatus(queueName, jobId);
  }

  @Get('stats/:queueName')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get queue statistics' })
  @ApiResponse({ status: 200, description: 'Queue statistics retrieved successfully' })
  @ApiParam({ name: 'queueName', description: 'Queue name (sync, webhook, report)' })
  async getQueueStats(@Param('queueName') queueName: string) {
    return this.jobsService.getQueueStats(queueName);
  }

  @Delete('cancel/:queueName/:jobId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Cancel a job' })
  @ApiResponse({ status: 200, description: 'Job cancelled successfully' })
  @ApiParam({ name: 'queueName', description: 'Queue name (sync, webhook, report)' })
  @ApiParam({ name: 'jobId', description: 'Job ID' })
  async cancelJob(@Param('queueName') queueName: string, @Param('jobId') jobId: string) {
    return this.jobsService.cancelJob(queueName, jobId);
  }

  @Delete('clear/:queueName')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Clear queue' })
  @ApiResponse({ status: 200, description: 'Queue cleared successfully' })
  @ApiParam({ name: 'queueName', description: 'Queue name (sync, webhook, report)' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Status to clear (waiting, active, completed, failed, delayed)',
  })
  async clearQueue(@Param('queueName') queueName: string, @Query('status') status?: string) {
    return this.jobsService.clearQueue(queueName, status);
  }
}
