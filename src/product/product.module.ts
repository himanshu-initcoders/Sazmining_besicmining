import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ProductService } from './product.service';
import { ProductController } from './product.controller';
import { Product } from '../entities/product.entity';
import { User } from '../entities/user.entity';
import { Auction } from '../entities/auction.entity';
import { Bid } from '../entities/bid.entity';
import { CommonModule } from '../common/common.module';
import { UploadModule } from '../upload/upload.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Product, User, Auction, Bid]),
    CommonModule,
    UploadModule,
  ],
  controllers: [ProductController],
  providers: [ProductService],
  exports: [ProductService],
})
export class ProductModule {}
