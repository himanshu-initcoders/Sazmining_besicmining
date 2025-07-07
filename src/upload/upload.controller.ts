import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
  Body,
  BadRequestException,
  Delete,
  Param,
  Query,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService, StorageLocation, UploadOptions } from './services/image.service';
import { UploadImageDto } from './dto/upload-image.dto';

@Controller('upload')
export class UploadController {
  constructor(private readonly imageService: ImageService) {}

  @Post('image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadImage(
    @UploadedFile() file: Express.Multer.File,
    @Body() uploadDto: UploadImageDto,
  ) {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    const options: UploadOptions = {
      location: uploadDto.location,
      folder: uploadDto.folder,
      maxSize: uploadDto.maxSize || 5 * 1024 * 1024, // 5MB default
      allowedMimeTypes: uploadDto.allowedMimeTypes || [
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
      ],
    };

    try {
      const result = await this.imageService.uploadImage(file, options);
      return {
        success: true,
        data: result,
        message: 'Image uploaded successfully',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Delete('image/:filename')
  async deleteImage(
    @Param('filename') filename: string,
    @Query('location') location: StorageLocation,
    @Query('folder') folder?: string,
  ) {
    try {
      const result = await this.imageService.deleteImage(filename, location, folder);
      return {
        success: result,
        message: result ? 'Image deleted successfully' : 'Image not found or could not be deleted',
      };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }
} 