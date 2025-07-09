# User Module

This module provides user management functionality with profile photo upload capabilities using Cloudinary.

## Features

- ✅ **User CRUD Operations**: Create, read, update, delete users
- ✅ **Profile Management**: Dedicated endpoints for profile updates
- ✅ **Profile Photo Upload**: Cloudinary integration for profile photos
- ✅ **Role-Based Access Control**: Admin and user roles
- ✅ **Profile Completion Tracking**: Automatic calculation of profile completion percentage
- ✅ **Password Hashing**: Secure password storage with bcrypt
- ✅ **Input Validation**: Comprehensive validation using class-validator

## Endpoints

### User Management (Admin)

```
GET /users - List all users (Admin only)
GET /users/:id - Get user by ID
POST /users - Create a new user
PATCH /users/:id - Update a user
DELETE /users/:id - Delete a user (Admin only)
POST /users/:id/profile-photo - Upload profile photo for a user
```

### Profile Management (Current User)

```
GET /users/profile - Get current user's profile
PATCH /users/profile - Update current user's profile
POST /users/profile/photo - Upload current user's profile photo
```

## Profile Photo Upload

The module uses Cloudinary for profile photo storage. Photos are uploaded to the `user-profiles` folder in Cloudinary.

### Example Usage

```typescript
// Upload profile photo
const formData = new FormData();
formData.append('file', imageFile);

// For admin updating any user
fetch('/users/123/profile-photo', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});

// For user updating their own profile photo
fetch('/users/profile/photo', {
  method: 'POST',
  body: formData,
  headers: {
    'Authorization': 'Bearer YOUR_JWT_TOKEN'
  }
});
```

## Profile Completion

The module automatically calculates the profile completion percentage based on the following fields:
- Email
- Username
- Name
- Phone
- Profile Photo
- Terms Agreed

Each field contributes equally to the completion percentage. The `isProfileComplete` getter returns `true` when the completion is 100%.

## Security Considerations

- All profile endpoints are protected with JWT authentication
- Admin-only endpoints are protected with role-based guards
- Passwords are hashed using bcrypt with salt rounds of 10
- Email and username uniqueness is enforced

## Environment Variables

Ensure the following environment variables are set for Cloudinary integration:

```env
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## Dependencies

- NestJS
- TypeORM
- bcrypt
- class-validator
- class-transformer
- Cloudinary (via Upload Module) 