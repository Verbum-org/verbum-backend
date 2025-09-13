import {
  BadRequestException,
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/mongoose';
import * as bcrypt from 'bcrypt';
import { Model } from 'mongoose';
import { RedisService } from '../../common/redis/redis.service';
import { User, UserDocument } from '../../schemas/user.schema';
import { AuthResponseDto, LoginDto, RegisterDto, UserProfileDto } from './dto/auth.dto';

@Injectable()
export class AuthSimpleService {
  private readonly logger = new Logger(AuthSimpleService.name);

  constructor(
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly redisService: RedisService,
  ) {}

  async validateUser(email: string, password: string): Promise<any> {
    const user = await this.userModel.findOne({ email }).exec();

    if (user && (await bcrypt.compare(password, user.password))) {
      const { password: _, ...result } = user.toObject();
      return result;
    }
    return null;
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    const { email, password, username, firstName, lastName } = registerDto;

    // Check if user already exists
    const existingUser = await this.userModel
      .findOne({
        $or: [{ email }, ...(username ? [{ username }] : [])],
      })
      .exec();

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = new this.userModel({
      email,
      password: hashedPassword,
      username,
      firstName,
      lastName,
      isActive: true,
      isEmailVerified: false,
      roles: ['user'],
    });
    await user.save();

    // Generate tokens
    const tokens = await this.generateTokens(user._id.toString());

    this.logger.log(`User registered: ${email}`);

    return tokens;
  }

  async login(loginDto: LoginDto): Promise<AuthResponseDto> {
    const { email, password } = loginDto;

    // Find user
    const user = await this.userModel.findOne({ email }).exec();

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is disabled');
    }

    // Update last login
    user.lastLoginAt = new Date();
    await user.save();

    // Generate tokens
    const tokens = await this.generateTokens(user._id.toString());

    this.logger.log(`User logged in: ${email}`);

    return tokens;
  }

  async refreshToken(refreshToken: string): Promise<AuthResponseDto> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get('jwt.refreshSecret'),
      });

      const user = await this.userModel.findById(payload.sub).exec();

      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user._id.toString());
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async getProfile(userId: string): Promise<UserProfileDto> {
    const user = await this.userModel.findById(userId).exec();

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user._id.toString(),
      email: user.email,
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar,
      isActive: user.isActive,
      emailVerified: user.isEmailVerified,
      lastLoginAt: user.lastLoginAt?.toISOString(),
      // roles: user.roles, // Will be added later
      createdAt: (user as any).createdAt,
      updatedAt: (user as any).updatedAt,
    };
  }

  private async generateTokens(userId: string): Promise<AuthResponseDto> {
    const payload = { sub: userId, type: 'access' };
    const refreshPayload = { sub: userId, type: 'refresh' };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get('jwt.secret'),
        expiresIn: this.configService.get('jwt.expiresIn'),
      }),
      this.jwtService.signAsync(refreshPayload, {
        secret: this.configService.get('jwt.refreshSecret'),
        expiresIn: this.configService.get('jwt.refreshExpiresIn'),
      }),
    ]);

    // Store refresh token in Redis
    await this.redisService.set(
      `refresh_token:${userId}`,
      refreshToken,
      7 * 24 * 60 * 60, // 7 days
    );

    return {
      accessToken,
      refreshToken,
      tokenType: 'Bearer',
      expiresIn: this.configService.get('jwt.expiresIn'),
    };
  }

  async logout(userId: string): Promise<{ message: string }> {
    // Remove refresh token from Redis
    await this.redisService.del(`refresh_token:${userId}`);

    this.logger.log(`User logged out: ${userId}`);

    return { message: 'Logout successful' };
  }

  async handleOAuth2Callback(oauth2CallbackDto: any): Promise<AuthResponseDto> {
    // OAuth2 implementation will be added later
    throw new BadRequestException('OAuth2 not implemented yet');
  }

  async handleLTILaunch(ltiLaunchDto: any): Promise<AuthResponseDto> {
    // LTI implementation will be added later
    throw new BadRequestException('LTI not implemented yet');
  }

  async syncWithMoodle(userId: string): Promise<{ message: string }> {
    try {
      // Here you would implement the logic to sync a specific user with Moodle
      // This is a placeholder implementation
      this.logger.log(`Syncing user ${userId} with Moodle...`);

      // You could call the MoodleAdapterService here to sync the user
      // const moodleService = this.moduleRef.get(MoodleAdapterService);
      // await moodleService.syncUsers({ page: 1, perPage: 1, forceUpdate: true });

      return {
        message: `User ${userId} sync with Moodle completed successfully`,
      };
    } catch (error) {
      this.logger.error(`Error syncing user ${userId} with Moodle:`, error);
      throw new BadRequestException(`Failed to sync user with Moodle: ${error.message}`);
    }
  }
}
