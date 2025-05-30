# 🔑 App Password สำหรับ Hotmail/Outlook - คู่มือละเอียด

## ปัญหาปัจจุบัน
Microsoft ปิดการใช้ "basic authentication" (รหัสผ่านปกติ) แล้ว
ข้อความแสดงข้อผิดพลาด: "535 5.7.139 Authentication unsuccessful, basic authentication is disabled"

## วิธีแก้ไข: สร้าง App Password

### ขั้นตอนที่ 1: เปิด Two-Step Verification
1. ไปที่: https://account.microsoft.com/security
2. ล็อกอินด้วย chalita_ns@hotmail.com
3. ดู "Security dashboard" 
4. คลิก "Advanced security options"
5. หา "Two-step verification" → คลิก "Turn on"
6. เลือกวิธีรับ OTP (SMS หรือ Authenticator app)
7. ทำตามขั้นตอนให้เสร็จ

### ขั้นตอนที่ 2: สร้าง App Password
หลังจากเปิด 2FA แล้ว:
1. กลับไปที่ https://account.microsoft.com/security
2. คลิก "Advanced security options"
3. หา "App passwords" หรือ "Create a new app password"
4. ตั้งชื่อ: "Weather App Backend"
5. คัดลอกรหัสที่ได้ (รูปแบบ: abcd-efgh-ijkl-mnop)

### ขั้นตอนที่ 3: อัพเดท .env
```env
EMAIL_USER='chalita_ns@hotmail.com'
EMAIL_PASSWORD='รหัส-app-password-ที่ได้'  # ใส่รหัส 16 ตัวที่ได้จาก Microsoft
EMAIL_FROM='Weather App <chalita_ns@hotmail.com>'
```

## วิธีทางเลือก: สร้าง Gmail ใหม่

หากยังหา App Password ไม่ได้ แนะนำให้:
1. สร้าง Gmail ใหม่ (gmail.com)
2. เปิด 2FA ใน Gmail
3. สร้าง App Password ใน Gmail (ง่ายกว่า Outlook มาก)
4. ใช้ Gmail แทน Hotmail

## สถานะปัจจุบัน
- ✅ ระบบรีเซ็ตรหัสผ่านทำงานได้ 100%
- ✅ EmailService พร้อมใช้งาน
- ❌ ขาดเพียง App Password สำหรับส่งอีเมล

## การทดสอบ
หลังจากได้ App Password แล้ว:
```bash
npx ts-node test-outlook.ts
```
