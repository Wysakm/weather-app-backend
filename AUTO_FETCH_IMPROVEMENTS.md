# การปรับปรุง Auto-Fetch System

## ปัญหาของ setInterval เดิม

### 1. **Overlapping Executions** 
```javascript
// ปัญหา: หากงานใช้เวลามากกว่า interval จะทำงานซ้อนทับกัน
setInterval(async () => {
  await longRunningTask(); // อาจใช้เวลา 45 นาที
}, 30 * 60 * 1000); // 30 นาที
```

### 2. **Fixed Interval**
- ไม่สามารถปรับ interval ตามสถานการณ์ได้
- หาก API ล่ม ยังคงเรียกต่อเนื่อง
- หากระบบช้า ไม่มีการปรับตัว

### 3. **Memory Leak Risk**
- หาก `stopAutoFetch()` ไม่ถูกเรียก จะมี interval ทำงานต่อไป
- ไม่มีการตรวจสอบสถานะการทำงาน

## วิธีแก้ไขด้วย Recursive setTimeout

### 1. **ป้องกัน Overlapping**
```typescript
private async scheduleNextAutoFetch(nextInterval?: number): Promise<void> {
  if (!this.shouldContinueAutoFetch) {
    this.isAutoFetchRunning = false;
    return;
  }

  this.timeoutId = setTimeout(async () => {
    if (!this.shouldContinueAutoFetch) {
      this.isAutoFetchRunning = false;
      return;
    }
    await this.runAutoFetchCycle(); // รอให้งานเสร็จก่อนกำหนด timeout ใหม่
  }, interval);
}
```

### 2. **Adaptive Interval**
```typescript
private calculateNextInterval(stats: BatchProcessingStats): number {
  const successRate = (stats.successful / stats.total) * 100;
  const duration = stats.duration;

  // ผลลัพธ์ดี = interval ปกติ
  if (successRate >= 90 && duration < 60000) {
    return this.AUTO_FETCH_INTERVAL;
  }

  // ผลลัพธ์แย่ = ขยาย interval
  if (successRate < 50) {
    return Math.min(this.AUTO_FETCH_INTERVAL * 2, this.MAX_FETCH_INTERVAL);
  }

  // ใช้เวลานาน = ขยาง interval เล็กน้อย
  if (duration > 180000) {
    return Math.min(this.AUTO_FETCH_INTERVAL * 1.5, this.MAX_FETCH_INTERVAL);
  }

  return this.AUTO_FETCH_INTERVAL;
}
```

### 3. **Better State Management**
```typescript
export class WeatherService {
  private timeoutId?: NodeJS.Timeout;
  private isAutoFetchRunning = false;
  private shouldContinueAutoFetch = false;
  
  // ข้อมูล config ที่ยืดหยุ่นมากขึ้น
  private readonly MIN_FETCH_INTERVAL = 5 * 60 * 1000; // 5 นาที
  private readonly MAX_FETCH_INTERVAL = 2 * 60 * 60 * 1000; // 2 ชั่วโมง
}
```

## ฟีเจอร์ใหม่ที่เพิ่มเข้ามา

### 1. **Manual Control**
```typescript
// ตรวจสอบสถานะ
weatherService.isAutoFetchActive();

// เปลี่ยน interval แบบ dynamic
weatherService.updateAutoFetchInterval(15 * 60 * 1000); // 15 นาที

// บังคับ fetch ทันที
await weatherService.triggerImmediateFetch();

// ดูสถานะการทำงาน
const status = weatherService.getAutoFetchStatus();
```

### 2. **Smart Retry Logic**
- หาก error เกิดขึ้น จะขยาย interval เป็น 2 เท่า
- หากต่อเนื่อง จะไม่เกิน MAX_FETCH_INTERVAL

### 3. **Performance-Based Scheduling**
- หากประมวลผลเร็ว + ผลลัพธ์ดี = interval ปกติ
- หากช้าหรือผลลัพธ์แย่ = ขยาย interval

## ข้อดีของระบบใหม่

### ✅ **ไม่มี Overlapping**
- รอให้งานเสร็จก่อนกำหนดรอบใหม่
- ป้องกันการใช้ทรัพยากรซ้ำซ้อน

### ✅ **Adaptive Performance**
- ปรับ interval ตามผลลัพธ์อัตโนมัติ
- ลดการโหลดเมื่อระบบมีปัญหา

### ✅ **Better Resource Management**
- ใช้ `setTimeout` แทน `setInterval`
- การจัดการ memory ที่ดีกว่า

### ✅ **More Control**
- สามารถหยุด/เริ่ม/เปลี่ยน interval ได้อย่างยืดหยุ่น
- บังคับ fetch ทันทีได้เมื่อต้องการ

### ✅ **Better Monitoring**
- ติดตามสถานะการทำงานได้แม่นยำขึ้น
- รองรับ health checks

## การใช้งาน

```typescript
// เริ่มระบบ
const weatherService = new WeatherService();
weatherService.startAutoFetch();

// ตรวจสอบสถานะ
console.log('Auto-fetch active:', weatherService.isAutoFetchActive());

// เปลี่ยน interval เป็น 15 นาที
weatherService.updateAutoFetchInterval(15 * 60 * 1000);

// บังคับ fetch ทันที
const stats = await weatherService.triggerImmediateFetch();

// หยุดระบบ
weatherService.stopAutoFetch();
```

## สรุป

การเปลี่ยนจาก `setInterval` เป็น **Recursive setTimeout** พร้อม **Adaptive Interval** ทำให้:

1. **ปลอดภัยกว่า** - ไม่มี overlapping executions
2. **ชาญฉลาดกว่า** - ปรับ interval ตามสถานการณ์
3. **ยืดหยุ่นกว่า** - สามารถควบคุมได้มากขึ้น
4. **มีประสิทธิภาพกว่า** - ใช้ทรัพยากรอย่างเหมาะสม

ระบบใหม่นี้เหมาะสำหรับ production environment ที่ต้องการความเสถียรและการปรับตัวอัตโนมัติ
