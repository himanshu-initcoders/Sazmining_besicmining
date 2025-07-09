import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { User } from '../entities/user.entity';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { UploadModule } from '../upload/upload.module';
import { CartModule } from '../cart/cart.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    ConfigModule,
    UploadModule,
    CartModule,
  ],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
