import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { UploadController } from './upload.controller';
import { ImageService } from './services/image.service';

@Module({
  imports: [ConfigModule],
  controllers: [UploadController],
  providers: [ImageService],
  exports: [ImageService],
})
export class UploadModule {} 