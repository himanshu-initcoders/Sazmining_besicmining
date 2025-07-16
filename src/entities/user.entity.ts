import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';
import {
  IsEmail,
  IsNotEmpty,
  IsString,
  MinLength,
  IsBoolean,
  IsInt,
  IsOptional,
} from 'class-validator';
import { Cart } from './cart.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
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
    default: UserRole.USER,
  })
  role: string;

  @Column({ default: false })
  @IsBoolean()
  termsAgreed: boolean;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  username?: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  name?: string;

  @Column({ nullable: true })
  @IsString()
  @IsOptional()
  phone: string;

  @Column({ default: 0 })
  @IsInt()
  profileCompletion: number;

  @OneToOne(() => Cart, (cart) => cart.user, { cascade: true })
  cart: Cart;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  deviceToken: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  profilePhoto: string;

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
