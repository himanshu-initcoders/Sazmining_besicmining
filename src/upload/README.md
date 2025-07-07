# Upload Module

This module provides a unified interface for uploading files to different storage providers: Local Storage, AWS S3, and Cloudinary.

## Features

- ✅ **Multiple Storage Providers**: Local, S3, Cloudinary
- ✅ **File Validation**: Size limits, MIME type validation
- ✅ **Flexible Configuration**: Per-upload customization
- ✅ **UUID-based Filenames**: Prevents naming conflicts
- ✅ **Error Handling**: Comprehensive error messages
- ✅ **File Deletion**: Support for deleting uploaded files
- ✅ **TypeScript Support**: Full type safety

## Quick Start

### 1. Install Dependencies

```bash
npm install aws-sdk cloudinary multer uuid
npm install -D @types/multer @types/uuid
```

### 2. Environment Variables

Create a `.env` file with the following variables based on your storage needs:

```env
# Base URL for local storage
BASE_URL=http://localhost:3000

# AWS S3 Configuration (if using S3)
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name

# Cloudinary Configuration (if using Cloudinary)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 3. Import the Module

Add `UploadModule` to your app module:

```typescript
import { Module } from '@nestjs/common';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    // ... other modules
    UploadModule,
  ],
})
export class AppModule {}
```

## Usage

### Basic API Usage

The module provides a RESTful API for uploading and deleting files:

#### Upload Image

```http
POST /upload/image
Content-Type: multipart/form-data

Body (form-data):
- file: [your image file]
- location: "local" | "s3" | "cloudinary"
- folder: "optional-folder-name"
- maxSize: 5242880 (optional, in bytes)
- allowedMimeTypes: "image/jpeg,image/png" (optional, comma-separated)
```

#### Delete Image

```http
DELETE /upload/image/:filename?location=s3&folder=products
```

### Programmatic Usage

Inject the `ImageService` into your services or controllers:

```typescript
import { Injectable } from '@nestjs/common';
import { ImageService, StorageLocation, UploadOptions } from './upload/services/image.service';

@Injectable()
export class ProductService {
  constructor(private readonly imageService: ImageService) {}

  async uploadProductImage(file: Express.Multer.File, productId: string) {
    const options: UploadOptions = {
      location: StorageLocation.S3,
      folder: `products/${productId}`,
      maxSize: 5 * 1024 * 1024, // 5MB
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
    };

    const result = await this.imageService.uploadImage(file, options);
    
    // Save result.url to your database
    return result;
  }
}
```

### Controller Example

```typescript
import { Controller, Post, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ImageService, StorageLocation } from './upload/services/image.service';

@Controller('products')
export class ProductController {
  constructor(private readonly imageService: ImageService) {}

  @Post(':id/image')
  @UseInterceptors(FileInterceptor('file'))
  async uploadProductImage(
    @Param('id') productId: string,
    @UploadedFile() file: Express.Multer.File,
  ) {
    const result = await this.imageService.uploadImage(file, {
      location: StorageLocation.CLOUDINARY,
      folder: `products/${productId}`,
      maxSize: 10 * 1024 * 1024, // 10MB
    });

    return {
      success: true,
      imageUrl: result.url,
      filename: result.filename,
    };
  }
}
```

## Storage Providers

### Local Storage

Files are stored in the `uploads/` directory relative to your application root.

**Configuration:**
- No additional setup required
- Files are served at `BASE_URL/folder/filename`

**Use Case:** Development, small applications, when you want full control over file storage.

### AWS S3

Files are uploaded to Amazon S3 buckets.

**Required Environment Variables:**
```env
AWS_ACCESS_KEY_ID=your_access_key_id
AWS_SECRET_ACCESS_KEY=your_secret_access_key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-bucket-name
```

**Use Case:** Production applications, scalable storage, CDN integration.

### Cloudinary

Files are uploaded to Cloudinary with automatic optimization.

**Required Environment Variables:**
```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

