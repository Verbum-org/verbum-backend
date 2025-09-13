import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { Public } from '../../common/decorators/public.decorator';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { UserResponseDto } from '../users/dto/user.dto';
import { AuthSimpleService } from './auth-simple.service';
import {
  LoginDto,
  LTILaunchDto,
  OAuth2CallbackDto,
  RefreshTokenDto,
  RegisterDto,
} from './dto/auth.dto';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthSimpleService) {}

  @Post('register')
  @Public()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user' })
  @ApiResponse({ status: 201, description: 'User registered successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async register(@Body(ValidationPipe) registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Login user' })
  @ApiResponse({ status: 200, description: 'Login successful' })
  @ApiResponse({ status: 401, description: 'Invalid credentials' })
  async login(@Body(ValidationPipe) loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Refresh access token' })
  @ApiResponse({ status: 200, description: 'Token refreshed successfully' })
  @ApiResponse({ status: 401, description: 'Invalid refresh token' })
  async refresh(@Body(ValidationPipe) refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout user' })
  @ApiResponse({ status: 200, description: 'Logout successful' })
  async logout(@CurrentUser('id') userId: string) {
    return this.authService.logout(userId);
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({
    status: 200,
    description: 'Profile retrieved successfully',
    type: UserResponseDto,
  })
  async getProfile(@CurrentUser() user: any) {
    return this.authService.getProfile(user.id);
  }

  @Post('oauth2/callback')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'OAuth2 callback handler' })
  @ApiResponse({ status: 200, description: 'OAuth2 authentication successful' })
  @ApiResponse({ status: 400, description: 'Invalid OAuth2 callback' })
  async oauth2Callback(@Body(ValidationPipe) oauth2CallbackDto: OAuth2CallbackDto) {
    return this.authService.handleOAuth2Callback(oauth2CallbackDto);
  }

  @Post('lti/launch')
  @Public()
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'LTI launch handler' })
  @ApiResponse({ status: 200, description: 'LTI launch successful' })
  @ApiResponse({ status: 400, description: 'Invalid LTI launch' })
  async ltiLaunch(@Body(ValidationPipe) ltiLaunchDto: LTILaunchDto) {
    return this.authService.handleLTILaunch(ltiLaunchDto);
  }

  @Post('moodle/sync')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Sync user with Moodle' })
  @ApiResponse({ status: 200, description: 'Moodle sync successful' })
  @ApiResponse({ status: 400, description: 'Moodle sync failed' })
  async syncWithMoodle(@CurrentUser('id') userId: string) {
    return this.authService.syncWithMoodle(userId);
  }
}
