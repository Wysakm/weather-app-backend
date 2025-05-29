# Weather App Post API - Postman Testing Guide

## 🚀 Quick Start

### 1. Import Collection
1. Open Postman
2. Click "Import" button
3. Select the `Post-API-Postman-Collection.json` file
4. The collection will be imported with all requests and variables

### 2. Set Environment Variables
The collection uses variables that are automatically populated. You only need to update:
- **baseUrl**: `http://localhost:3030` (default)
- **Login credentials** in the Login request

## 📋 Testing Sequence

### Phase 1: Setup & Authentication
Run these requests in order:

1. **Health Check** ✅
   - Verifies server is running
   - Should return 200 OK

2. **Login** 🔐
   - **IMPORTANT**: Update username/password in request body
   - Automatically saves JWT token to collection variable
   - Should return 200 with access_token

3. **Get Current User Profile** 👤
   - Verifies authentication is working
   - Should return user information

### Phase 2: Setup Data
These requests populate collection variables with real IDs:

4. **Get Place Types** 🏛️
   - Automatically saves first place type ID
   - Should return array of place types

5. **Get Provinces** 🗺️
   - Automatically saves first province ID
   - Should return array of provinces

6. **Get Places** 📍
   - Automatically saves first place ID
   - Should return array of places

### Phase 3: Public API Testing

7. **Get All Posts** 📑
   - Tests basic posts retrieval
   - Should return paginated posts

8. **Get Posts with Pagination** 📄
   - Tests pagination parameters
   - Should return 5 posts max

9. **Get Posts by Place Type** 🏛️
   - **KEY FEATURE**: Tests filtering by place type
   - Uses automatically saved placeTypeId
   - Should return posts for specific place type

10. **Search Posts** 🔍
    - Tests search functionality
    - Should return posts matching "weather"

11. **Filter by Province** 🗺️
    - Tests province filtering
    - Should return posts from specific province

### Phase 4: Protected API Testing

12. **Create New Post** ✏️
    - **IMPORTANT**: Requires valid JWT token
    - Automatically saves created post ID
    - Should return 201 Created

13. **Get Post by ID** 📄
    - Tests specific post retrieval
    - Uses automatically saved postId

14. **Update Post** ✏️
    - Tests post modification
    - Should return updated post data

15. **Get Posts by Current User** 👤
    - Tests user-specific post retrieval
    - Should return posts created by authenticated user

### Phase 5: Admin/Moderator Testing

16. **Get Pending Posts** ⏳
    - **Admin/Moderator Only**: Tests pending posts retrieval
    - Should return posts with "pending" status

17. **Approve Post** ✅
    - **Admin/Moderator Only**: Tests post approval
    - Changes status to "approved"

18. **Reject Post** ❌
    - **Admin/Moderator Only**: Tests post rejection
    - Changes status to "rejected"

### Phase 6: Error Testing

19. **Test 404 - Post Not Found** ❌
    - Should return 404 error

20. **Test Unauthorized** 🚫
    - Should return 401 Unauthorized

21. **Test Validation Error** ⚠️
    - Should return 400 Bad Request

### Phase 7: Cleanup

22. **Delete Test Post** 🗑️
    - Cleans up created test data
    - Should return 200 OK

## 🔧 Manual Configuration

If automatic variable population doesn't work, manually set these in Collection Variables:

```
baseUrl: http://localhost:3030
token: your_jwt_token_from_login
placeTypeId: valid_place_type_id
placeId: valid_place_id
userId: valid_user_id
postId: created_post_id
provinceId: valid_province_id
```

## 📊 Expected Response Formats

### Successful Post Creation (201)
```json
{
  "message": "Post created successfully",
  "post": {
    "id": "post_id",
    "title": "Beautiful Weather Today!",
    "body": "The weather at this location...",
    "image": "https://example.com/weather-image.jpg",
    "status": "pending",
    "id_place": "place_id",
    "id_user": "user_id",
    "created_at": "2024-01-15T10:30:00.000Z",
    "updated_at": "2024-01-15T10:30:00.000Z"
  }
}
```

### Paginated Posts Response (200)
```json
{
  "posts": [...],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response (400/401/404)
```json
{
  "success": false,
  "message": "Error description",
  "errors": [...] // if validation errors
}
```

## ⚠️ Common Issues & Solutions

### 1. Authentication Errors
- **Problem**: 401 Unauthorized
- **Solution**: Ensure login request is successful and token is saved
- **Check**: Collection Variables → token should be populated

### 2. Missing IDs
- **Problem**: Requests fail with "invalid ID"
- **Solution**: Run setup requests (4-6) to populate place/province IDs
- **Check**: Collection Variables should have placeTypeId, placeId, provinceId

### 3. Admin/Moderator Access
- **Problem**: 403 Forbidden on admin routes
- **Solution**: Ensure logged-in user has admin/moderator role
- **Check**: User profile response should show appropriate role

### 4. Server Not Running
- **Problem**: Connection refused
- **Solution**: Start the backend server
- **Command**: `npm run dev` in backend directory

## 🎯 Key Features to Test

### ✅ Core Post CRUD
- [x] Create post
- [x] Read posts (all, by ID, by filters)
- [x] Update post
- [x] Delete post

### ✅ Filtering & Search
- [x] Filter by place type (main feature)
- [x] Filter by province
- [x] Filter by user
- [x] Filter by place
- [x] Search by title/body
- [x] Filter by status

### ✅ Authentication & Authorization
- [x] Public routes work without auth
- [x] Protected routes require JWT
- [x] Admin routes require proper role
- [x] Users can only modify their own posts

### ✅ Admin Workflow
- [x] View pending posts
- [x] Approve posts
- [x] Reject posts
- [x] Only admins/moderators can approve

### ✅ Pagination
- [x] Default pagination
- [x] Custom page size
- [x] Proper pagination metadata

## 📝 Testing Notes

1. **Run requests sequentially**: Some requests depend on previous ones
2. **Check collection variables**: They auto-populate to make testing easier
3. **Update login credentials**: Use your actual username/password
4. **Test with different users**: Create posts with different user accounts
5. **Test admin features**: Ensure you have admin/moderator access

## 🔄 Automated Testing Scripts

The collection includes JavaScript test scripts that:
- Automatically save tokens and IDs
- Validate response status codes
- Set up variables for subsequent requests
- Log important information to console

Check the **Console** tab in Postman to see automated test results and variable updates.
