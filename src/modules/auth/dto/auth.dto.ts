import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UserRole } from '../../../common/plans/plan.types';

/**
 * DTO para dados do usuário no registro
 */
export class RegisterUserDto {
  @ApiProperty({ example: 'admin@escola.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Senha123!', minLength: 6 })
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @ApiProperty({ example: 'João' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Silva' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiPropertyOptional({ example: '+5511999999999' })
  @IsString()
  @IsOptional()
  phone?: string;
}

/**
 * DTO para dados da organização no registro
 */
export class RegisterOrganizationDto {
  @ApiProperty({ example: 'Escola Municipal ABC' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'Escola de ensino fundamental e médio' })
  @IsString()
  @IsOptional()
  description?: string;
}

/**
 * DTO para registro completo (cria trial_account + organization + admin user)
 */
export class RegisterDto {
  @ApiProperty({ type: RegisterUserDto })
  @ValidateNested()
  @Type(() => RegisterUserDto)
  @IsNotEmpty()
  user: RegisterUserDto;

  @ApiProperty({ type: RegisterOrganizationDto })
  @ValidateNested()
  @Type(() => RegisterOrganizationDto)
  @IsNotEmpty()
  organization: RegisterOrganizationDto;
}

/**
 * DTO para login
 */
export class LoginDto {
  @ApiProperty({ example: 'admin@escola.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Senha123!' })
  @IsString()
  @IsNotEmpty()
  password: string;
}

/**
 * DTO de resposta de autenticação
 */
export class AuthResponseDto {
  @ApiProperty()
  accessToken: string;

  @ApiProperty()
  refreshToken: string;

  @ApiProperty()
  tokenType: string;

  @ApiProperty()
  expiresIn: number;

  @ApiProperty()
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    fullName: string;
    role: UserRole;
    organizationId: string;
    trialAccountId: string;
    isTrialOwner: boolean;
    isActive: boolean;
    emailVerified: boolean;
    createdAt: string;
  };

  @ApiProperty()
  organization: {
    id: string;
    name: string;
    slug: string;
    isActive: boolean;
    createdAt: string;
  };

  @ApiProperty()
  trialAccount?: {
    id: string;
    companyName: string;
    trialStartsAt: string;
    trialEndsAt: string;
    status: string;
    plan: string;
    isExpired: boolean;
    daysRemaining: number;
    createdAt: string;
  };
}

/**
 * DTO para refresh token
 */
export class RefreshTokenDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  refreshToken: string;
}

/**
 * DTO para convidar usuário
 */
export class InviteUserDto {
  @ApiProperty({ example: 'maria@escola.com' })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({ example: 'Maria' })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({ example: 'Santos' })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({ enum: UserRole, example: UserRole.PROFESSOR })
  @IsString()
  @IsNotEmpty()
  role: UserRole;

  @ApiPropertyOptional({ example: '+5511999999999' })
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional({ example: 'História' })
  @IsString()
  @IsOptional()
  department?: string;

  @ApiPropertyOptional({ example: 'Humanas' })
  @IsString()
  @IsOptional()
  course?: string;

  @ApiPropertyOptional({ example: '8º Ano' })
  @IsString()
  @IsOptional()
  grade?: string;

  @ApiPropertyOptional()
  @IsOptional()
  customPermissions?: string[];
}

// Legacy DTOs for backward compatibility
export class LTILaunchDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  ltiToken: string;
}

export class OAuth2CallbackDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  code: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  state: string;
}
