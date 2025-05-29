# Weather App Backend - Complete Testing Guide

This guide provides step-by-step instructions for testing your complete Weather App backend system, including authentication, posts, and province filtering functionality.

## Prerequisites

1. Ensure your server is running on port 3030
2. Have a REST client installed (VS Code REST Client extension recommended)
3. Open the `test-auth-posts-workflow.http` file

## Quick Start Test Sequence

### Phase 1: Authentication Setup (5 minutes)

1. **Register a Test User** (Test 1.1)
   ```
   POST http://localhost:3030/api/auth/register
   ```
   - Creates a test user account
   - Should return 201 status with user data and JWT token

2. **Login** (Test 1.2)
   ```
   POST http://localhost:3030/api/auth/login
   ```
   - **IMPORTANT**: Copy the `token` from the response
   - Update the `@token` variable in the test file

3. **Verify Authentication** (Test 1.3)
   - Tests JWT token validation
   - Should return user information

### Phase 2: Get Reference Data (3 minutes)

4. **Get Provinces** (Test 2.1)
   - Returns list of all provinces
   - **Copy a `province_id`** from the response to `@provinceId` variable

5. **Get Place Types** (Test 2.2)
   - Returns available place types (e.g., tourist spots, restaurants)
   - **Copy a `place_type_id`** to `@placeTypeId` variable

6. **Get Places** (Test 2.3)
   - Returns available places
   - **Copy a `place_id`** to `@placeId` variable

### Phase 3: Test Core Post Functionality (10 minutes)

7. **Create a Post** (Test 3.1)
   - **Requires**: Valid token, place_id, place_type_id
   - Creates a new weather-related post
   - **Copy the returned `post_id`** to `@postId` variable

8. **Test Province-Based Filtering** (Tests 3.4-3.5)
   - Key feature: Filter posts by province
   - Test with and without additional filters
   - Verify posts are correctly filtered by province

9. **Test All Filtering Options** (Tests 3.2-3.9)
   - Test pagination, search, status filtering
   - Test filtering by place type, user, place
   - Verify each filter works correctly

### Phase 4: Test Admin Features (5 minutes)

10. **Admin Registration & Login** (Tests 4.1-4.2)
    - Creates admin user account
    - Tests admin authentication

11. **Post Approval Workflow** (Tests 4.3-4.4)
    - View pending posts
    - Approve posts (admin only)
    - Verify approval system works

### Phase 5: Advanced Testing (5 minutes)

12. **Complex Filtering** (Tests 5.1-5.4)
    - Search functionality
    - Multiple filter combinations
    - Province + Place Type filtering

13. **Error Handling** (Tests 6.1-6.4)
    - Unauthorized access attempts
    - Invalid tokens
    - Missing required fields
    - Invalid UUIDs

## Key Features to Verify

### ✅ Authentication System
- [x] User registration with strong password validation
- [x] JWT token generation and validation
- [x] Protected route access control
- [x] Role-based authorization (USER, ADMIN, MODERATOR)

### ✅ Post Management
- [x] CRUD operations for posts
- [x] Content validation and sanitization
- [x] Image URL support
- [x] User ownership verification

### ✅ Province-Based Filtering (Key Feature)
- [x] Get posts by province ID
- [x] Combine province filter with place type
- [x] Pagination support for province queries
- [x] Search within province results

### ✅ Advanced Filtering
- [x] Search by content keywords
- [x] Filter by status (pending, approved, rejected)
- [x] Filter by place type
- [x] Filter by user
- [x] Pagination and limit controls

### ✅ Admin/Moderator System
- [x] Post approval workflow
- [x] Pending posts management
- [x] Role-based access control
- [x] Administrative operations

## Expected Test Results

### Successful Tests Should Return:
- **201 Created**: User registration, post creation
- **200 OK**: Login, data retrieval, updates
- **204 No Content**: Successful deletions
- **Proper JSON responses** with success/error flags

### Error Tests Should Return:
- **401 Unauthorized**: Missing or invalid tokens
- **400 Bad Request**: Invalid input data
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Non-existent resources

## Troubleshooting

### Common Issues:

1. **"Token Required" Errors**
   - Ensure you copied the JWT token from login response
   - Update the `@token` variable in the test file
   - Check token format: `Bearer <token>`

2. **"User Not Found" Errors**
   - Verify user registration was successful
   - Check database connection
   - Confirm user exists in database

3. **"Place/Province Not Found" Errors**
   - Verify you copied correct UUIDs from reference data
   - Check that provinces and places exist in database
   - Confirm UUID format is correct

4. **Validation Errors**
   - Check required fields are provided
   - Verify data types match schema requirements
   - Ensure email format is valid for registration

### Database Verification Commands:
```sql
-- Check if test user was created
SELECT * FROM "User" WHERE email = 'testuser@example.com';

-- Check provinces data
SELECT id_province, province_name FROM "MsProvince" LIMIT 5;

-- Check places data
SELECT id_place, name_place FROM "Place" LIMIT 5;

-- Check posts
SELECT * FROM "Post" WHERE user_id = 'your-user-id';
```

## Next Steps After Testing

1. **Mobile App Integration**
   - Use the working API endpoints in your mobile app
   - Implement JWT token storage and management
   - Add province-based filtering to mobile UI

2. **Production Deployment**
   - Set up environment variables
   - Configure database for production
   - Set up proper error logging

3. **Performance Optimization**
   - Add database indexes for frequent queries
   - Implement caching for province data
   - Add request rate limiting

4. **Additional Features**
   - Image upload functionality
   - Push notifications for post approvals
   - Advanced search with full-text indexing

## API Endpoints Summary

### Public Endpoints:
- `GET /api/posts` - Get all posts with filtering
- `GET /api/posts/province/:id` - **Key Feature**: Posts by province
- `GET /api/posts/place-type/:id` - Posts by place type
- `GET /api/provinces` - Get all provinces
- `GET /api/place-types` - Get place types

### Protected Endpoints:
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `GET /api/auth/me` - Get current user

### Admin Endpoints:
- `GET /api/posts/admin/pending` - Get pending posts
- `PATCH /api/posts/:id/approve` - Approve post

Your Weather App backend is now fully functional with comprehensive province-based filtering capabilities!
