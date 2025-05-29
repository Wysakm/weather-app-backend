# Post API Testing Guide

## การเตรียมความพร้อม

### 1. ตรวจสอบว่า Server ทำงาน
```bash
npm run dev
# Server จะทำงานที่ http://localhost:3000
```

### 2. ขั้นตอนการทดสอบ

#### A. Authentication (ขั้นตอนแรก)
1. **Login เพื่อรับ JWT Token**
   ```
   POST /api/auth/login
   {
     "username": "your_username", 
     "password": "your_password"
   }
   ```
   
2. **คัดลอก token จาก response** และแทนที่ใน `{{token}}`

#### B. ดึงข้อมูลพื้นฐานที่จำเป็น
1. **ดึง Place Types**
   ```
   GET /api/place-types
   ```
   คัดลอก `id_place_type` และแทนที่ใน `{{placeTypeId}}`

2. **ดึง Places**
   ```
   GET /api/places
   ```
   คัดลอก `id_place` และแทนที่ใน `{{placeId}}`

3. **ดึง User Info**
   ```
   GET /api/auth/me
   ```
   คัดลอก `id_user` และแทนที่ใน `{{userId}}`

### 3. ลำดับการทดสอบที่แนะนำ

#### ขั้นที่ 1: ทดสอบ Public Routes
1. ✅ GET All Posts
2. ✅ GET Posts by Place Type
3. ✅ GET Posts by User
4. ✅ GET Posts by Place
5. ✅ GET Post by ID

#### ขั้นที่ 2: ทดสอบ CRUD Operations
1. ✅ CREATE New Post
2. ✅ GET Post ที่เพิ่งสร้าง
3. ✅ UPDATE Post
4. ✅ DELETE Post

#### ขั้นที่ 3: ทดสอบ Admin Functions (ต้องมี Admin/Moderator role)
1. ✅ GET Pending Posts
2. ✅ APPROVE Post
3. ✅ REJECT Post

#### ขั้นที่ 4: ทดสอบ Error Cases
1. ❌ 404 Errors
2. ❌ Validation Errors
3. ❌ Authorization Errors

### 4. Expected Responses

#### สำหรับ GET All Posts:
```json
{
  "success": true,
  "data": [
    {
      "id_post": "uuid",
      "title": "Post title",
      "body": "Post content",
      "status": "approved|pending|rejected",
      "display": true|false,
      "image": "image_url",
      "created_at": "2025-05-29T...",
      "updated_at": "2025-05-29T...",
      "user": {
        "id_user": "uuid",
        "username": "username",
        "display_name": "Display Name"
      },
      "place": {
        "id_place": "uuid",
        "name_place": "Place Name",
        "place_type": {
          "type_name": "Type Name"
        },
        "province": {
          "name": "Province Name"
        }
      }
    }
  ],
  "pagination": {
    "total": 50,
    "page": 1,
    "limit": 10,
    "totalPages": 5
  }
}
```

#### สำหรับ CREATE Post:
```json
{
  "success": true,
  "data": {
    "id_post": "new_uuid",
    "title": "Beautiful Weather Today!",
    "body": "Post content...",
    "status": "pending",
    "display": false,
    "created_at": "2025-05-29T..."
  },
  "message": "Post created successfully"
}
```

### 5. การทดสอบ Filtering และ Pagination

#### Query Parameters ที่รองรับ:
- `page`: หน้าที่ต้องการ (default: 1)
- `limit`: จำนวนรายการต่อหน้า (default: 10)
- `search`: ค้นหาใน title หรือ body
- `status`: กรองตามสถานะ (pending, approved, rejected)
- `id_user`: กรองตาม user
- `id_place`: กรองตาม place
- `place_type_id`: กรองตาม place type
- `province_id`: กรองตาม province

#### ตัวอย่างการใช้งาน:
```
GET /api/posts?page=2&limit=5&search=weather&status=approved&place_type_id=your_place_type_id
```

### 6. Status Codes ที่คาดหวัง
- ✅ 200: Success
- ✅ 201: Created
- ❌ 400: Bad Request (Validation Error)
- ❌ 401: Unauthorized
- ❌ 403: Forbidden
- ❌ 404: Not Found
- ❌ 500: Internal Server Error

### 7. Tips สำหรับการทดสอบ
1. **ใช้ VS Code Extension**: REST Client เพื่อทดสอบไฟล์ `.http`
2. **ตรวจสอบ Console**: ดู error logs ใน terminal
3. **ทดสอบทีละขั้นตอน**: เริ่มจาก simple requests ก่อน
4. **เก็บ IDs**: บันทึก IDs ที่สำคัญสำหรับการทดสอบต่อ

### 8. Troubleshooting
- หาก 401 Unauthorized: ตรวจสอบ JWT token
- หาก 404 Not Found: ตรวจสอบ IDs ที่ใช้
- หาก 500 Error: ดู server logs สำหรับรายละเอียด
