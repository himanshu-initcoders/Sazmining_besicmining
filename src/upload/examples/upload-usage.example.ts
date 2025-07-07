import { Injectable } from '@nestjs/common';
import { ImageService, StorageLocation, UploadOptions } from '../services/image.service';

@Injectable()
export class UploadUsageExample {
  constructor(private readonly imageService: ImageService) {}

  // Example 1: Upload to local storage
  async uploadToLocal(file: Express.Multer.File) {
    const options: UploadOptions = {
      location: StorageLocation.LOCAL,
      folder: 'products',
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    };

    return await this.imageService.uploadImage(file, options);
  }

  // Example 2: Upload to S3
  async uploadToS3(file: Express.Multer.File) {
    const options: UploadOptions = {
      location: StorageLocation.S3,
      folder: 'user-avatars',
      maxSize: 2 * 1024 * 1024, // 2MB
      allowedMimeTypes: ['image/jpeg', 'image/png'],
    };

    return await this.imageService.uploadImage(file, options);
  }

  // Example 3: Upload to Cloudinary
  async uploadToCloudinary(file: Express.Multer.File) {
    const options: UploadOptions = {
      location: StorageLocation.CLOUDINARY,
      folder: 'product-images',
      maxSize: 10 * 1024 * 1024, // 10MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
    };

    return await this.imageService.uploadImage(file, options);
  }

  // Example 4: Simple usage with defaults
  async uploadWithDefaults(file: Express.Multer.File, location: StorageLocation) {
    const options: UploadOptions = {
      location,
      // Uses default folder 'images'
      // Uses default maxSize from controller (5MB)
      // Uses default allowed mime types from controller
    };

    return await this.imageService.uploadImage(file, options);
  }

  // Example 5: Delete image
  async deleteImage(filename: string, location: StorageLocation, folder?: string) {
    return await this.imageService.deleteImage(filename, location, folder);
  }
}

/*
Usage in a controller:

@Controller('products')
export class ProductController {
  constructor(private readonly imageService: ImageService) {}

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductImage(
    @Param('id') productId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const options: UploadOptions = {
      location: StorageLocation.S3, // or LOCAL, CLOUDINARY
      folder: `products/${productId}`,
      maxSize: 5 * 1024 * 1024,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    };

    const result = await this.imageService.uploadImage(file, options);
    
    // Save the result.url to your product entity
    // await this.productService.updateImage(productId, result.url);
    
    return result;
  }
}

API Usage Examples:

1. Upload to local storage:
POST /upload/image
Content-Type: multipart/form-data

Body (form-data):
- file: [your image file]
- location: "local"
- folder: "products" (optional)
- maxSize: 5242880 (optional, in bytes)
- allowedMimeTypes: "image/jpeg,image/png" (optional, comma-separated)

2. Upload to S3:
POST /upload/image
Content-Type: multipart/form-data

Body (form-data):
- file: [your image file]
- location: "s3"
- folder: "avatars" (optional)

Environment variables needed for S3:
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

3. Upload to Cloudinary:
POST /upload/image
Content-Type: multipart/form-data

Body (form-data):
- file: [your image file]
- location: "cloudinary"
- folder: "products" (optional)

Environment variables needed for Cloudinary:
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

4. Delete image:
DELETE /upload/image/filename.jpg?location=s3&folder=products

Response format:
{
  "success": true,
  "data": {
    "url": "https://your-storage-url/path/to/file.jpg",
    "filename": "uuid-generated-filename.jpg",
    "size": 1234567,
    "mimetype": "image/jpeg",
    "location": "s3"
  },
  "message": "Image uploaded successfully"
}
*/ 