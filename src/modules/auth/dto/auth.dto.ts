import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsObject, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;
}

export class RegisterDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123' })
  @IsString()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'john', required: false })
  @IsOptional()
  @IsString()
  username?: string;

  @ApiProperty({ example: 'John', required: false })
  @IsOptional()
  @IsString()
  firstName?: string;

  @ApiProperty({ example: 'Doe', required: false })
  @IsOptional()
  @IsString()
  lastName?: string;
}

export class RefreshTokenDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  @IsString()
  refreshToken: string;
}

export class OAuth2CallbackDto {
  @ApiProperty({ example: 'google' })
  @IsString()
  provider: string;

  @ApiProperty({ example: 'authorization_code' })
  @IsString()
  code: string;

  @ApiProperty({ example: 'http://localhost:3000/auth/callback' })
  @IsString()
  redirectUri: string;

  @ApiProperty({ example: 'state123', required: false })
  @IsOptional()
  @IsString()
  state?: string;
}

export class LTILaunchDto {
  @ApiProperty({ example: 'lti_launch_request' })
  @IsString()
  lti_message_type: string;

  @ApiProperty({ example: '1.3' })
  @IsString()
  lti_version: string;

  @ApiProperty({ example: 'consumer_key' })
  @IsString()
  oauth_consumer_key: string;

  @ApiProperty({ example: 'user123' })
  @IsString()
  user_id: string;

  @ApiProperty({ example: 'course123' })
  @IsString()
  context_id: string;

  @ApiProperty({ example: 'resource123' })
  @IsString()
  resource_link_id: string;

  @ApiProperty({ example: 'John Doe' })
  @IsString()
  lis_person_name_full: string;

  @ApiProperty({ example: 'john@example.com' })
  @IsString()
  lis_person_contact_email_primary: string;

  @ApiProperty({ example: 'signature', required: false })
  @IsOptional()
  @IsString()
  oauth_signature?: string;

  @ApiProperty({ example: 'timestamp', required: false })
  @IsOptional()
  @IsString()
  oauth_timestamp?: string;

  @ApiProperty({ example: 'nonce', required: false })
  @IsOptional()
  @IsString()
  oauth_nonce?: string;

  @ApiProperty({ example: {}, required: false })
  @IsOptional()
  @IsObject()
  custom?: Record<string, any>;
}

export class AuthResponseDto {
  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  accessToken: string;

  @ApiProperty({ example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...' })
  refreshToken: string;

  @ApiProperty({ example: '2024-12-31T23:59:59.999Z' })
  expiresIn: string;

  @ApiProperty({ example: 'bearer' })
  tokenType: string;
}

export class UserProfileDto {
  @ApiProperty({ example: 'user123' })
  id: string;

  @ApiProperty({ example: 'user@example.com' })
  email: string;

  @ApiProperty({ example: 'john_doe' })
  username: string;

  @ApiProperty({ example: 'John' })
  firstName: string;

  @ApiProperty({ example: 'Doe' })
  lastName: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg' })
  avatar: string;

  @ApiProperty({ example: true })
  isActive: boolean;

  @ApiProperty({ example: true })
  emailVerified: boolean;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  lastLoginAt: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  createdAt: string;

  @ApiProperty({ example: '2024-01-01T00:00:00.000Z' })
  updatedAt: string;
}
