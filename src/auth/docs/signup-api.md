# User Signup API

This API allows new users to sign up for an account with the USER role.

## Endpoint

```
POST /auth/signup
```

## Request Body

```json
{
  "email": "user@example.com",
  "username": "johndoe",
  "name": "John Doe",
  "password": "password123",
  "phone": "1234567890", // Optional
  "termsAgreed": true
}
```

### Fields

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| email | string | Yes | User's email address (must be unique) |
| username | string | Yes | Username (must be unique) |
| name | string | Yes | User's full name |
| password | string | Yes | Password (minimum 6 characters) |
| phone | string | No | User's phone number |
| termsAgreed | boolean | Yes | Must be true to create an account |

## Response

### Success (201 Created)

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "email": "user@example.com",
    "username": "johndoe",
    "name": "John Doe",
    "role": "user",
    "profileCompletion": 66,
    "phone": "1234567890",
    "termsAgreed": true,
    "isActive": true,
    "createdAt": "2023-05-20T12:34:56.789Z",
    "updatedAt": "2023-05-20T12:34:56.789Z",
    "isProfileComplete": false
  }
}
```

### Error Responses

#### Email Already Exists (409 Conflict)

```json
{
  "statusCode": 409,
  "message": "Email already in use",
  "error": "EMAIL_ALREADY_EXISTS"
}
```

#### Username Already Exists (409 Conflict)

```json
{
  "statusCode": 409,
  "message": "Username already in use",
  "error": "USERNAME_ALREADY_EXISTS"
}
```

#### Terms Not Agreed (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": "Terms and conditions must be accepted",
  "error": "TERMS_NOT_AGREED"
}
```

#### Validation Error (400 Bad Request)

```json
{
  "statusCode": 400,
  "message": [
    "email must be an email",
    "password must be at least 6 characters long"
  ],
  "error": "Bad Request"
}
```

## Notes

- The API automatically sets the user's role to `USER`
- A JWT access token is generated and returned in the response
- A refresh token is set as an HTTP-only cookie
- Password is securely hashed using bcrypt before storing
- Profile completion percentage is automatically calculated based on provided fields
- Email addresses are automatically converted to lowercase and trimmed

## Example Usage

### cURL

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "username": "johndoe",
    "name": "John Doe",
    "password": "password123",
    "phone": "1234567890",
    "termsAgreed": true
  }'
```

### JavaScript (Fetch API)

```javascript
const response = await fetch('http://localhost:3000/auth/signup', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    email: 'user@example.com',
    username: 'johndoe',
    name: 'John Doe',
    password: 'password123',
    phone: '1234567890',
    termsAgreed: true
  }),
  credentials: 'include' // Important for storing the HTTP-only cookie
});

const data = await response.json();
console.log(data);

// Store the access token for future authenticated requests
localStorage.setItem('access_token', data.access_token);
``` 