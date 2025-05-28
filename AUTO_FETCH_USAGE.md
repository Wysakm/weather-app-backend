# Weather Service Auto-Fetch System

ระบบ Auto-Fetch ที่ปรับปรุงใหม่สำหรับดึงข้อมูลสภาพอากาศอัตโนมัติ

## 🚀 Quick Start

### เริ่มระบบ Auto-Fetch
```bash
npm run weather:start
```

### ดูสถานะระบบ
```bash
npm run weather:status
```

### Monitor ระบบแบบ real-time
```bash
npm run weather:monitor
```

### หยุดระบบ
```bash
npm run weather:stop
```

## 📋 คำสั่งทั้งหมด

| คำสั่ง | คำอธิบาย |
|--------|----------|
| `npm run weather:start` | เริ่มระบบ auto-fetch |
| `npm run weather:stop` | หยุดระบบ auto-fetch |
| `npm run weather:status` | แสดงสถานะโดยละเอียด |
| `npm run weather:monitor` | เริ่ม monitoring (Ctrl+C เพื่อหยุด) |
| `npm run weather:test` | ทดสอบสุขภาพระบบ |
| `npm run weather:suggestions` | แสดงคำแนะนำการปรับปรุง |
| `npm run weather:fetch` | บังคับ fetch ทันที |
| `npm run weather-cli interval 15` | เปลี่ยน interval เป็น 15 นาที |

## 🔧 ฟีเจอร์หลัก

### ✅ Adaptive Interval
- ปรับ interval อัตโนมัติตามผลลัพธ์
- ถ้าระบบทำงานดี = interval ปกติ (30 นาที)
- ถ้าผลลัพธ์แย่ = ขยาง interval (สูงสุด 2 ชั่วโมง)
- ถ้า error = ขยาง interval เป็น 2 เท่า

### ✅ No Overlapping Executions
- ใช้ Recursive setTimeout แทน setInterval
- รอให้งานเสร็จก่อนกำหนดรอบใหม่
- ป้องกันการใช้ทรัพยากรซ้ำซ้อน

### ✅ Smart Error Handling
- Retry mechanism แบบ exponential backoff
- Graceful degradation เมื่อ API ล่ม
- Detailed error logging

### ✅ Comprehensive Monitoring
- Real-time status monitoring
- Health checks สำหรับ database และ APIs
- Coverage statistics
- Data freshness tracking

### ✅ Manual Control
- เริ่ม/หยุดระบบได้ตามต้องการ
- เปลี่ยน interval แบบ dynamic
- บังคับ fetch ทันทีเมื่อจำเป็น
- ดูสถานะการทำงานแบบ real-time

## 📊 การใช้งานจริง

### 1. เริ่มระบบและ Monitor
```bash
# Terminal 1: เริ่มระบบ
npm run weather:start

# Terminal 2: Monitor สถานะ
npm run weather:monitor
```

### 2. ตรวจสอบสุขภาพระบบ
```bash
npm run weather:test
npm run weather:suggestions
```

### 3. ปรับแต่งระบบ
```bash
# เปลี่ยน interval เป็น 15 นาที
npm run weather-cli interval 15

# ดูสถานะใหม่
npm run weather:status
```

### 4. การใช้งานใน Production
```bash
# ตรวจสอบก่อนเริ่ม
npm run weather:test

# เริ่มระบบ
npm run weather:start

# Monitor ทุก 3 นาที
npm run weather-cli monitor 3
```

## 🔍 การอ่านสถานะ

### Health Status
- 🟢 **healthy**: ทุก service ทำงานปกติ
- 🟡 **degraded**: บาง service มีปัญหา
- 🔴 **unhealthy**: ระบบไม่สามารถทำงานได้

### Service Status
- ✅ **Database**: เชื่อมต่อ Prisma ได้
- ✅ **Weather API**: Open-Meteo API ทำงาน
- ✅ **AQI API**: AQICN API ทำงาง (ต้องมี token)

