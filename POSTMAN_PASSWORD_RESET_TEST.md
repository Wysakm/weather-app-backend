# 🧪 ทดสอบ Password Reset ใน Postman

## ขั้นตอนที่ 1: ส่งคำขอรีเซ็ตรหัสผ่าน
```
POST http://localhost:3030/auth/forgot-password
Content-Type: application/json

{
  "email": "weatherapp168@gmail.com"
}
```

## ขั้นตอนที่ 2: คัดลอก Token จากอีเมล
- เปิดอีเมลที่ได้รับ
- ดูลิงก์รีเซ็ต: `http://localhost:3030/reset-password?token=XXXXXXXX`
- คัดลอกเฉพาะ token หลัง `token=`

## ขั้นตอนที่ 3: ตรวจสอบ Token
```
POST http://localhost:3030/auth/verify-reset-token
Content-Type: application/json

{
  "token": "token-ที่คัดลอกจากอีเมล"
}
```

## ขั้นตอนที่ 4: รีเซ็ตรหัสผ่าน
```
POST http://localhost:3030/auth/reset-password
Content-Type: application/json

{
  "token": "token-ที่คัดลอกจากอีเมล",
  "newPassword": "newpassword123"
}
```

## ขั้นตอนที่ 5: ทดสอบเข้าสู่ระบบ
```
POST http://localhost:3030/auth/login
Content-Type: application/json

{
  "email": "weatherapp168@gmail.com",
  "password": "newpassword123"
}
```
