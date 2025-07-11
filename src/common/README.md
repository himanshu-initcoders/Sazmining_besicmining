# Common Module - Error Handling System

This module provides a comprehensive error handling system with standardized API responses, custom exceptions, and validation.

## Error Handling Components

### 1. AppException
Custom exception class that extends NestJS HttpException with a standardized format.

```typescript
import { AppException } from '../common/exceptions/app.exception';
import { ErrorCodes } from '../common/exceptions/error-codes';

// Example usage
throw new AppException(
  'User not found',
  ErrorCodes.USER_NOT_FOUND,
  HttpStatus.NOT_FOUND,
  { userId: 123 }
);
```

### 2. Global Exception Filter
Handles all exceptions and formats them consistently.

**Response Format:**
```json
{
  "success": false,
  "error": {
    "code": "USER_NOT_FOUND",
    "message": "User not found",
    "details": {
      "userId": 123
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 3. Custom Validation Pipe
Handles validation errors with consistent formatting.

**Validation Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR", 
    "message": "Validation failed",
    "details": {
      "violations": [
        {
          "field": "productId",
          "messages": ["productId must be a number"],
          "value": "invalid"
        }
      ]
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

### 4. Custom Parameter Validation
Handles parameter validation with detailed error messages.

**Parameter Error Response:**
```json
{
  "success": false,
  "error": {
    "code": "INVALID_PARAMETER",
    "message": "Invalid id. Expected a valid number.",
    "details": {
      "parameter": "id",
      "value": "abc",
      "expected": "number"
    }
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Success Response Format

All successful responses follow this format:

```json
{
  "success": true,
  "data": {
    // Your actual response data
  },
  "meta": {
    // Optional metadata (pagination, etc.)
  },
  "timestamp": "2024-01-15T10:30:00.000Z"
}
```

## Error Codes

All error codes are defined in `ErrorCodes` enum:

- `VALIDATION_ERROR` - Validation failures
- `INVALID_PARAMETER` - Invalid URL parameters
- `USER_NOT_FOUND` - User not found
- `PRODUCT_NOT_FOUND` - Product not found
- `CONTRACT_NOT_FOUND` - Contract not found
- And more...

## Usage in Controllers

### Route Parameters
```typescript
@Get(':id')
async getContract(@Param('id', CustomParseIntPipe) id: number) {
  return this.contractService.findOne(id);
}
```

### Request Body Validation
```typescript
@Post()
async createContract(@Body() dto: CreateContractDto) {
  // Validation happens automatically via CustomValidationPipe
  return this.contractService.createContract(dto);
}
```

### Custom Business Logic Errors
```typescript
if (!product) {
  throw new AppException(
    'Product not found',
    ErrorCodes.PRODUCT_NOT_FOUND,
    HttpStatus.NOT_FOUND,
    { productId: dto.productId }
  );
}
```

## Common Error Scenarios

1. **Route Parameter Validation**: `/contracts/abc` → `INVALID_PARAMETER`
2. **Body Validation**: Invalid JSON/missing fields → `VALIDATION_ERROR`  
3. **Business Logic**: Resource not found → `RESOURCE_NOT_FOUND`
4. **Authentication**: Invalid token → `INVALID_TOKEN`
5. **Authorization**: Insufficient permissions → `INSUFFICIENT_PERMISSIONS`

This system ensures all API responses are consistent and provide meaningful error information for debugging and user feedback. 