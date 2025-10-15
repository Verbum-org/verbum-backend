import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsEmail, IsOptional, IsBoolean, IsUrl, IsObject } from 'class-validator';

/**
 * DTO para atualizar organização
 */
export class UpdateOrganizationDto {
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  name?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  phone?: string;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  website?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  address?: Record<string, any>;

  @ApiPropertyOptional()
  @IsUrl()
  @IsOptional()
  logoUrl?: string;

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  brandColors?: {
    primary?: string;
    secondary?: string;
  };

  @ApiPropertyOptional()
  @IsObject()
  @IsOptional()
  settings?: Record<string, any>;

  @ApiPropertyOptional()
  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

/**
 * DTO de resposta da organização
 */
export class OrganizationDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  trialAccountId: string;

  @ApiProperty()
  name: string;

  @ApiProperty()
  slug: string;

  @ApiPropertyOptional()
  description?: string;

  @ApiPropertyOptional()
  email?: string;

  @ApiPropertyOptional()
  phone?: string;

  @ApiPropertyOptional()
  website?: string;

  @ApiPropertyOptional()
  address?: Record<string, any>;

  @ApiPropertyOptional()
  logoUrl?: string;

  @ApiProperty()
  brandColors: {
    primary: string;
    secondary: string;
  };

  @ApiProperty()
  settings: Record<string, any>;

  @ApiProperty()
  isActive: boolean;

  @ApiProperty()
  createdAt: string;

  @ApiProperty()
  updatedAt: string;

  // Dados do plano (opcional)
  @ApiPropertyOptional()
  plan?: {
    type: string;
    status: string;
    isExpired: boolean;
    trialEndsAt?: string;
    daysRemaining?: number;
  };
}
