import { Process, Processor } from '@nestjs/bull';
import { Inject, Logger } from '@nestjs/common';
import {
  SyncCoursesDto,
  SyncEnrollmentsDto,
  SyncUsersDto,
} from '../../moodle-adapter/dto/moodle-adapter.dto';
import { MoodleAdapterService } from '../../moodle-adapter/moodle-adapter.service';

@Processor('sync')
export class SyncProcessor {
  private readonly logger = new Logger(SyncProcessor.name);

  constructor(
    @Inject(MoodleAdapterService)
    private readonly moodleService: MoodleAdapterService,
  ) {}

  @Process('users')
  async processUsersSync(job: any) {
    this.logger.log('Processing users sync job...');

    try {
      const { page = 1, perPage = 50, forceUpdate = false } = job.data;

      const syncDto: SyncUsersDto = {
        page,
        perPage,
        forceUpdate,
      };

      const result = await this.moodleService.syncUsers(syncDto);

      this.logger.log(
        `Users sync completed - Created: ${result.created}, Updated: ${result.updated}, Errors: ${result.errors}`,
      );

      return {
        success: true,
        result,
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error processing users sync job:', error);
      throw error;
    }
  }

  @Process('courses')
  async processCoursesSync(job: any) {
    this.logger.log('Processing courses sync job...');

    try {
      const { page = 1, perPage = 50, forceUpdate = false, categoryIds } = job.data;

      const syncDto: SyncCoursesDto = {
        page,
        perPage,
        forceUpdate,
        categoryIds,
      };

      const result = await this.moodleService.syncCourses(syncDto);

      this.logger.log(
        `Courses sync completed - Created: ${result.created}, Updated: ${result.updated}, Errors: ${result.errors}`,
      );

      return {
        success: true,
        result,
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error processing courses sync job:', error);
      throw error;
    }
  }

  @Process('enrollments')
  async processEnrollmentsSync(job: any) {
    this.logger.log('Processing enrollments sync job...');

    try {
      const { courseId, userId, forceUpdate = false } = job.data;

      const syncDto: SyncEnrollmentsDto = {
        courseId,
        userId,
        forceUpdate,
      };

      const result = await this.moodleService.syncEnrollments(syncDto);

      this.logger.log(
        `Enrollments sync completed - Created: ${result.created}, Updated: ${result.updated}, Errors: ${result.errors}`,
      );

      return {
        success: true,
        result,
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error processing enrollments sync job:', error);
      throw error;
    }
  }

  @Process('all')
  async processAllSync(job: any) {
    this.logger.log('Processing all sync job...');

    try {
      const { page = 1, perPage = 50, forceUpdate = false } = job.data;

      const results = {
        users: null,
        courses: null,
        enrollments: null,
      };

      // Sync users
      try {
        this.logger.log('Starting users sync...');
        const usersResult = await this.moodleService.syncUsers({ page, perPage, forceUpdate });
        results.users = usersResult;
        this.logger.log('Users sync completed');
      } catch (error) {
        this.logger.error('Error in users sync:', error);
        results.users = { error: error.message };
      }

      // Sync courses
      try {
        this.logger.log('Starting courses sync...');
        const coursesResult = await this.moodleService.syncCourses({ page, perPage, forceUpdate });
        results.courses = coursesResult;
        this.logger.log('Courses sync completed');
      } catch (error) {
        this.logger.error('Error in courses sync:', error);
        results.courses = { error: error.message };
      }

      // Sync enrollments
      try {
        this.logger.log('Starting enrollments sync...');
        const enrollmentsResult = await this.moodleService.syncEnrollments({ forceUpdate });
        results.enrollments = enrollmentsResult;
        this.logger.log('Enrollments sync completed');
      } catch (error) {
        this.logger.error('Error in enrollments sync:', error);
        results.enrollments = { error: error.message };
      }

      this.logger.log('All sync operations completed');

      return {
        success: true,
        results,
        completedAt: new Date().toISOString(),
      };
    } catch (error) {
      this.logger.error('Error processing all sync job:', error);
      throw error;
    }
  }
}
