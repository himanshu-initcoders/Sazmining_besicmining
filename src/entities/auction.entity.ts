import { Entity, Column, ObjectIdColumn, CreateDateColumn, UpdateDateColumn, OneToMany, ManyToOne, JoinColumn } from 'typeorm';
import { IsNotEmpty, IsNumber } from 'class-validator';
import { Product } from './product.entity';
import { User } from './user.entity';
import { Bid } from './bid.entity';

export enum AuctionStatus {
  PENDING = 'Pending',
  ACTIVE = 'Active',
  COMPLETED = 'Completed',
  CANCELLED = 'Cancelled'
}

@Entity('auctions')
export class Auction {
  @ObjectIdColumn()
  id: string;

  @Column()
  @IsNotEmpty()
  productId: string;

  @ManyToOne(() => Product)
  @JoinColumn({ name: 'productId' })
  product: Product;

  @Column({ nullable: true })
  bidderId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'bidderId' })
  bidder: User;

  @Column()
  @IsNotEmpty()
  publisherId: string;

  @ManyToOne(() => User)
  @JoinColumn({ name: 'publisherId' })
  publisher: User;

  @Column({ type: 'float' })
  @IsNumber()
  @IsNotEmpty()
  productPrice: number;

  @Column({
    type: 'enum',
    enum: AuctionStatus,
    default: AuctionStatus.PENDING
  })
  auctionStatus: string;

  @OneToMany(() => Bid, bid => bid.auctionId)
  bids: Bid[];

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}