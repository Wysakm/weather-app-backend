import { WeatherService } from '../services/weatherService';

/**
 * Auto-Fetch Manager - utility สำหรับจัดการระบบ auto-fetch
 */
export class AutoFetchManager {
  private weatherService: WeatherService;
  private monitoringInterval?: NodeJS.Timeout;

  constructor(weatherService: WeatherService) {
    this.weatherService = weatherService;
  }

  /**
   * เริ่มการ monitor สถานะระบบ
   * @param intervalMinutes ความถี่ในการ monitor (นาที)
   */
  startMonitoring(intervalMinutes: number = 5): void {
    console.log(`🔍 Starting system monitoring every ${intervalMinutes} minutes...`);
    
    this.monitoringInterval = setInterval(async () => {
      await this.checkSystemStatus();
    }, intervalMinutes * 60 * 1000);

    // ตรวจสอบครั้งแรกทันที
    this.checkSystemStatus();
  }

  /**
   * หยุดการ monitor
   */
  stopMonitoring(): void {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = undefined;
      console.log('🛑 Stopped system monitoring');
    }
  }

  /**
   * ตรวจสอบสถานะระบบและแสดงผล
   */
  private async checkSystemStatus(): Promise<void> {
    try {
      const health = await this.weatherService.getSystemHealth();
      const stats = await this.weatherService.getSystemStatistics();
      const autoFetchStatus = this.weatherService.getAutoFetchStatus();

      console.log('\n═══ System Status Report ═══');
      console.log(`🕐 Time: ${new Date().toLocaleString()}`);
      console.log(`🟢 System Health: ${health.status}`);
      console.log(`🔄 Auto-fetch: ${autoFetchStatus.isRunning ? 'Running' : 'Stopped'}`);
      console.log(`⏱️  Current Interval: ${(autoFetchStatus.currentInterval / 1000 / 60).toFixed(1)} min`);
      console.log(`📊 Province Coverage: ${stats.provinceCoverage.coveragePercentage}%`);
      
      if (health.lastUpdate) {
        const ageHours = (Date.now() - health.lastUpdate.getTime()) / (1000 * 60 * 60);
        console.log(`📅 Data Age: ${ageHours.toFixed(1)} hours`);
      }

      // แจ้งเตือนหากมีปัญหา
      if (health.status === 'unhealthy') {
        console.log('🚨 WARNING: System is unhealthy!');
      } else if (health.status === 'degraded') {
        console.log('⚠️  NOTICE: System performance is degraded');
      }

      if (stats.provinceCoverage.coveragePercentage < 80) {
        console.log('⚠️  NOTICE: Low province coverage');
      }

      console.log('═══════════════════════════\n');

    } catch (error) {
      console.error('❌ Error checking system status:', error);
    }
  }

  /**
   * แสดงสรุปการทำงานของระบบ
   */
  async displaySystemSummary(): Promise<void> {
    console.log('\n🔍 === WEATHER SERVICE SYSTEM SUMMARY ===\n');

    const health = await this.weatherService.getSystemHealth();
    const stats = await this.weatherService.getSystemStatistics();
    const autoFetchStatus = this.weatherService.getAutoFetchStatus();

    // สถานะโดยรวม
    console.log('📊 Overall Status:');
    console.log(`   Health: ${this.getHealthIcon(health.status)} ${health.status.toUpperCase()}`);
    console.log(`   Auto-fetch: ${autoFetchStatus.isRunning ? '🟢 Running' : '🔴 Stopped'}`);
    console.log('');

    // การทำงานของ services
    console.log('🔧 Service Status:');
    console.log(`   Database: ${health.services.database ? '✅' : '❌'}`);
    console.log(`   Weather API: ${health.services.weatherApi ? '✅' : '❌'}`);
    console.log(`   AQI API: ${health.services.aqiApi ? '✅' : '❌'}`);
    console.log('');

    // ข้อมูลความครอบคลุม
    console.log('📍 Data Coverage:');
    console.log(`   Total Provinces: ${stats.provinceCoverage.total}`);
    console.log(`   With Weather Data: ${stats.provinceCoverage.withWeatherData} (${stats.provinceCoverage.coveragePercentage}%)`);
    console.log(`   With AQI Data: ${stats.provinceCoverage.withAqiData}`);
    console.log('');

    // ข้อมูลความสดใหม่
    if (stats.dataFreshness.newestRecord) {
      console.log('🕐 Data Freshness:');
      console.log(`   Latest Update: ${stats.dataFreshness.newestRecord.toLocaleString()}`);
      console.log(`   Data Age: ${stats.dataFreshness.averageAge?.toFixed(1)} hours`);
      console.log('');
    }

    // การตั้งค่า Auto-fetch
    console.log('⚙️  Auto-fetch Configuration:');
    console.log(`   Current Interval: ${(autoFetchStatus.currentInterval / 1000 / 60).toFixed(1)} minutes`);
    console.log(`   Timeout Scheduled: ${autoFetchStatus.hasTimeoutScheduled ? 'Yes' : 'No'}`);
    console.log('');

    console.log('========================================\n');
  }

  /**
   * รับ icon ตามสถานะ health
   */
  private getHealthIcon(status: string): string {
    switch (status) {
      case 'healthy': return '🟢';
      case 'degraded': return '🟡';
      case 'unhealthy': return '🔴';
      default: return '❓';
    }
  }

  /**
   * ทดสอบระบบทั้งหมด
   */
  async runSystemTests(): Promise<void> {
    console.log('🧪 Running system tests...\n');

    const tests = [
      { name: 'Health Check', test: () => this.weatherService.getSystemHealth() },
      { name: 'Statistics Check', test: () => this.weatherService.getSystemStatistics() },
      { name: 'Auto-fetch Status', test: () => this.weatherService.getAutoFetchStatus() },
    ];

    for (const { name, test } of tests) {
      try {
        console.log(`Testing ${name}...`);
        const result = await test();
        console.log(`✅ ${name}: PASSED`);
      } catch (error) {
        console.log(`❌ ${name}: FAILED - ${(error as Error).message}`);
      }
    }

    console.log('\n🧪 System tests completed\n');
  }

  /**
   * คำแนะนำการ optimize ระบบ
   */
  async getOptimizationSuggestions(): Promise<string[]> {
    const suggestions: string[] = [];
    const health = await this.weatherService.getSystemHealth();
    const stats = await this.weatherService.getSystemStatistics();

    // ตรวจสอบ health status
    if (health.status === 'unhealthy') {
      suggestions.push('🚨 System is unhealthy - check database and API connectivity');
    }

    if (health.status === 'degraded') {
      suggestions.push('⚠️  System performance is degraded - consider checking API rate limits');
    }

    // ตรวจสอบ coverage
    if (stats.provinceCoverage.coveragePercentage < 80) {
      suggestions.push('📍 Low province coverage - some provinces may be missing coordinates');
    }

    // ตรวจสอบ data freshness
    if (stats.dataFreshness.averageAge && stats.dataFreshness.averageAge > 2) {
      suggestions.push('🕐 Data is getting old - consider reducing auto-fetch interval');
    }

    // ตรวจสอบ services
    if (!health.services.weatherApi) {
      suggestions.push('🌤️  Weather API is down - check Open-Meteo service status');
    }

    if (!health.services.aqiApi) {
      suggestions.push('🌬️  AQI API is down - check AQICN token and service status');
    }

    if (suggestions.length === 0) {
      suggestions.push('✅ System is running optimally - no suggestions at this time');
    }

    return suggestions;
  }
}

// Export สำหรับใช้งาน
export default AutoFetchManager;
