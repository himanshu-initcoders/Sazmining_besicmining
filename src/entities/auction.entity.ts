import {
  Entity,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { IsNotEmpty, IsNumber, IsOptional, IsDate } from 'class-validator';
import { Product } from './product.entity';
import { User } from './user.entity';
import { Bid } from './bid.entity';

export enum AuctionStatus {
  PENDING = 'Pending',
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled',
}

@Entity('auctions')
export class Auction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  productId: number;

  @ManyToOne(() => Product, (product) => product.auctions)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ nullable: true })
  @IsNumber()
  bidderId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'bidderId' })
  bidder: User;

  @Column()
  @IsNotEmpty()
  @IsNumber()
  publisherId: number;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'publisherId' })
  publisher: User;

  @Column({ type: 'float' })
  @IsNumber()
  @IsNotEmpty()
  startingPrice: number;

  @Column({ type: 'timestamp' })
  @IsNotEmpty()
  @IsDate()
  startDate: Date;

  @Column({ type: 'timestamp' })
  @IsNotEmpty()
  @IsDate()
  endDate: Date;

  @Column({
    type: 'enum',
    enum: AuctionStatus,
    default: AuctionStatus.PENDING,
  })
  auctionStatus: string;

  @OneToMany(() => Bid, (bid) => bid.auction)
  bids: Bid[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
