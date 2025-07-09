import { Entity, Column, ObjectIdColumn, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty, IsString, IsNumber } from 'class-validator';

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
} 