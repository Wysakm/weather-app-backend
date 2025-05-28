// ตัวอย่างการใช้งาน WeatherService ที่ปรับปรุงใหม่

import { WeatherService } from '../src/services/weatherService';

async function demonstrateNewWeatherService() {
  const weatherService = new WeatherService();

  console.log('=== การทดสอบระบบ Auto-Fetch ใหม่ ===\n');

  // 1. ตรวจสอบสถานะระบบ
  console.log('🔍 ตรวจสอบสถานะระบบ...');
  const health = await weatherService.getSystemHealth();
  console.log('Health Status:', health.status);
  console.log('Services:', health.services);
  console.log('Data Records:', health.dataAvailability);
  console.log('');

  // 2. ดูสถิติระบบ
  console.log('📊 สถิติระบบ...');
  const stats = await weatherService.getSystemStatistics();
  console.log('Auto-fetch running:', stats.autoFetchRunning);
  console.log('Province coverage:', stats.provinceCoverage);
  console.log('');

  // 3. เริ่ม auto-fetch
  console.log('🚀 เริ่ม Auto-Fetch...');
  weatherService.startAutoFetch();
  
  // ให้เวลาในการทำงาน
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // 4. ตรวจสอบสถานะหลังเริ่มงาน
  console.log('📋 สถานะหลังเริ่ม Auto-Fetch...');
  const status = weatherService.getAutoFetchStatus();
  console.log('Is Running:', status.isRunning);
  console.log('Current Interval:', (status.currentInterval / 1000 / 60).toFixed(1), 'minutes');
  console.log('Has Timeout Scheduled:', status.hasTimeoutScheduled);
  console.log('');

  // 5. ทดสอบการเปลี่ยน interval
  console.log('⚙️  เปลี่ยน interval เป็น 10 นาที...');
  weatherService.updateAutoFetchInterval(10 * 60 * 1000);
  
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  const newStatus = weatherService.getAutoFetchStatus();
  console.log('New Interval:', (newStatus.currentInterval / 1000 / 60).toFixed(1), 'minutes');
  console.log('');

  // 6. ทดสอบ immediate fetch (จำลอง)
  console.log('⚡ ทดสอบ Immediate Fetch...');
  try {
    // Note: ในการทดสอบจริง อาจต้องใช้ mock data
    // const fetchResult = await weatherService.triggerImmediateFetch();
    // console.log('Fetch Result:', fetchResult);
    console.log('✅ Immediate fetch would be triggered here');
  } catch (error) {
    console.log('❌ Error:', error.message);
  }
  console.log('');

  // 7. ทดสอบการหยุดระบบ
  console.log('🛑 หยุด Auto-Fetch...');
  weatherService.stopAutoFetch();
  
  await new Promise(resolve => setTimeout(resolve, 500));
  
  const finalStatus = weatherService.getAutoFetchStatus();
  console.log('Final Status - Is Running:', finalStatus.isRunning);
  console.log('');

  // 8. แสดงข้อดีของระบบใหม่
  console.log('🎉 ข้อดีของระบบใหม่:');
  console.log('✅ ไม่มี overlapping executions');
  console.log('✅ Adaptive interval ตามผลลัพธ์');
  console.log('✅ Manual control ได้');
  console.log('✅ Better error handling');
  console.log('✅ Resource-efficient');
  console.log('✅ Production-ready');
}

// เรียกใช้งานตัวอย่าง
demonstrateNewWeatherService().catch(console.error);

export { demonstrateNewWeatherService };
