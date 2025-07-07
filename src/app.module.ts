import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { DatabaseModule } from './database/database.module';
import { UploadModule } from './upload/upload.module';
import { User } from './entities/user.entity';
import { Product } from './entities/product.entity';
import { Contract } from './entities/contract.entity';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Auction } from './entities/auction.entity';
import { Bid } from './entities/bid.entity';

@Module({
  imports: [
    ConfigModule,
    DatabaseModule,
    TypeOrmModule.forFeature([
      User,
      Product,
      Contract,
      Cart,
      CartItem,
      Auction,
      Bid
    ]),
    AuthModule,
    CommonModule,
    UploadModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
