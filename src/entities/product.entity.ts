import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  PrimaryGeneratedColumn,
  JoinColumn,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import {
  IsNotEmpty,
  IsString,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsUrl,
} from 'class-validator';
import { User } from './user.entity';
import { Auction } from './auction.entity';

export enum ProductType {
  MARKETPLACE = 'marketplace',
  RETAIL = 'retail',
}

export enum CoolingType {
  AIR = 'air',
  LIQUID = 'liquid',
  IMMERSION = 'immersion',
  WATER = 'water',
}

export enum ProductStatus {
  ONLINE = 'Online',
  OFFLINE = 'Offline',
  MAINTENANCE = 'Maintenance',
}

export enum PublishStatus {
  MINING = 'Mining',
  PUBLISHED = 'Published',
  DRAFT = 'Draft',
  PENDING = 'Pending',
}

export enum AvailabilityStatus {
  IN_STOCK = 'In Stock',
  OUT_OF_STOCK = 'Out of Stock',
  PRE_ORDER = 'Pre Order',
}

export enum StockType {
  LIMITED = 'limited',
  UNLIMITED = 'unlimited',
}

@Entity('products')
export class Product {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  sku: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  serialNumber: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  modelName: string;

  @Column()
  @IsString()
  description: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  @IsUrl()
  imageUrl: string;

  @Column({ default: true })
  @IsBoolean()
  isActive: boolean;

  @Column({ type: 'float' })
  @IsNumber()
  hashRate: number;

  @Column({ type: 'float' })
  @IsNumber()
  power: number;

  @Column({ type: 'float' })
  @IsNumber()
  efficiency: number;

  @Column({ default: false })
  @IsBoolean()
  disableBuyNow: boolean;

  @Column({
    type: 'enum',
    enum: ProductType,
    default: ProductType.MARKETPLACE,
  })
  type: string;

  @Column({ nullable: true })
  @IsOptional()
  @IsString()
  location: string;

  @Column({
    type: 'enum',
    enum: CoolingType,
    default: CoolingType.AIR,
  })
  cooling: string;

  @Column()
  @IsString()
  manufacturer: string;

  @Column({
    type: 'enum',
    enum: ProductStatus,
    default: ProductStatus.ONLINE,
  })
  productStatus: string;

  @Column({
    type: 'enum',
    enum: PublishStatus,
    default: PublishStatus.DRAFT,
  })
  status: string;

  @Column({
    type: 'enum',
    enum: AvailabilityStatus,
    default: AvailabilityStatus.IN_STOCK,
  })
  availability: string;

  @Column({ type: 'float' })
  @IsNumber()
  askPrice: number;

  @Column({ nullable: true })
  @IsOptional()
  contractId: string;

  @Column({ nullable: true, type: 'float' })
  @IsOptional()
  @IsNumber()
  shippingPrice: number;

  @Column({ default: false })
  @IsBoolean()
  hosting: boolean;

  @Column({
    type: 'enum',
    enum: StockType,
    default: StockType.LIMITED,
  })
  stockType: string;

  @Column({ default: 0 })
  @IsNumber()
  quantity: number;

  @OneToMany(() => Auction, (auction) => auction.product)
  auctions: Auction[];

  @ManyToOne(() => User, (user) => user.id)
  @JoinColumn({ name: 'userId' })
  user: User;

  @Column({ nullable: true })
  @IsOptional()
  @IsNumber()
  userId?: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
