import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
  Put,
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
import { AuthGuard } from '../../common/guards/auth.guard';
import { PermissionsGuard } from '../../common/guards/permissions.guard';
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
import { MoodleAdapterService } from './moodle-adapter.service';

@ApiTags('moodle')
@Controller('moodle-adapter')
export class MoodleAdapterController {
  constructor(private readonly moodleService: MoodleAdapterService) {}

  /**
   * Connection Test
   */
  @Get('test-connection')
  @ApiOperation({ summary: 'Test connection to Moodle' })
  @ApiResponse({ status: 200, description: 'Connection test result' })
  async testConnection() {
    return this.moodleService.testConnection();
  }

  /**
   * Site Information
   */
  @Get('site-info')
  @ApiOperation({ summary: 'Get Moodle site information' })
  @ApiResponse({ status: 200, description: 'Site information retrieved successfully' })
  async getSiteInfo() {
    return this.moodleService.getSiteInfo();
  }

  /**
   * User Management
   */
  @Get('users')
  @UseGuards(AuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get users from Moodle' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully', type: [MoodleUserDto] })
  @ApiQuery({ name: 'criteria', required: false, description: 'Search criteria for users' })
  async getUsers(@Query('criteria') criteria?: string) {
    const parsedCriteria = criteria ? JSON.parse(criteria) : [];
    return this.moodleService.getUsers(parsedCriteria);
  }

  @Get('users/by-field/:field')
  @UseGuards(AuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get users by field from Moodle' })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully', type: [MoodleUserDto] })
  @ApiParam({ name: 'field', description: 'Field to search by' })
  @ApiQuery({ name: 'values', description: 'Comma-separated values to search for' })
  async getUsersByField(@Param('field') field: string, @Query('values') values: string) {
    const valuesArray = values.split(',').map((v) => v.trim());
    return this.moodleService.getUsersByField(field, valuesArray);
  }

  @Post('users')
  @UseGuards(AuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create users in Moodle' })
  @ApiResponse({ status: 201, description: 'Users created successfully' })
  async createUsers(@Body() users: Partial<MoodleUserDto>[]) {
    return this.moodleService.createUsers(users);
  }

  @Put('users')
  @UseGuards(AuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update users in Moodle' })
  @ApiResponse({ status: 200, description: 'Users updated successfully' })
  async updateUsers(@Body() users: Partial<MoodleUserDto>[]) {
    return this.moodleService.updateUsers(users);
  }

  @Delete('users')
  @UseGuards(AuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete users from Moodle' })
  @ApiResponse({ status: 200, description: 'Users deleted successfully' })
  @ApiQuery({ name: 'userIds', description: 'Comma-separated user IDs to delete' })
  async deleteUsers(@Query('userIds') userIds: string) {
    const userIdsArray = userIds.split(',').map((id) => parseInt(id.trim()));
    return this.moodleService.deleteUsers(userIdsArray);
  }

  /**
   * Course Management
   */
  @Get('courses')
  @UseGuards(AuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get courses from Moodle' })
  @ApiResponse({
    status: 200,
    description: 'Courses retrieved successfully',
    type: [MoodleCourseDto],
  })
  @ApiQuery({ name: 'options', required: false, description: 'Search options for courses' })
  async getCourses(@Query('options') options?: string) {
    const parsedOptions = options ? JSON.parse(options) : {};
    return this.moodleService.getCourses(parsedOptions);
  }

  @Get('courses/by-field/:field')
  @UseGuards(AuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get courses by field from Moodle' })
  @ApiResponse({
    status: 200,
    description: 'Courses retrieved successfully',
    type: [MoodleCourseDto],
  })
  @ApiParam({ name: 'field', description: 'Field to search by' })
  @ApiQuery({ name: 'value', description: 'Value to search for' })
  async getCoursesByField(@Param('field') field: string, @Query('value') value: string) {
    return this.moodleService.getCoursesByField(field, value);
  }

  @Get('courses/:courseId/contents')
  @UseGuards(AuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get course contents from Moodle' })
  @ApiResponse({
    status: 200,
    description: 'Course contents retrieved successfully',
    type: [MoodleModuleDto],
  })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiQuery({ name: 'options', required: false, description: 'Options for content retrieval' })
  async getCourseContents(@Param('courseId') courseId: number, @Query('options') options?: string) {
    const parsedOptions = options ? JSON.parse(options) : {};
    return this.moodleService.getCourseContents(courseId, parsedOptions);
  }

  @Post('courses')
  @UseGuards(AuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create courses in Moodle' })
  @ApiResponse({ status: 201, description: 'Courses created successfully' })
  async createCourses(@Body() courses: Partial<MoodleCourseDto>[]) {
    return this.moodleService.createCourses(courses);
  }

  @Put('courses')
  @UseGuards(AuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update courses in Moodle' })
  @ApiResponse({ status: 200, description: 'Courses updated successfully' })
  async updateCourses(@Body() courses: Partial<MoodleCourseDto>[]) {
    return this.moodleService.updateCourses(courses);
  }

  /**
   * Enrollment Management
   */
  @Get('enrollments/course/:courseId')
  @UseGuards(AuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get enrolled users for a course' })
  @ApiResponse({
    status: 200,
    description: 'Enrolled users retrieved successfully',
    type: [MoodleEnrollmentDto],
  })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiQuery({ name: 'options', required: false, description: 'Options for enrollment retrieval' })
  async getEnrolledUsers(@Param('courseId') courseId: number, @Query('options') options?: string) {
    const parsedOptions = options ? JSON.parse(options) : {};
    return this.moodleService.getEnrolledUsers(courseId, parsedOptions);
  }

  @Get('enrollments/user/:userId')
  @UseGuards(AuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get courses for a user' })
  @ApiResponse({
    status: 200,
    description: 'User courses retrieved successfully',
    type: [MoodleCourseDto],
  })
  @ApiParam({ name: 'userId', description: 'User ID' })
  @ApiQuery({ name: 'options', required: false, description: 'Options for course retrieval' })
  async getUserCourses(@Param('userId') userId: number, @Query('options') options?: string) {
    const parsedOptions = options ? JSON.parse(options) : {};
    return this.moodleService.getUserCourses(userId, parsedOptions);
  }

  @Post('enrollments')
  @UseGuards(AuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Enroll users in courses' })
  @ApiResponse({ status: 201, description: 'Users enrolled successfully' })
  async enrolUsers(@Body() enrollments: { courseid: number; userid: number; roleid?: number }[]) {
    return this.moodleService.enrolUsers(enrollments);
  }

  @Delete('enrollments')
  @UseGuards(AuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Unenroll users from courses' })
  @ApiResponse({ status: 200, description: 'Users unenrolled successfully' })
  async unenrolUsers(@Body() enrollments: { courseid: number; userid: number }[]) {
    return this.moodleService.unenrolUsers(enrollments);
  }

  /**
   * Grade Management
   */
  @Get('grades/course/:courseId')
  @UseGuards(AuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get grades for a course' })
  @ApiResponse({
    status: 200,
    description: 'Grades retrieved successfully',
    type: [MoodleProgressDto],
  })
  @ApiParam({ name: 'courseId', description: 'Course ID' })
  @ApiQuery({ name: 'userId', required: false, description: 'User ID (optional)' })
  @ApiQuery({ name: 'options', required: false, description: 'Options for grade retrieval' })
  async getGrades(
    @Param('courseId') courseId: number,
    @Query('userId') userId?: number,
    @Query('options') options?: string,
  ) {
    const parsedOptions = options ? JSON.parse(options) : {};
    return this.moodleService.getGrades(courseId, userId, parsedOptions);
  }

  /**
   * Sync Operations
   */
  @Post('sync/users')
  @UseGuards(AuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync users from Moodle' })
  @ApiResponse({ status: 200, description: 'Users sync completed', type: SyncResultDto })
  async syncUsers(@Body() syncDto: SyncUsersDto) {
    return this.moodleService.syncUsers(syncDto);
  }

  @Post('sync/courses')
  @UseGuards(AuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync courses from Moodle' })
  @ApiResponse({ status: 200, description: 'Courses sync completed', type: SyncResultDto })
  async syncCourses(@Body() syncDto: SyncCoursesDto) {
    return this.moodleService.syncCourses(syncDto);
  }

  @Post('sync/enrollments')
  @UseGuards(AuthGuard, PermissionsGuard)
  @ApiBearerAuth()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Sync enrollments from Moodle' })
  @ApiResponse({ status: 200, description: 'Enrollments sync completed', type: SyncResultDto })
  async syncEnrollments(@Body() syncDto: SyncEnrollmentsDto) {
    return this.moodleService.syncEnrollments(syncDto);
  }
}
