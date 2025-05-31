# User Management API - Admin Only

This API provides endpoints for administrators to manage users in the system. All endpoints require admin authentication.

## Authentication

All endpoints require:
1. JWT token in Authorization header: `Bearer <token>`
2. User must have `ADMIN` role

## Endpoints

### 1. Get All Users

**GET** `/api/users`

Retrieve all users with pagination and filtering options.

#### Query Parameters

| Parameter | Type | Description | Default |
|-----------|------|-------------|---------|
| `page` | number | Page number for pagination | 1 |
| `limit` | number | Number of items per page | 10 |
| `search` | string | Search in username, email, first_name, last_name, display_name | - |
| `role` | string | Filter by role (ADMIN, USER, MODERATOR) | - |

#### Example Request

```bash
GET /api/users?page=1&limit=20&search=john&role=USER
Authorization: Bearer <admin_jwt_token>
```

#### Example Response

```json
{
  "success": true,
  "data": [
    {
      "id_user": "uuid-string",
      "username": "johndoe",
      "email": "john@example.com",
      "first_name": "John",
      "last_name": "Doe",
      "display_name": "John Doe",
      "phonenumber": "+1234567890",
      "is_verified": true,
      "created_at": "2025-01-01T00:00:00.000Z",
      "updated_at": "2025-01-01T00:00:00.000Z",
      "role": {
        "id_role": "role-uuid",
        "role_name": "USER"
      },
      "_count": {
        "posts": 5,
        "approved_posts": 0
      }
    }
  ],
  "pagination": {
    "currentPage": 1,
    "totalPages": 3,
    "totalItems": 25,
    "itemsPerPage": 10,
    "hasNextPage": true,
    "hasPrevPage": false
  }
}
```

### 2. Get User by ID

**GET** `/api/users/:id`

Retrieve detailed information about a specific user.

#### Path Parameters

| Parameter | Type | Description |
|-----------|------|-------------|
| `id` | string | User ID (UUID) |

#### Example Request

```bash
GET /api/users/uuid-string
Authorization: Bearer <admin_jwt_token>
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "id_user": "uuid-string",
    "username": "johndoe",
    "email": "john@example.com",
    "first_name": "John",
    "last_name": "Doe",
    "display_name": "John Doe",
    "phonenumber": "+1234567890",
    "is_verified": true,
    "created_at": "2025-01-01T00:00:00.000Z",
    "updated_at": "2025-01-01T00:00:00.000Z",
    "role": {
      "id_role": "role-uuid",
      "role_name": "USER"
    },
    "posts": [
      {
        "id_post": "post-uuid",
        "title": "My Post Title",
        "status": "approved",
        "created_at": "2025-01-01T00:00:00.000Z"
      }
    ],
    "approved_posts": [
      {
        "id_post": "post-uuid",
        "title": "Approved Post",
        "approved_at": "2025-01-01T00:00:00.000Z"
      }
    ],
    "_count": {
      "posts": 5,
      "approved_posts": 3
    }
  }
}
```

### 3. Get User Statistics

**GET** `/api/users/statistics`

Retrieve system-wide user statistics.

#### Example Request

```bash
GET /api/users/statistics
Authorization: Bearer <admin_jwt_token>
```

#### Example Response

```json
{
  "success": true,
  "data": {
    "total": 150,
    "byRole": {
      "admin": 2,
      "user": 145,
      "moderator": 3
    },
    "byVerification": {
      "verified": 120,
      "unverified": 30
    },
    "recentRegistrations": {
      "count": 15,
      "period": "last_30_days"
    }
  }
}
```

## Error Responses

### 401 Unauthorized
```json
{
  "success": false,
  "message": "Access token required"
}
```

### 403 Forbidden
```json
{
  "success": false,
  "message": "Access denied. Admin role required"
}
```

### 404 Not Found
```json
{
  "success": false,
  "message": "User not found"
}
```

### 500 Internal Server Error
```json
{
  "success": false,
  "message": "Error fetching users",
  "error": "Detailed error message"
}
```

## Usage Examples

### Using cURL

```bash
# Get all users
curl -X GET "http://localhost:3000/api/users?page=1&limit=10" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# Get specific user
curl -X GET "http://localhost:3000/api/users/user-uuid" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# Get user statistics
curl -X GET "http://localhost:3000/api/users/statistics" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"

# Search users
curl -X GET "http://localhost:3000/api/users?search=john&role=USER" \
  -H "Authorization: Bearer YOUR_ADMIN_JWT_TOKEN"
```

### Using JavaScript/Fetch

```javascript
const token = 'YOUR_ADMIN_JWT_TOKEN';

// Get all users
const response = await fetch('/api/users?page=1&limit=10', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const users = await response.json();

// Get user by ID
const userResponse = await fetch('/api/users/user-uuid', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const user = await userResponse.json();

// Get statistics
const statsResponse = await fetch('/api/users/statistics', {
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
const stats = await statsResponse.json();
```

## Security Notes

1. **Admin Only Access**: All endpoints are restricted to users with `ADMIN` role
2. **Sensitive Data**: Password hashes are never returned in API responses
3. **Rate Limiting**: Consider implementing rate limiting for production use
4. **Audit Logging**: Consider logging admin actions for security audit trails

## Implementation Details

- **Database**: Uses Prisma ORM with PostgreSQL
- **Authentication**: JWT-based authentication via Passport.js
- **Authorization**: Role-based access control (RBAC)
- **Pagination**: Cursor-based pagination with total count
- **Filtering**: Case-insensitive search across multiple fields
- **Performance**: Optimized queries with selective field inclusion
