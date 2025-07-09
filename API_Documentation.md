# Sazmining Besic Mining API Documentation

## Overview

This is the complete API documentation for the Sazmining Besic Mining platform. The API provides comprehensive functionality for user authentication, product management, shopping cart operations, and file uploads.

**Base URL:** `http://localhost:3000/api/v1`

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Most endpoints require authentication except for public product endpoints.

### Authentication Flow

1. **Signup/Login** - Get access token and refresh token
2. **Use Access Token** - Include in Authorization header as `Bearer {token}`
3. **Refresh Token** - Use refresh token to get new access token when expired
4. **Logout** - Invalidate refresh token

### Token Management

- **Access Token**: Short-lived token (15 minutes) for API requests
- **Refresh Token**: Long-lived token (7 days) stored as HTTP-only cookie
- **Auto-Refresh**: Client should handle automatic token refresh

## Postman Collection Usage

### Setup

1. Import the `Sazmining_API_Collection.postman_collection.json` file into Postman
2. Set the following environment variables:
   - `baseUrl`: `http://localhost:3000/api/v1`
   - `accessToken`: Your JWT access token (will be set automatically after login)

### Environment Variables

The collection includes these variables that you can customize:

```json
{
  "baseUrl": "http://localhost:3000/api/v1",
  "accessToken": "",
  "userId": "1",
  "productId": "1", 
  "itemId": "1",
  "filename": "sample-image.jpg"
}
```

### Testing Workflow

1. **Start with Authentication**:
   - Use "Signup" to create a new account
   - Use "Login" to get access token
   - Copy the access token to the `accessToken` variable

2. **Test User Management**:
   - Get your profile
   - Update profile information
   - Upload profile photo

3. **Test Product Management**:
   - Browse public products
   - Create your own products
   - Upload product images
   - Manage product inventory

4. **Test Cart Operations**:
   - Add products to cart
   - Update quantities
   - Remove items
   - Clear cart

## API Endpoints

### Authentication Endpoints

#### POST /auth/signup
Create a new user account.

**Request Body:**
```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "name": "John Doe",
  "password": "password123",
  "phone": "+1234567890",
  "termsAgreed": true
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "name": "John Doe",
    "role": "USER"
  }
}
```

#### POST /auth/login
Authenticate user and get tokens.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

#### POST /auth/refresh
Refresh access token using refresh token.

#### POST /auth/logout
Logout and invalidate refresh token (requires authentication).

### User Management Endpoints

#### GET /users/profile
Get current user's profile (requires authentication).

#### PATCH /users/profile
Update current user's profile (requires authentication).

**Request Body:**
```json
{
  "name": "Updated Name",
  "phone": "+1987654321"
}
```

#### POST /users/profile/photo
Upload profile photo (requires authentication, multipart/form-data).

### Product Endpoints

#### Public Endpoints (No Authentication Required)

##### GET /products/public
Get all published products with filtering and pagination.

**Query Parameters:**
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 10)
- `search`: Search term
- `type`: Product type (marketplace, retail)
- `cooling`: Cooling type (air, liquid, immersion)
- `manufacturer`: Manufacturer name
- `minPrice`, `maxPrice`: Price range
- `minHashRate`, `maxHashRate`: Hash rate range
- `minPower`, `maxPower`: Power consumption range
- `sortBy`: Sort field
- `order`: Sort order (ASC, DESC)

##### GET /products/public/:id
Get published product details by ID.

##### GET /products/public/statistics
Get public product statistics.

#### Protected Endpoints (Authentication Required)

##### POST /products
Create a new product.

**Request Body:**
```json
{
  "sku": "ASIC-001",
  "serialNumber": "SN123456789",
  "modelName": "Antminer S19 Pro",
  "description": "High-performance Bitcoin mining ASIC",
  "imageUrl": "https://example.com/images/antminer-s19-pro.jpg",
  "isActive": true,
  "hashRate": 110.5,
  "power": 3250.0,
  "efficiency": 29.5,
  "disableBuyNow": false,
  "type": "marketplace",
  "cooling": "air",
  "manufacturer": "Bitmain",
  "productStatus": "Online",
  "status": "Published",
  "availability": "In Stock",
  "askPrice": 8500.00,
  "auctionType": "Fixed",
  "auctionStartDate": "2024-01-01T00:00:00Z",
  "auctionEndDate": "2024-01-31T23:59:59Z",
  "contractId": "contract-123",
  "shippingPrice": 150.00,
  "hosting": false,
  "stockType": "limited"
}
```

##### GET /products
Get all products (admin) or user's products.