**Use Case:** Image-heavy applications, automatic image optimization, transformations.

## Configuration Options

### UploadOptions Interface

```typescript
interface UploadOptions {
  location: StorageLocation;     // Required: 'local' | 's3' | 'cloudinary'
  folder?: string;               // Optional: folder/path for organization
  maxSize?: number;              // Optional: max file size in bytes
  allowedMimeTypes?: string[];   // Optional: allowed file types
}
```

### Default Settings

```typescript
// Default values applied by the controller
{
  maxSize: 5 * 1024 * 1024,      // 5MB
  allowedMimeTypes: [
    'image/jpeg',
    'image/png', 
    'image/gif',
    'image/webp'
  ]
}
```

## Response Format

### Successful Upload

```json
{
  "success": true,
  "data": {
    "url": "https://storage-url/path/to/file.jpg",
    "filename": "uuid-generated-filename.jpg",
    "size": 1234567,
    "mimetype": "image/jpeg",
    "location": "s3"
  },
  "message": "Image uploaded successfully"
}
```

### Error Response

```json
{
  "statusCode": 400,
  "message": "File size 10485760 exceeds maximum allowed size 5242880",
  "error": "Bad Request"
}
```

## Error Handling

The service handles various error scenarios:

- **No file provided**: When file is missing
- **File too large**: When file exceeds maxSize
- **Invalid file type**: When MIME type is not allowed
- **Storage errors**: Provider-specific upload failures
- **Configuration errors**: Missing environment variables

## File Organization

### Recommended Folder Structure

```
uploads/
├── avatars/           # User profile pictures
├── products/          # Product images
│   ├── featured/      # Featured product images
│   └── gallery/       # Product gallery images
├── documents/         # PDF files, docs
└── temp/             # Temporary uploads
```

### Dynamic Folders

You can create dynamic folder structures:

```typescript
const options: UploadOptions = {
  location: StorageLocation.S3,
  folder: `users/${userId}/products/${productId}`,
  // Results in: users/123/products/456/filename.jpg
};
```

## Security Considerations

1. **File Type Validation**: Always specify `allowedMimeTypes`
2. **Size Limits**: Set appropriate `maxSize` values
3. **Access Control**: Implement authentication for upload endpoints
4. **File Scanning**: Consider virus scanning for user uploads
5. **Rate Limiting**: Implement rate limiting for upload endpoints

## Migration Guide

If you're migrating from another upload solution:

1. **Install the module** and dependencies
2. **Update environment variables** for your storage providers
3. **Replace existing upload logic** with `ImageService` calls
4. **Update API endpoints** to use the new `/upload/image` format
5. **Test thoroughly** with all storage providers you use

## Troubleshooting

### Common Issues

1. **"Cannot find module 'aws-sdk'"**
   - Install: `npm install aws-sdk`

2. **"S3 upload failed"**
   - Check AWS credentials and bucket permissions
   - Verify bucket exists and region is correct

3. **"Cloudinary upload failed"**
   - Verify Cloudinary credentials
   - Check API key permissions

4. **"No file provided"**
   - Ensure you're using `FileInterceptor('file')`
   - Check that the form field name is 'file'

### Debugging

Enable debug logging by setting:

```typescript
// In your service
console.log('Upload options:', options);
console.log('File info:', { 
  name: file.originalname, 
  size: file.size, 
  type: file.mimetype 
});
```

## Performance Tips

1. **Use appropriate storage**: Local for dev, S3/Cloudinary for production
2. **Optimize file sizes**: Compress images before upload when possible
3. **Use CDN**: Configure CloudFront with S3 or use Cloudinary's CDN
4. **Implement caching**: Cache upload results to avoid duplicate uploads
5. **Background processing**: For large files, consider background processing

## Contributing

When contributing to this module:

1. Add tests for new storage providers
2. Update this README with new features
3. Follow the existing error handling patterns
4. Ensure backward compatibility 