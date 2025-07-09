import { Exclude, Expose, Type } from 'class-transformer';
import { UserRole } from '../../entities/user.entity';

export class UserResponseDto {
  id: number;
  email: string;
  username: string;
  name: string;
  role: UserRole;
  profileCompletion: number;
  phone?: string;
  profilePhoto?: string;
  termsAgreed: boolean;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;

  @Expose()
  get isProfileComplete(): boolean {
    return this.profileCompletion === 100;
  }
}

export class SignupResponseDto {
  access_token: string;
  
  @Type(() => UserResponseDto)
  user: UserResponseDto;
} 