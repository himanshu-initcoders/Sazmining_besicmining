import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { IsNotEmpty, IsString, IsNumber, IsBoolean } from 'class-validator';
import { User } from './user.entity';
import { Product } from './product.entity';

@Entity('contracts')
export class Contract {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsString()
  @IsNotEmpty()
  contractId: string;

  @Column()
  @IsString()
  @IsNotEmpty()
  location: string;

  @Column({ type: 'float' })
  @IsNumber()
  depositPrice: number;

  @Column({ type: 'float' })
  @IsNumber()
  setupPrice: number;

  @Column({ type: 'float' })
  @IsNumber()
  hostRate: number;

  @Column({ type: 'float' })
  @IsNumber()
  salesTaxPercent: number;
  
  @Column({ default: false })
  @IsBoolean()
  autoMaintenance: boolean;
  
  @Column()
  @IsNumber()
  buyerId: number;
  
  @ManyToOne(() => User)
  @JoinColumn({ name: 'buyerId' })
  buyer: User;
  
  @Column()
  @IsNumber()
  productId: number;
  
  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
