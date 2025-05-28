#!/usr/bin/env node

/**
 * CLI สำหรับจัดการ Weather Service Auto-Fetch System
 * 
 * การใช้งาน:
 * npm run weather-cli start        # เริ่ม auto-fetch
 * npm run weather-cli stop         # หยุด auto-fetch  
 * npm run weather-cli status       # ดูสถานะ
 * npm run weather-cli monitor      # เริ่ม monitoring
 * npm run weather-cli test         # ทดสอบระบบ
 * npm run weather-cli suggestions  # แสดงคำแนะนำ
 * npm run weather-cli interval 15  # เปลี่ยน interval เป็น 15 นาที
 * npm run weather-cli fetch        # บังคับ fetch ทันที
 */

import { WeatherService } from '../src/services/weatherService';
import AutoFetchManager from '../src/utils/AutoFetchManager';

class WeatherCLI {
  private weatherService: WeatherService;
  private manager: AutoFetchManager;

  constructor() {
    this.weatherService = new WeatherService();
    this.manager = new AutoFetchManager(this.weatherService);
  }

  async run(): Promise<void> {
    const args = process.argv.slice(2);
    const command = args[0];

    console.log('🌤️  Weather Service CLI\n');

    try {
      switch (command) {
        case 'start':
          await this.handleStart();
          break;
        case 'stop':
          await this.handleStop();
          break;
        case 'status':
          await this.handleStatus();
          break;
        case 'monitor':
          await this.handleMonitor(args[1]);
          break;
        case 'test':
          await this.handleTest();
          break;
        case 'suggestions':
          await this.handleSuggestions();
          break;
        case 'interval':
          await this.handleInterval(args[1]);
          break;
        case 'fetch':
          await this.handleFetch();
          break;
        case 'help':
        default:
          this.showHelp();
          break;
      }
    } catch (error) {
      console.error('❌ Error:', (error as Error).message);
      process.exit(1);
    }
  }

  private async handleStart(): Promise<void> {
    console.log('🚀 Starting auto-fetch system...');
    
    if (this.weatherService.isAutoFetchActive()) {
      console.log('⚠️  Auto-fetch is already running');
      return;
    }

    this.weatherService.startAutoFetch();
    console.log('✅ Auto-fetch started successfully');
    
    // แสดงสถานะหลังเริ่ม
    setTimeout(async () => {
      const status = this.weatherService.getAutoFetchStatus();
      console.log(`📊 Interval: ${(status.currentInterval / 1000 / 60).toFixed(1)} minutes`);
      console.log('💡 Use "npm run weather-cli monitor" to track progress');
    }, 1000);
  }

  private async handleStop(): Promise<void> {
    console.log('🛑 Stopping auto-fetch system...');
    
    if (!this.weatherService.isAutoFetchActive()) {
      console.log('⚠️  Auto-fetch is not running');
      return;
    }

    this.weatherService.stopAutoFetch();
    console.log('✅ Auto-fetch stopped successfully');
  }

  private async handleStatus(): Promise<void> {
    console.log('📊 Displaying system status...\n');
    await this.manager.displaySystemSummary();
  }

  private async handleMonitor(intervalStr?: string): Promise<void> {
    const interval = intervalStr ? parseInt(intervalStr) : 5;
    
    if (isNaN(interval) || interval < 1) {
      throw new Error('Invalid monitoring interval. Use a number >= 1 (minutes)');
    }

    console.log(`🔍 Starting system monitoring (interval: ${interval} minutes)`);
    console.log('Press Ctrl+C to stop monitoring\n');

    this.manager.startMonitoring(interval);

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Stopping monitoring...');
      this.manager.stopMonitoring();
      process.exit(0);
    });

    // Keep process alive
    await new Promise(() => {}); // infinite wait
  }

  private async handleTest(): Promise<void> {
    console.log('🧪 Running system tests...\n');
    await this.manager.runSystemTests();
  }

  private async handleSuggestions(): Promise<void> {
    console.log('💡 Getting optimization suggestions...\n');
    const suggestions = await this.manager.getOptimizationSuggestions();
    
    suggestions.forEach((suggestion, index) => {
      console.log(`${index + 1}. ${suggestion}`);
    });
    console.log('');
  }

  private async handleInterval(minutesStr?: string): Promise<void> {
    if (!minutesStr) {
      throw new Error('Please specify interval in minutes. Example: npm run weather-cli interval 15');
    }

    const minutes = parseInt(minutesStr);
    if (isNaN(minutes) || minutes < 5 || minutes > 180) {
      throw new Error('Invalid interval. Use a number between 5-180 minutes');
    }

    const milliseconds = minutes * 60 * 1000;
    console.log(`⚙️  Changing auto-fetch interval to ${minutes} minutes...`);
    
    this.weatherService.updateAutoFetchInterval(milliseconds);
    console.log('✅ Interval updated successfully');
  }

  private async handleFetch(): Promise<void> {
    console.log('⚡ Triggering immediate fetch...');
    
    try {
      const stats = await this.weatherService.triggerImmediateFetch();
      console.log('✅ Fetch completed successfully');
      console.log(`📊 Results: ${stats.successful}/${stats.total} provinces processed`);
      console.log(`⏱️  Duration: ${(stats.duration / 1000).toFixed(2)} seconds`);
    } catch (error) {
      if ((error as Error).message.includes('currently running')) {
        console.log('⚠️  Auto-fetch is currently running. Wait for it to complete or stop it first.');
      } else {
        throw error;
      }
    }
  }

  private showHelp(): void {
    console.log(`
🌤️  Weather Service CLI - Auto-Fetch Management

COMMANDS:
  start                    Start the auto-fetch system
  stop                     Stop the auto-fetch system
  status                   Show detailed system status
  monitor [interval]       Start monitoring (default: 5 minutes)
  test                     Run system health tests
  suggestions              Get optimization suggestions
  interval <minutes>       Change auto-fetch interval (5-120 minutes)
  fetch                    Trigger immediate data fetch
  help                     Show this help message

EXAMPLES:
  npm run weather-cli start
  npm run weather-cli monitor 3
  npm run weather-cli interval 15
  npm run weather-cli status

MONITORING:
  Use 'monitor' command to continuously track system performance.
  Press Ctrl+C to stop monitoring.

NOTES:
  - Minimum interval: 5 minutes
  - Maximum interval: 120 minutes (2 hours)
  - System automatically adjusts interval based on performance
  - Use 'suggestions' command for optimization tips
`);
  }
}

// เรียกใช้งาน CLI
if (require.main === module) {
  const cli = new WeatherCLI();
  cli.run().catch(error => {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  });
}

export default WeatherCLI;
