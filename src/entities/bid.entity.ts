import { Entity, Column, ObjectIdColumn, CreateDateColumn, ManyToOne, JoinColumn, PrimaryGeneratedColumn } from 'typeorm';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Auction } from './auction.entity';
import { User } from './user.entity';

@Entity('bids')
export class Bid {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  @IsNotEmpty()
  auctionId: string;

  @ManyToOne(() => Auction, auction => auction.bids)
  @JoinColumn({ name: 'auctionId' })
  auction: Auction;

  @Column()
  @IsNotEmpty()
  bidUserId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'bidUserId' })
  bidUser: User;

  @Column({ type: 'float' })
  @IsNumber()
  @IsNotEmpty()
  bidPrice: number;

  @CreateDateColumn()
  timestamp: Date;
} 