import { IsEmail, IsString, MinLength, IsBoolean, IsOptional } from 'class-validator';
import { UserRole } from '../../entities/user.entity';

export class UpdateUserDto {
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @IsOptional()
  username?: string;

  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  @MinLength(6)
  password?: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsBoolean()
  @IsOptional()
  termsAgreed?: boolean;

  @IsOptional()
  @IsString()
  role?: UserRole;

  @IsOptional()
  @IsString()
  deviceToken?: string;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
} 