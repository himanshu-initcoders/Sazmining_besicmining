import { Entity, Column, ObjectIdColumn, CreateDateColumn, UpdateDateColumn, OneToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import { IsEmail, IsNotEmpty, IsString, MinLength, IsBoolean, IsInt, IsOptional } from 'class-validator';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

@Entity('users')
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ unique: true })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER
  })
  role: string;

  @Column({ default: false })
  @IsBoolean()
  termsAgreed: boolean;

  @Column()
  @IsString()
  @IsNotEmpty()
  username: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  name: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  phone: string;

  @Column({ default: 0 })
  @IsInt()
  profileCompletion: number;

  @Column({ nullable: true })
  cartId: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  deviceToken: string;

  @Column()
  @IsNotEmpty()
  @MinLength(6)
  @Exclude({ toPlainOnly: true })
  password: string;

  @Column({ default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Expose()
  get isProfileComplete(): boolean {
    return this.profileCompletion === 100;
  }
} 