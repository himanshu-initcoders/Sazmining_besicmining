import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { UserRole } from '../../entities/user.entity';

export class CreateUserDto {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsBoolean()
  @IsOptional()
  termsAgreed?: boolean = false;

  @IsOptional()
  @IsString()
  role?: UserRole = UserRole.USER;
}
