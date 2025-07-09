import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsBoolean,
  IsOptional,
} from 'class-validator';
import { Transform } from 'class-transformer';

export class SignupDto {
  @IsEmail()
  @IsNotEmpty()
  @Transform(({ value }) => value.toLowerCase().trim())
  email: string;

  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;

  @IsString()
  @IsOptional()
  phone?: string;

  @IsBoolean()
  @IsNotEmpty()
  termsAgreed: boolean;
}