### Coverage Percentage
- เปอร์เซ็นต์จังหวัดที่มีข้อมูลสภาพอากาศ
- ควรมีค่า > 80% เพื่อให้ระบบทำงานเต็มประสิทธิภาพ

## ⚙️ Configuration

### Environment Variables
```env
# Required for AQI data
AQICN_API_TOKEN=your_token_here

# Database
DATABASE_URL="your_database_url"
```

### Default Settings
- **Auto-fetch Interval**: 30 นาที
- **Minimum Interval**: 5 นาที  
- **Maximum Interval**: 2 ชั่วโมง
- **Batch Size**: 5 จังหวัดต่อ batch
- **API Delay**: 1 วินาทีระหว่าง API calls
- **Max Retries**: 3 ครั้ง
- **HTTP Timeout**: 10 วินาที

## 🆚 เปรียบเทียบกับระบบเดิม

| ฟีเจอร์ | ระบบเดิม (setInterval) | ระบบใหม่ (Recursive setTimeout) |
|---------|----------------------|--------------------------------|
| Overlapping | ❌ อาจเกิดได้ | ✅ ป้องกันได้ |
| Adaptive Interval | ❌ ไม่มี | ✅ ปรับอัตโนมัติ |
| Manual Control | ❌ จำกัด | ✅ ควบคุมได้เต็มรูปแบบ |
| Monitoring | ❌ พื้นฐาน | ✅ ครบถ้วน |
| Error Handling | ❌ พื้นฐาน | ✅ Smart retry logic |
| Resource Usage | ❌ อาจใช้มาก | ✅ Efficient |

## 🔧 Troubleshooting

### ระบบไม่เริ่ม
```bash
# ตรวจสอบสุขภาพระบบ
npm run weather:test

# ตรวจสอบ environment variables
echo $AQICN_API_TOKEN
```

### Coverage ต่ำ
```bash
# ดูคำแนะนำ
npm run weather:suggestions

# ตรวจสอบข้อมูลจังหวัด
npm run prisma:studio
```

### API Error บ่อย
```bash
# เปลี่ยน interval ให้ยาวขึ้น
npm run weather-cli interval 60

# ตรวจสอบ API status
npm run weather:test
```

## 🚀 Production Deployment

### 1. ตั้งค่า Environment
```bash
export AQICN_API_TOKEN="your_token"
export DATABASE_URL="your_database_url"
```

### 2. ติดตั้ง Dependencies
```bash
npm install
npm run prisma:generate
npm run build
```

### 3. เริ่มระบบ
```bash
npm run weather:start
```

### 4. Monitor ระบบ
```bash
# ใน process แยก
npm run weather-cli monitor 5
```

## 📚 API Documentation

### WeatherService Methods

```typescript
// เริ่ม/หยุดระบบ
weatherService.startAutoFetch()
weatherService.stopAutoFetch()

// ตรวจสอบสถานะ
weatherService.isAutoFetchActive()
weatherService.getAutoFetchStatus()

// ปรับแต่ง
weatherService.updateAutoFetchInterval(minutes * 60 * 1000)
weatherService.triggerImmediateFetch()

// สุขภาพระบบ
weatherService.getSystemHealth()
weatherService.getSystemStatistics()
```

### AutoFetchManager Methods

```typescript
// Monitoring
manager.startMonitoring(intervalMinutes)
manager.stopMonitoring()

// การวิเคราะห์
manager.displaySystemSummary()
manager.runSystemTests()
manager.getOptimizationSuggestions()
```

## 📞 Support

หากพบปัญหาหรือต้องการความช่วยเหลือ:

1. ตรวจสอบ logs ใน console
2. เรียก `npm run weather:test` เพื่อตรวจสอบระบบ
3. ดูคำแนะนำจาก `npm run weather:suggestions`
4. ตรวจสอบ environment variables
5. ตรวจสอบการเชื่อมต่อ database และ APIs
