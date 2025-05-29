# Post API Testing Guide - Updated with Province Support

## Overview
คู่มือการทดสอบ Post API ที่มีฟีเจอร์ใหม่สำหรับการดึงข้อมูล posts ตาม province

## Prerequisites
1. Server รันอยู่ที่ port 3030
2. Database พร้อมใช้งาน
3. มีข้อมูล users, places, place_types, และ provinces ในระบบ

## New Features Added
### GET /api/posts/province/:provinceId
ดึงข้อมูล posts ทั้งหมดที่อยู่ในจังหวัดที่กำหนด

**Parameters:**
- `provinceId` (path): ID ของจังหวัด
- `page` (query): หน้าที่ต้องการ (default: 1)
- `limit` (query): จำนวนรายการต่อหน้า (default: 10)
- `status` (query): สถานะของ post (approved, pending, rejected)
- `place_type_id` (query): กรองตามประเภทสถานที่

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id_post": "post_id",
      "title": "Post title",
      "body": "Post content",
      "image": "image_url",
      "status": "approved",
      "display": true,
      "created_at": "2024-01-01T00:00:00.000Z",
      "user": {
        "id_user": "user_id",
        "username": "username",
        "display_name": "Display Name"
      },
      "place": {
        "id_place": "place_id",
        "place_name": "Place Name",
        "province": {
          "id_province": "province_id",
          "province_name": "Province Name"
        },
        "place_type": {
          "id_place_type": "type_id",
          "place_type_name": "Type Name"
        }
      }
    }
  ],
  "province": {
    "id_province": "province_id",
    "province_name": "Province Name"
  },
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "totalPages": 10
  }
}
```

## Testing Steps

### 1. Setup และ Authentication
```bash
# 1. Health Check
GET http://localhost:3030/api/health

# 2. Login เพื่อรับ JWT Token
POST http://localhost:3030/api/auth/login
Content-Type: application/json

{
  "username": "your_username",
  "password": "your_password"
}
```

### 2. รับข้อมูลพื้นฐาน
```bash
# 3. ดึงรายการ provinces
GET http://localhost:3030/api/provinces

# 4. ดึงรายการ place types
GET http://localhost:3030/api/place-types

# 5. ดึงรายการ places
GET http://localhost:3030/api/places
```

### 3. ทดสอบ Post API ใหม่

#### 3.1 ทดสอบดึง posts ตาม province
```bash
# 6. ดึง posts ทั้งหมดในจังหวัด
GET http://localhost:3030/api/posts/province/{province_id}

# 7. ดึง posts ในจังหวัดพร้อม pagination
GET http://localhost:3030/api/posts/province/{province_id}?page=1&limit=5

# 8. ดึง posts ในจังหวัดที่ได้รับการอนุมัติแล้ว
GET http://localhost:3030/api/posts/province/{province_id}?status=approved

# 9. ดึง posts ในจังหวัดตามประเภทสถานที่
GET http://localhost:3030/api/posts/province/{province_id}?place_type_id={place_type_id}

# 10. ดึง posts ในจังหวัดพร้อมกรองแบบรวม
GET http://localhost:3030/api/posts/province/{province_id}?page=1&limit=10&status=approved&place_type_id={place_type_id}
```

#### 3.2 เปรียบเทียบกับ endpoints อื่น
```bash
# กรองตาม province ผ่าน main endpoint
GET http://localhost:3030/api/posts?province_id={province_id}

# กรองตาม place type
GET http://localhost:3030/api/posts/place-type/{place_type_id}

# กรองตาม place
GET http://localhost:3030/api/posts/place/{place_id}
```

### 4. ทดสอบ Error Cases
```bash
# 11. ทดสอบ province ที่ไม่มีอยู่
GET http://localhost:3030/api/posts/province/non-existent-province-id

# 12. ทดสอบ parameters ที่ไม่ถูกต้อง
GET http://localhost:3030/api/posts/province/{province_id}?page=invalid&limit=invalid
```

## Use Cases สำหรับ Province Posts

### 1. แสดง posts ของจังหวัดหนึ่ง
```bash
GET /api/posts/province/bangkok?status=approved&limit=20
```

### 2. แสดง posts ของสถานที่ท่องเที่ยวในจังหวัด
```bash
GET /api/posts/province/chiang_mai?place_type_id=tourist_attraction&status=approved
```

### 3. แสดง posts ล่าสุดของจังหวัด
```bash
GET /api/posts/province/phuket?page=1&limit=5&status=approved
```

### 4. รวม posts จากหลายจังหวัด (ใช้ main endpoint)
```bash
GET /api/posts?province_id=bangkok,chiang_mai&status=approved
```

## Expected Results

### Success Cases
- ✅ ได้รับ posts ที่มี place.province_id ตรงกับ provinceId ที่ระบุ
- ✅ มี pagination ทำงานถูกต้อง
- ✅ การกรองตาม status และ place_type_id ทำงานถูกต้อง
- ✅ ข้อมูล province ถูกส่งกลับมาใน response
- ✅ Posts เรียงตาม created_at จากใหม่ไปเก่า

### Error Cases
- ❌ Province ไม่มีอยู่: HTTP 404 "Province not found"
- ❌ Parameters ไม่ถูกต้อง: HTTP 400 หรือใช้ค่า default

## Integration with Mobile App

### For Flutter/React Native
```dart
// Example API call
Future<PostResponse> getPostsByProvince(String provinceId, {
  int page = 1,
  int limit = 10,
  String status = 'approved',
  String? placeTypeId
}) async {
  final url = '$baseUrl/api/posts/province/$provinceId';
  final queryParams = {
    'page': page.toString(),
    'limit': limit.toString(),
    'status': status,
    if (placeTypeId != null) 'place_type_id': placeTypeId,
  };
  
  // Make HTTP request
}
```

## Performance Considerations
- ใช้ pagination เพื่อหลีกเลี่ยงการโหลดข้อมูลมากเกินไป
- มี index ใน database สำหรับ place.province_id
- Cache ข้อมูล province ที่ใช้บ่อย
- ใช้ status filter เพื่อแสดงเฉพาะ posts ที่อนุมัติแล้ว

## Next Steps
1. ทดสอบ API ด้วย Postman collection ที่อัปเดตแล้ว
2. ทดสอบการโหลดข้อมูลจำนวนมาก
3. ทดสอบ integration กับ mobile app
4. เพิ่ม caching หากจำเป็น