##### GET /products/my
Get current user's products.

##### GET /products/:id
Get product details by ID.

##### PATCH /products/:id
Update product information.

##### DELETE /products/:id
Delete product.

##### POST /products/:id/image
Upload product image (multipart/form-data).

### Cart Endpoints

#### GET /cart
Get current user's cart with all items.

#### POST /cart/items
Add item to cart.

**Request Body:**
```json
{
  "productId": 1,
  "quantity": 2
}
```

#### PATCH /cart/items/:itemId
Update cart item quantity.

**Request Body:**
```json
{
  "quantity": 3
}
```

#### DELETE /cart/items/:itemId
Remove item from cart.

#### DELETE /cart
Clear all items from cart.

### Upload Endpoints

#### POST /upload/image
Upload an image file.

**Form Data:**
- `file`: Image file
- `location`: Storage location (cloudinary, s3, local)
- `folder`: Storage folder (optional)
- `maxSize`: Maximum file size in bytes (optional)
- `allowedMimeTypes`: Allowed MIME types (optional)

#### DELETE /upload/image/:filename
Delete an uploaded image.

**Query Parameters:**
- `location`: Storage location
- `folder`: Storage folder (optional)

## Data Models

### Product Entity

```typescript
{
  id: number;
  sku?: string;
  serialNumber: string;
  modelName: string;
  description: string;
  imageUrl?: string;
  isActive: boolean;
  hashRate: number;        // TH/s
  power: number;           // Watts
  efficiency: number;      // W/TH
  disableBuyNow: boolean;
  type: "marketplace" | "retail";
  cooling: "air" | "liquid" | "immersion";
  manufacturer: string;
  productStatus: "Online" | "Offline" | "Maintenance";
  status: "Published" | "Draft" | "Pending";
  availability: "In Stock" | "Out of Stock" | "Pre Order";
  askPrice: number;
  auctionType: "Bid" | "Fixed";
  auctionStartDate?: Date;
  auctionEndDate?: Date;
  contractId?: string;
  shippingPrice?: number;
  hosting: boolean;
  stockType: "limited" | "unlimited";
  userId: string;
  createdAt: Date;
  updatedAt: Date;
}
```

### User Entity

```typescript
{
  id: number;
  email: string;
  username: string;
  name: string;
  phone?: string;
  role: "USER" | "ADMIN";
  profilePhoto?: string;
  profileCompletion: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Cart Entity

```typescript
{
  id: number;
  userId: number;
  items: CartItem[];
  createdAt: Date;
  updatedAt: Date;
}
```

### Cart Item Entity

```typescript
{
  id: number;
  cartId: number;
  productId: number;
  quantity: number;
  product: Product;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Handling

### Error Response Format

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Error message",
    "details": {}
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Common Error Codes

- `USER_NOT_FOUND`: User does not exist
- `PRODUCT_NOT_FOUND`: Product does not exist
- `INVALID_CREDENTIALS`: Invalid login credentials
- `TOKEN_EXPIRED`: Access token has expired
- `INSUFFICIENT_PERMISSIONS`: User lacks required permissions
- `VALIDATION_ERROR`: Request validation failed
- `FILE_TOO_LARGE`: Uploaded file exceeds size limit
- `INVALID_FILE_TYPE`: Uploaded file type not allowed

## Response Format

### Success Response

```json
{
  "success": true,
  "data": {},
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Paginated Response

```json
{
  "success": true,
  "data": {
    "items": [],
    "meta": {
      "total": 100,
      "page": 1,
      "limit": 10,
      "totalPages": 10
    }
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-Based Access Control**: Admin and user roles
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: Protection against abuse
- **CORS**: Cross-origin resource sharing configuration
- **Security Headers**: HTTP security headers middleware
- **File Upload Security**: File type and size validation

## Development Setup

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables
4. Run database migrations
5. Start the development server: `npm run start:dev`

## Environment Variables

```bash
# Database
DATABASE_HOST=localhost
DATABASE_PORT=5432
DATABASE_NAME=sazmining_db
DATABASE_USERNAME=your_username
DATABASE_PASSWORD=your_password

# JWT
JWT_SECRET=your_jwt_secret
JWT_EXPIRES_IN=15m
JWT_REFRESH_SECRET=your_refresh_secret
JWT_REFRESH_EXPIRES_IN=7d

# File Storage
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret

# AWS S3 (if using S3)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET_NAME=your_bucket_name
AWS_REGION=your_region
```

## Support

For questions or issues, please refer to the API documentation or contact the development team. 