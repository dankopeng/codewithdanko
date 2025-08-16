# API Reference

This document provides a comprehensive reference for the CodeWithDanko API endpoints.

## Authentication

All API requests (except login and register) require authentication using a JWT token in the Authorization header.

```
Authorization: Bearer YOUR_JWT_TOKEN
```

### Authentication Endpoints

#### Register a new user

```
POST /api/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword",
  "name": "User Name"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  },
  "token": "JWT_TOKEN"
}
```

#### Login

```
POST /api/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepassword"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  },
  "token": "JWT_TOKEN"
}
```

#### Logout

```
POST /api/auth/logout
```

**Response:**
```json
{
  "success": true,
  "message": "Logged out successfully"
}
```

#### Get current user

```
GET /api/auth/me
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

## User Management

#### Update user profile

```
PUT /api/users/profile
```

**Request Body:**
```json
{
  "name": "Updated Name",
  "bio": "User biography"
}
```

**Response:**
```json
{
  "success": true,
  "user": {
    "id": "user_id",
    "email": "user@example.com",
    "name": "Updated Name",
    "bio": "User biography"
  }
}
```

## Media Management

#### Upload media

```
POST /api/media/upload
```

**Request:**
- Content-Type: multipart/form-data
- Form field: `file` (file to upload)

**Response:**
```json
{
  "success": true,
  "file": {
    "id": "file_id",
    "filename": "image.jpg",
    "url": "https://codewithdanko-media.example.com/image.jpg",
    "size": 123456,
    "contentType": "image/jpeg"
  }
}
```

#### Get media by ID

```
GET /api/media/:id
```

**Response:**
- The file content with appropriate Content-Type header

#### Delete media

```
DELETE /api/media/:id
```

**Response:**
```json
{
  "success": true,
  "message": "File deleted successfully"
}
```

## Error Handling

All API endpoints return appropriate HTTP status codes:

- `200 OK`: Request succeeded
- `201 Created`: Resource created successfully
- `400 Bad Request`: Invalid request parameters
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Authenticated but not authorized
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

Error responses follow this format:

```json
{
  "success": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human readable error message"
  }
}
```

## Rate Limiting

API requests are rate limited to 100 requests per minute per IP address. When rate limited, the API will return a `429 Too Many Requests` status code.

## Pagination

List endpoints support pagination using query parameters:

- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20, max: 100)

Example:
```
GET /api/items?page=2&limit=50
```

Response includes pagination metadata:

```json
{
  "success": true,
  "data": [...],
  "pagination": {
    "total": 230,
    "page": 2,
    "limit": 50,
    "pages": 5
  }
}
```

## Versioning

The current API version is v1. All endpoints are prefixed with `/api/v1/` but the `/api/` prefix is also supported for backward compatibility.

## WebSocket API

Real-time features are available through WebSocket connections at:

```
wss://codewithdanko-api.tidepeng.workers.dev/api/ws
```

Authentication is required via the `token` query parameter:

```
wss://codewithdanko-api.tidepeng.workers.dev/api/ws?token=YOUR_JWT_TOKEN
```
