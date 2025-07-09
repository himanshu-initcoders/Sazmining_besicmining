import { Module, NestModule, MiddlewareConsumer, RequestMethod } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { ServeStaticModule } from '@nestjs/serve-static';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { jwtConfig, jwtConstants } from './config/jwt.config';
import { AuthModule } from './auth/auth.module';
import { CommonModule } from './common/common.module';
import { LoggerMiddleware } from './common/middleware/logger.middleware';
import { JwtAuthMiddleware } from './common/middleware/jwt-auth.middleware';
import { SecurityMiddleware } from './common/middleware/security.middleware';
import { UploadModule } from './upload/upload.module';
import { UserModule } from './user/user.module';
import { CartModule } from './cart/cart.module';
import { ProductModule } from './product/product.module';
import { User } from './entities/user.entity';
import { Product } from './entities/product.entity';
import { Contract } from './entities/contract.entity';
import { Cart } from './entities/cart.entity';
import { CartItem } from './entities/cart-item.entity';
import { Auction } from './entities/auction.entity';
import { Bid } from './entities/bid.entity';
import { join } from 'path';
import { databaseConfig } from './config/database.config';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { APP_FILTER } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forFeature([
      User,
      Product,
      Contract,
      Cart,
      CartItem,
      Auction,
      Bid
    ]),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, '..', 'public'),
      exclude: ['/api/v1'],
    }),
    TypeOrmModule.forRoot(databaseConfig),
    JwtModule.register(jwtConfig),
    AuthModule,
    CommonModule,
    UploadModule,
    UserModule,
    CartModule,
    ProductModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_FILTER,
      useClass: GlobalExceptionFilter,
    } 
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Apply security middleware first (for all routes)
    consumer
      .apply(SecurityMiddleware)
      .forRoutes('*');
      
    // Apply logger middleware to all routes
    consumer
      .apply(LoggerMiddleware)
      .forRoutes('*');
    
    // Apply JWT auth middleware to protected routes
    consumer
      .apply(JwtAuthMiddleware)
      .exclude(
        { path: 'auth/login', method: RequestMethod.POST },
        { path: 'auth/signup', method: RequestMethod.POST },
        { path: 'auth/refresh', method: RequestMethod.POST },
        { path: 'products/public', method: RequestMethod.GET },
        { path: 'products/public/(.*)', method: RequestMethod.GET }
      )
      .forRoutes(
        { path: 'users', method: RequestMethod.ALL },
        { path: 'cart', method: RequestMethod.ALL },
        { path: 'upload', method: RequestMethod.ALL },
        { path: 'products', method: RequestMethod.ALL }
      );
  }
}
