// Load environment variables first
import * as dotenv from 'dotenv';
dotenv.config();

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import cookieParser from 'cookie-parser';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { CustomValidationPipe } from './common/pipes/validation.pipe';

async function bootstrap() {
  // Check for various production environment indicators
  const isProduction = 
    process.env.NODE_ENV === 'production' || 
    process.env.NODE_ENV === 'prod' || 
    process.env.ENV === 'production' || 
    process.env.ENV === 'prod' ||
    process.env.ENVIRONMENT === 'production' || 
    process.env.ENVIRONMENT === 'prod';

  const environment = isProduction ? 'PRODUCTION' : 'DEVELOPMENT';
  
  console.log(`🚀 Application starting in ${environment} mode`);
  console.log(`📊 Environment variables detected:
  - NODE_ENV: ${process.env.NODE_ENV || 'not set'}
  - ENV: ${process.env.ENV || 'not set'}
  - ENVIRONMENT: ${process.env.ENVIRONMENT || 'not set'}
  - CLOUDINARY_CLOUD_NAME: ${process.env.CLOUDINARY_CLOUD_NAME || 'not set'}
  - CLOUDINARY_API_KEY: ${process.env.CLOUDINARY_API_KEY || 'not set'}
  - CLOUDINARY_API_SECRET: ${process.env.CLOUDINARY_API_SECRET ? 'set' : 'not set'}`);

  const app = await NestFactory.create(AppModule);

  // Configure CORS based on environment
  const allowedOrigins = isProduction 
    ? [
        // Add your production frontend URLs here
        process.env.FRONTEND_URL,
        'https://besicmining.com',
        'https://www.besicmining.com',
        'https://dev-sazmining-20250715-b3031ffe06af.herokuapp.com',
        'https://dev-sazmining-fe-v1-20250715.vercel.app',
        'dev-sazmining-20250715-b3031ffe06af.herokuapp.com',
        'dev-sazmining-fe-v1-20250715.vercel.app'
      ].filter(Boolean) // Remove undefined values
    : [
        'http://localhost:3000', 
        'http://localhost:3001',
        'http://localhost:3002',
        'http://127.0.0.1:3000',
        'https://64d1f18f105c.ngrok-free.app'
      ];

  console.log(`🌐 CORS enabled for origins: ${allowedOrigins.join(', ')}`);
  
  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });
  
  // Apply global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.use(cookieParser());

  // Apply global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter());
  
  // Apply global transform interceptor for consistent response format
  app.useGlobalInterceptors(new TransformInterceptor());

  // Set global prefix
  app.setGlobalPrefix('api/v1');

  const port = process.env.PORT || 3001;
  await app.listen(port);
  console.log(`✅ Application is running on: http://localhost:${port}/api/v1`);
}
bootstrap();
