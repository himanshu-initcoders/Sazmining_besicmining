import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuctionController } from './auction.controller';
import { AuctionService } from './auction.service';
import { Auction } from '../entities/auction.entity';
import { Bid } from '../entities/bid.entity';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { Contract } from '../entities/contract.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Auction, Bid, Product, User, Contract])],
  controllers: [AuctionController],
  providers: [AuctionService],
  exports: [AuctionService],
})
export class AuctionModule {} 