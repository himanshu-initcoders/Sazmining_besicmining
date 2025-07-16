import { Injectable, BadRequestException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import { v4 as uuidv4 } from 'uuid';

export enum StorageLocation {
  LOCAL = 'local',
  S3 = 's3',
  CLOUDINARY = 'cloudinary',
}

export interface UploadResult {
  url: string;
  filename: string;
  size: number;
  mimetype: string;
  location: StorageLocation;
}

export interface UploadOptions {
  location: StorageLocation;
  folder?: string;
  maxSize?: number; // in bytes
  allowedMimeTypes?: string[];
}

@Injectable()
export class ImageService {
  private readonly uploadDir = 'uploads';

  constructor(private configService: ConfigService) {
    // Ensure upload directory exists for local storage
    if (!fs.existsSync(this.uploadDir)) {
      fs.mkdirSync(this.uploadDir, { recursive: true });
    }
  }

  async uploadImage(
    file: Express.Multer.File,
    options: UploadOptions,
  ): Promise<UploadResult> {
    // Validate file
    this.validateFile(file, options);

    switch (options.location) {
      case StorageLocation.LOCAL:
        return this.uploadToLocal(file, options);
      case StorageLocation.S3:
        return this.uploadToS3(file, options);
      case StorageLocation.CLOUDINARY:
        return this.uploadToCloudinary(file, options);
      default:
        throw new BadRequestException('Invalid storage location');
    }
  }

  private validateFile(
    file: Express.Multer.File,
    options: UploadOptions,
  ): void {
    if (!file) {
      throw new BadRequestException('No file provided');
    }

    if (options.maxSize && file.size > options.maxSize) {
      throw new BadRequestException(
        `File size ${file.size} exceeds maximum allowed size ${options.maxSize}`,
      );
    }

    if (
      options.allowedMimeTypes &&
      !options.allowedMimeTypes.includes(file.mimetype)
    ) {
      throw new BadRequestException(
        `File type ${file.mimetype} is not allowed. Allowed types: ${options.allowedMimeTypes.join(', ')}`,
      );
    }
  }

  private async uploadToLocal(
    file: Express.Multer.File,
    options: UploadOptions,
  ): Promise<UploadResult> {
    const fileExtension = path.extname(file.originalname);
    const filename = `${uuidv4()}${fileExtension}`;
    const folder = options.folder || 'images';
    const uploadPath = path.join(this.uploadDir, folder);

    // Ensure folder exists
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    const filePath = path.join(uploadPath, filename);

    // Write file to disk
    fs.writeFileSync(filePath, file.buffer);

    const baseUrl = this.configService.get<string>(
      'BASE_URL',
      'http://localhost:3000/api/v1',
    );
    const url = `${baseUrl}/${folder}/${filename}`;

    return {
      url,
      filename,
      size: file.size,
      mimetype: file.mimetype,
      location: StorageLocation.LOCAL,
    };
  }

  private async uploadToS3(
    file: Express.Multer.File,
    options: UploadOptions,
  ): Promise<UploadResult> {
    // Import AWS SDK dynamically to avoid requiring it if not used
    try {
      const AWS = await import('aws-sdk');

      const s3 = new AWS.S3({
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
        region: this.configService.get<string>('AWS_REGION'),
      });

      const bucket = this.configService.get<string>('AWS_S3_BUCKET');
      if (!bucket) {
        throw new BadRequestException('AWS S3 bucket is not configured');
      }
      const fileExtension = path.extname(file.originalname);
      const filename = `${uuidv4()}${fileExtension}`;
      const folder = options.folder || 'images';
      const key = `${folder}/${filename}`;

      const uploadParams = {
        Bucket: bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        ACL: 'public-read',
      };

      const result = await s3.upload(uploadParams).promise();

      return {
        url: result.Location,
        filename,
        size: file.size,
        mimetype: file.mimetype,
        location: StorageLocation.S3,
      };
    } catch (error) {
      throw new BadRequestException(`S3 upload failed: ${error.message}`);
    }
  }

  private async uploadToCloudinary(
    file: Express.Multer.File,
    options: UploadOptions,
  ): Promise<UploadResult> {
    try {
      const cloudinary = await import('cloudinary');
      
      const cloudName = this.configService.get<string>('CLOUDINARY_CLOUD_NAME');
      const apiKey = this.configService.get<string>('CLOUDINARY_API_KEY');
      const apiSecret = this.configService.get<string>('CLOUDINARY_API_SECRET');
      
      console.log('🔧 Cloudinary Configuration Debug:');
      console.log(`- CLOUDINARY_CLOUD_NAME: ${cloudName || 'undefined'}`);
      console.log(`- CLOUDINARY_API_KEY: ${apiKey || 'undefined'}`);
      console.log(`- CLOUDINARY_API_SECRET: ${apiSecret ? 'set' : 'undefined'}`);
      
      if (!cloudName || !apiKey || !apiSecret) {
        throw new BadRequestException(
          `Missing Cloudinary configuration: ${[
            !cloudName && 'CLOUDINARY_CLOUD_NAME',
            !apiKey && 'CLOUDINARY_API_KEY', 
            !apiSecret && 'CLOUDINARY_API_SECRET'
          ].filter(Boolean).join(', ')}`
        );
      }
      
      cloudinary.v2.config({
        cloud_name: cloudName,
        api_key: apiKey,
        api_secret: apiSecret,
      });

      const folder = options.folder || 'images';
      const filename = `${uuidv4()}`;

      const uploadResult = await new Promise((resolve, reject) => {
        cloudinary.v2.uploader
          .upload_stream(
            {
              folder,
              public_id: filename,
              resource_type: 'auto',
            },
            (error, result) => {
              if (error) reject(error);
              else resolve(result);
            },
          )
          .end(file.buffer);
      });

      const result = uploadResult as any;

      return {
        url: result.secure_url,
        filename: result.public_id,
        size: file.size,
        mimetype: file.mimetype,
        location: StorageLocation.CLOUDINARY,
      };
    } catch (error) {
      throw new BadRequestException(
        `Cloudinary upload failed: ${error.message}`,
      );
    }
  }

  async deleteImage(
    filename: string,
    location: StorageLocation,
    folder?: string,
  ): Promise<boolean> {
    switch (location) {
      case StorageLocation.LOCAL:
        return this.deleteFromLocal(filename, folder);
      case StorageLocation.S3:
        return this.deleteFromS3(filename, folder);
      case StorageLocation.CLOUDINARY:
        return this.deleteFromCloudinary(filename);
      default:
        throw new BadRequestException('Invalid storage location');
    }
  }

  private async deleteFromLocal(
    filename: string,
    folder?: string,
  ): Promise<boolean> {
    try {
      const folderPath = folder || 'images';
      const filePath = path.join(this.uploadDir, folderPath, filename);

      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }

  private async deleteFromS3(
    filename: string,
    folder?: string,
  ): Promise<boolean> {
    try {
      const AWS = await import('aws-sdk');

      const s3 = new AWS.S3({
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: this.configService.get<string>(
          'AWS_SECRET_ACCESS_KEY',
        ),
        region: this.configService.get<string>('AWS_REGION'),
      });

      const bucket = this.configService.get<string>('AWS_S3_BUCKET');
      if (!bucket) {
        throw new BadRequestException('AWS S3 bucket is not configured');
      }
      const folderPath = folder || 'images';
      const key = `${folderPath}/${filename}`;

      await s3.deleteObject({ Bucket: bucket, Key: key }).promise();
      return true;
    } catch (error) {
      return false;
    }
  }

  private async deleteFromCloudinary(publicId: string): Promise<boolean> {
    try {
      const cloudinary = await import('cloudinary');

      cloudinary.v2.config({
        cloud_name: this.configService.get<string>('CLOUDINARY_CLOUD_NAME'),
        api_key: this.configService.get<string>('CLOUDINARY_API_KEY'),
        api_secret: this.configService.get<string>('CLOUDINARY_API_SECRET'),
      });

      const result = await cloudinary.v2.uploader.destroy(publicId);
      return result.result === 'ok';
    } catch (error) {
      return false;
    }
  }
}
