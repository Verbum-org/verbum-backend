import { HttpService } from '@nestjs/axios';
import { BadRequestException, HttpException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';
import {
  MoodleCourseDto,
  MoodleEnrollmentDto,
  MoodleModuleDto,
  MoodleProgressDto,
  MoodleUserDto,
  SyncCoursesDto,
  SyncEnrollmentsDto,
  SyncResultDto,
  SyncUsersDto,
} from './dto/moodle-adapter.dto';

@Injectable()
export class MoodleAdapterService {
  private readonly logger = new Logger(MoodleAdapterService.name);
  private readonly baseUrl: string;
  private readonly token: string;
  private readonly wsUrl: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly httpService: HttpService,
  ) {
    this.baseUrl = this.configService.get<string>('moodle.url');
    this.token = this.configService.get<string>('moodle.token');
    this.wsUrl = this.configService.get<string>('moodle.wsUrl');
  }

  /**
   * Core User Functions
   */

  async getUsers(criteria?: any): Promise<MoodleUserDto[]> {
    try {
      const response = await this.callMoodleFunction('core_user_get_users', {
        criteria: criteria || [],
      });
      return response.users || [];
    } catch (error) {
      this.logger.error('Error fetching users from Moodle:', error);
      throw new BadRequestException('Failed to fetch users from Moodle');
    }
  }

  async getUsersByField(field: string, values: string[]): Promise<MoodleUserDto[]> {
    try {
      const response = await this.callMoodleFunction('core_user_get_users_by_field', {
        field,
        values,
      });
      return response || [];
    } catch (error) {
      this.logger.error('Error fetching users by field from Moodle:', error);
      throw new BadRequestException('Failed to fetch users by field from Moodle');
    }
  }

  async createUsers(users: Partial<MoodleUserDto>[]): Promise<any[]> {
    try {
      const response = await this.callMoodleFunction('core_user_create_users', {
        users: users.map((user) => ({
          username: user.username,
          password: user.password || 'TempPassword123!',
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          auth: 'manual',
          suspended: user.suspended ? 1 : 0,
        })),
      });
      return response || [];
    } catch (error) {
      this.logger.error('Error creating users in Moodle:', error);
      throw new BadRequestException('Failed to create users in Moodle');
    }
  }

  async updateUsers(users: Partial<MoodleUserDto>[]): Promise<any[]> {
    try {
      const response = await this.callMoodleFunction('core_user_update_users', {
        users: users.map((user) => ({
          id: user.id,
          username: user.username,
          firstname: user.firstname,
          lastname: user.lastname,
          email: user.email,
          suspended: user.suspended ? 1 : 0,
        })),
      });
      return response || [];
    } catch (error) {
      this.logger.error('Error updating users in Moodle:', error);
      throw new BadRequestException('Failed to update users in Moodle');
    }
  }

  async deleteUsers(userIds: number[]): Promise<any[]> {
    try {
      const response = await this.callMoodleFunction('core_user_delete_users', {
        userids: userIds,
      });
      return response || [];
    } catch (error) {
      this.logger.error('Error deleting users in Moodle:', error);
      throw new BadRequestException('Failed to delete users in Moodle');
    }
  }

  /**
   * Core Course Functions
   */

  async getCourses(options?: any): Promise<MoodleCourseDto[]> {
    try {
      const response = await this.callMoodleFunction('core_course_get_courses', {
        options: options || {},
      });
      return response || [];
    } catch (error) {
      this.logger.error('Error fetching courses from Moodle:', error);
      throw new BadRequestException('Failed to fetch courses from Moodle');
    }
  }

  async getCoursesByField(field: string, value: string): Promise<MoodleCourseDto[]> {
    try {
      const response = await this.callMoodleFunction('core_course_get_courses_by_field', {
        field,
        value,
      });
      return response.courses || [];
    } catch (error) {
      this.logger.error('Error fetching courses by field from Moodle:', error);
      throw new BadRequestException('Failed to fetch courses by field from Moodle');
    }
  }

  async getCourseContents(courseId: number, options?: any): Promise<MoodleModuleDto[]> {
    try {
      const response = await this.callMoodleFunction('core_course_get_contents', {
        courseid: courseId,
        options: options || {},
      });
      return response || [];
    } catch (error) {
      this.logger.error('Error fetching course contents from Moodle:', error);
      throw new BadRequestException('Failed to fetch course contents from Moodle');
    }
  }

  async createCourses(courses: Partial<MoodleCourseDto>[]): Promise<any[]> {
    try {
      const response = await this.callMoodleFunction('core_course_create_courses', {
        courses: courses.map((course) => ({
          fullname: course.fullname,
          shortname: course.shortname,
          summary: course.summary || '',
          categoryid: course.categoryid || 1,
          visible: course.visible ? 1 : 0,
          startdate: course.startdate ? Math.floor(new Date(course.startdate).getTime() / 1000) : 0,
          enddate: course.enddate ? Math.floor(new Date(course.enddate).getTime() / 1000) : 0,
        })),
      });
      return response || [];
    } catch (error) {
      this.logger.error('Error creating courses in Moodle:', error);
      throw new BadRequestException('Failed to create courses in Moodle');
    }
  }

  async updateCourses(courses: Partial<MoodleCourseDto>[]): Promise<any[]> {
    try {
      const response = await this.callMoodleFunction('core_course_update_courses', {
        courses: courses.map((course) => ({
          id: course.id,
          fullname: course.fullname,
          shortname: course.shortname,
          summary: course.summary,
          visible: course.visible ? 1 : 0,
        })),
      });
      return response || [];
    } catch (error) {
      this.logger.error('Error updating courses in Moodle:', error);
      throw new BadRequestException('Failed to update courses in Moodle');
    }
  }

  /**
   * Core Enrolment Functions
   */

  async getEnrolledUsers(courseId: number, options?: any): Promise<MoodleEnrollmentDto[]> {
    try {
      const response = await this.callMoodleFunction('core_enrol_get_enrolled_users', {
        courseid: courseId,
        options: options || {},
      });
      return response || [];
    } catch (error) {
      this.logger.error('Error fetching enrolled users from Moodle:', error);
      throw new BadRequestException('Failed to fetch enrolled users from Moodle');
    }
  }

  async enrolUsers(
    enrollments: { courseid: number; userid: number; roleid?: number }[],
  ): Promise<any[]> {
    try {
      const response = await this.callMoodleFunction('core_enrol_enrol_users', {
        enrolments: enrollments.map((enrollment) => ({
          courseid: enrollment.courseid,
          userid: enrollment.userid,
          roleid: enrollment.roleid || 5, // Student role by default
        })),
      });
      return response || [];
    } catch (error) {
      this.logger.error('Error enrolling users in Moodle:', error);
      throw new BadRequestException('Failed to enrol users in Moodle');
    }
  }

  async unenrolUsers(enrollments: { courseid: number; userid: number }[]): Promise<any[]> {
    try {
      const response = await this.callMoodleFunction('core_enrol_unenrol_users', {
        enrolments: enrollments,
      });
      return response || [];
    } catch (error) {
      this.logger.error('Error unenrolling users in Moodle:', error);
      throw new BadRequestException('Failed to unenrol users in Moodle');
    }
  }

  async getUserCourses(userId: number, options?: any): Promise<MoodleCourseDto[]> {
    try {
      const response = await this.callMoodleFunction('core_enrol_get_users_courses', {
        userid: userId,
        options: options || {},
      });
      return response || [];
    } catch (error) {
      this.logger.error('Error fetching user courses from Moodle:', error);
      throw new BadRequestException('Failed to fetch user courses from Moodle');
    }
  }

  /**
   * Core Grade Functions
   */

  async getGrades(courseId: number, userId?: number, options?: any): Promise<MoodleProgressDto[]> {
    try {
      const params: any = {
        courseid: courseId,
        options: options || {},
      };

      if (userId) {
        params.userid = userId;
      }

      const response = await this.callMoodleFunction('core_grades_get_grades', params);
      return response || [];
    } catch (error) {
      this.logger.error('Error fetching grades from Moodle:', error);
      throw new BadRequestException('Failed to fetch grades from Moodle');
    }
  }

  /**
   * Core Webservice Functions
   */

  async getSiteInfo(): Promise<any> {
    try {
      const response = await this.callMoodleFunction('core_webservice_get_site_info');
      return response;
    } catch (error) {
      this.logger.error('Error fetching site info from Moodle:', error);
      throw new BadRequestException('Failed to fetch site info from Moodle');
    }
  }

  /**
   * Sync Functions
   */

  async syncUsers(syncDto: SyncUsersDto): Promise<SyncResultDto> {
    try {
      this.logger.log(`Starting users sync - Page: ${syncDto.page}, PerPage: ${syncDto.perPage}`);

      const users = await this.getUsers({
        page: syncDto.page,
        perpage: syncDto.perPage,
      });

      const result: SyncResultDto = {
        created: 0,
        updated: 0,
        errors: 0,
        completedAt: new Date().toISOString(),
        errorMessages: [],
      };

      // Here you would implement the logic to save/update users in your database
      // This is a placeholder implementation
      for (const user of users) {
        try {
          // Check if user exists in your database
          // If exists and forceUpdate, update it
          // If not exists, create it
          result.created++;
        } catch (error) {
          result.errors++;
          result.errorMessages.push(`Error syncing user ${user.id}: ${error.message}`);
        }
      }

      this.logger.log(
        `Users sync completed - Created: ${result.created}, Updated: ${result.updated}, Errors: ${result.errors}`,
      );
      return result;
    } catch (error) {
      this.logger.error('Error in users sync:', error);
      throw new BadRequestException('Failed to sync users');
    }
  }

  async syncCourses(syncDto: SyncCoursesDto): Promise<SyncResultDto> {
    try {
      this.logger.log(`Starting courses sync - Page: ${syncDto.page}, PerPage: ${syncDto.perPage}`);

      const courses = await this.getCourses({
        page: syncDto.page,
        perpage: syncDto.perPage,
      });

      const result: SyncResultDto = {
        created: 0,
        updated: 0,
        errors: 0,
        completedAt: new Date().toISOString(),
        errorMessages: [],
      };

      // Here you would implement the logic to save/update courses in your database
      for (const course of courses) {
        try {
          // Check if course exists in your database
          // If exists and forceUpdate, update it
          // If not exists, create it
          result.created++;
        } catch (error) {
          result.errors++;
          result.errorMessages.push(`Error syncing course ${course.id}: ${error.message}`);
        }
      }

      this.logger.log(
        `Courses sync completed - Created: ${result.created}, Updated: ${result.updated}, Errors: ${result.errors}`,
      );
      return result;
    } catch (error) {
      this.logger.error('Error in courses sync:', error);
      throw new BadRequestException('Failed to sync courses');
    }
  }

  async syncEnrollments(syncDto: SyncEnrollmentsDto): Promise<SyncResultDto> {
    try {
      this.logger.log(
        `Starting enrollments sync - CourseId: ${syncDto.courseId}, UserId: ${syncDto.userId}`,
      );

      let enrollments: any[] = [];

      if (syncDto.courseId) {
        enrollments = await this.getEnrolledUsers(syncDto.courseId);
      } else if (syncDto.userId) {
        const courses = await this.getUserCourses(syncDto.userId);
        // Process enrollments for each course
        for (const course of courses) {
          const courseEnrollments = await this.getEnrolledUsers(course.id);
          enrollments.push(...courseEnrollments);
        }
      }

      const result: SyncResultDto = {
        created: 0,
        updated: 0,
        errors: 0,
        completedAt: new Date().toISOString(),
        errorMessages: [],
      };

      // Here you would implement the logic to save/update enrollments in your database
      for (const enrollment of enrollments) {
        try {
          // Check if enrollment exists in your database
          // If exists and forceUpdate, update it
          // If not exists, create it
          result.created++;
        } catch (error) {
          result.errors++;
          result.errorMessages.push(`Error syncing enrollment: ${error.message}`);
        }
      }

      this.logger.log(
        `Enrollments sync completed - Created: ${result.created}, Updated: ${result.updated}, Errors: ${result.errors}`,
      );
      return result;
    } catch (error) {
      this.logger.error('Error in enrollments sync:', error);
      throw new BadRequestException('Failed to sync enrollments');
    }
  }

  /**
   * Private helper method to call Moodle Web Services
   */
  private async callMoodleFunction(functionName: string, params: any = {}): Promise<any> {
    try {
      const url = `${this.wsUrl}?wstoken=${this.token}&wsfunction=${functionName}&moodlewsrestformat=json`;

      const response = await firstValueFrom(
        this.httpService.post(url, params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }),
      );

      if (response.data.errorcode) {
        throw new Error(`Moodle API Error: ${response.data.errorcode} - ${response.data.message}`);
      }

      return response.data;
    } catch (error) {
      this.logger.error(`Error calling Moodle function ${functionName}:`, error);
      throw new HttpException(
        `Failed to call Moodle function ${functionName}: ${error.message}`,
        500,
      );
    }
  }

  /**
   * Test connection to Moodle
   */
  async testConnection(): Promise<{ success: boolean; message: string; data?: any }> {
    try {
      const siteInfo = await this.getSiteInfo();
      return {
        success: true,
        message: 'Successfully connected to Moodle',
        data: {
          siteName: siteInfo.sitename,
          version: siteInfo.version,
          url: siteInfo.siteurl,
        },
      };
    } catch (error) {
      return {
        success: false,
        message: `Failed to connect to Moodle: ${error.message}`,
      };
    }
  }
}

