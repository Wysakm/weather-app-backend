import { PrismaClient } from '@prisma/client';
import axios from 'axios';

const prisma = new PrismaClient();

interface WeatherResponse {
  current: {
    weather_code: number;
    temperature_2m: number;
    rain: number;
    precipitation: number;
    apparent_temperature: number;
  };
  daily: {
    sunrise: string[];
    sunset: string[];
    uv_index_max: number[];
    rain_sum: number[];
    precipitation_probability_max: number[];
    temperature_2m_min: number[];
    temperature_2m_max: number[];
    wind_speed_10m_max: number[];
  };
}

interface AqiResponse {
  data: {
    aqi: number;
    iaqi: {
      pm25?: { v: number };
      pm10?: { v: number };
      no2?: { v: number };
      so2?: { v: number };
      o3?: { v: number };
      co?: { v: number };
    };
  };
}

interface ProcessingResult {
  success: boolean;
  province: string;
  error?: string;
}

interface BatchProcessingStats {
  total: number;
  successful: number;
  failed: number;
  duration: number;
  errors: string[];
}

export class WeatherService {
  private timeoutId?: NodeJS.Timeout;
  private isAutoFetchRunning = false;
  private shouldContinueAutoFetch = false;
  private readonly API_DELAY = 1000; // 1 วินาทีระหว่างการเรียก API
  private readonly AUTO_FETCH_INTERVAL = 3 * 60 * 60 * 1000; // 3 ชั่วโมง (default)
  private readonly MIN_FETCH_INTERVAL = 5 * 60 * 1000; // 5 นาที (minimum)
  private readonly MAX_FETCH_INTERVAL = 2 * 60 * 60 * 1000; // 2 ชั่วโมง (maximum)
  private readonly BATCH_SIZE = 5; // จำนวนจังหวัดที่ประมวลผลพร้อมกัน
  private readonly MAX_RETRIES = 3; // จำนวนครั้งสูงสุดในการ retry
  private readonly RETRY_DELAY = 2000; // หน่วงเวลาก่อน retry (milliseconds)
  private readonly HTTP_TIMEOUT = 10000; // timeout สำหรับ HTTP requests (10 วินาที)

  /**
   * หน่วงเวลาแบบ exponential backoff
   * @param attempt ครั้งที่ของการ retry
   * @returns เวลาหน่วง (milliseconds)
   */
  private calculateBackoffDelay(attempt: number): number {
    return Math.min(this.RETRY_DELAY * Math.pow(2, attempt), 10000);
  }

  /**
   * ลองทำงานซ้ำในกรณีที่ผิดพลาด
   * @param operation ฟังก์ชันที่ต้องการทำซ้ำ
   * @param maxRetries จำนวนครั้งสูงสุด
   * @param operationName ชื่อของ operation สำหรับ logging
   * @returns ผลลัพธ์ของ operation
   */
  private async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = this.MAX_RETRIES,
    operationName: string = 'operation'
  ): Promise<T> {
    let lastError: Error;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error as Error;

        if (attempt === maxRetries) {
          console.error(`❌ ${operationName} failed after ${maxRetries + 1} attempts:`, lastError.message);
          throw lastError;
        }

        const delay = this.calculateBackoffDelay(attempt);
        console.warn(`⚠️  ${operationName} failed (attempt ${attempt + 1}/${maxRetries + 1}), retrying in ${delay}ms...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * สร้าง HTTP client ที่มี configuration ที่เหมาะสม
   * @returns Axios instance
   */
  private createHttpClient() {
    const config = {
      timeout: this.HTTP_TIMEOUT,
      headers: {
        'User-Agent': 'WeatherApp/1.0',
      },
    };

    const client = axios.create(config);

    // เพิ่ม response interceptor สำหรับ error handling
    client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.code === 'ECONNABORTED') {
          throw new Error('Request timeout');
        }
        if (error.response?.status >= 500) {
          throw new Error(`Server error: ${error.response.status}`);
        }
        if (error.response?.status === 429) {
          throw new Error('Rate limit exceeded');
        }
        throw error;
      }
    );

    return client;
  }

  /**
   * ล้างข้อมูลสภาพอากาศและคุณภาพอากาศเก่า (เฉพาะข้อมูลระดับจังหวัด)
   * @returns จำนวนรายการที่ถูกลบ
   */
  async clearOldWeatherData(): Promise<{ deletedWeather: number; deletedAqi: number }> {
    try {
      console.log('🗑️  Clearing old weather data...');

      const [deletedWeather, deletedAqi] = await Promise.all([
        prisma.weatherData.deleteMany({
          where: {
            id_province: { not: null } // ข้อมูลระดับจังหวัด
          }
        }),
        prisma.aqiData.deleteMany({
          where: {
            id_province: { not: null } // ข้อมูลระดับจังหวัด
          }
        })
      ]);

      console.log(`🗑️  Deleted ${deletedWeather.count} weather records`);
      console.log(`🗑️  Deleted ${deletedAqi.count} AQI records`);

      return {
        deletedWeather: deletedWeather.count,
        deletedAqi: deletedAqi.count
      };
    } catch (error) {
      console.error('❌ Error clearing old weather data:', error);
      throw error;
    }
  }

  /**
   * ดึงและจัดเก็บข้อมูลสภาพอากาศสำหรับจังหวัดทั้งหมด (แบบ batch processing)
   * @param clearOldData ต้องการล้างข้อมูลเก่าก่อนหรือไม่
   * @returns สถิติการประมวลผล
   */
  async fetchAndStoreWeatherData(clearOldData = false): Promise<BatchProcessingStats> {
    const startTime = Date.now();
    const stats: BatchProcessingStats = {
      total: 0,
      successful: 0,
      failed: 0,
      duration: 0,
      errors: []
    };

    try {
      // ล้างข้อมูลเก่าถ้าต้องการ
      if (clearOldData) {
        await this.clearOldWeatherData();
      }

      // ดึงข้อมูลจังหวัดทั้งหมดที่มี coordinates
      const allProvinces = await prisma.msProvince.findMany();
      const provinces = allProvinces.filter(province =>
        province.latitude !== null &&
        province.longitude !== null
      );

      stats.total = provinces.length;
      console.log(`📍 Found ${provinces.length} provinces with coordinates`);

      // แบ่งจังหวัดเป็น batch
      const batches = this.chunkArray(provinces, this.BATCH_SIZE);
      console.log(`🔄 Processing ${batches.length} batches of ${this.BATCH_SIZE} provinces each`);

      // ประมวลผลแต่ละ batch
      for (let i = 0; i < batches.length; i++) {
        const batch = batches[i];
        console.log(`📦 Processing batch ${i + 1}/${batches.length} (${batch.length} provinces)`);

        // ประมวลผลจังหวัดใน batch นี้แบบ parallel
        const batchPromises = batch.map(province =>
          this.processProvinceWithErrorHandling(province)
        );

        const batchResults = await Promise.allSettled(batchPromises);

        // อัพเดทสถิติ
        batchResults.forEach((result, index) => {
          if (result.status === 'fulfilled' && result.value.success) {
            stats.successful++;
          } else {
            stats.failed++;
            const error = result.status === 'rejected'
              ? result.reason.message
              : result.value.error;
            stats.errors.push(`${batch[index].name}: ${error}`);
          }
        });

        // หน่วงเวลาระหว่าง batch เพื่อหลีกเลี่ยง rate limiting
        if (i < batches.length - 1) {
          await new Promise(resolve => setTimeout(resolve, this.API_DELAY));
        }
      }

      stats.duration = Date.now() - startTime;

      console.log(`🎉 Batch processing completed:`);
      console.log(`   ✅ Successful: ${stats.successful}/${stats.total}`);
      console.log(`   ❌ Failed: ${stats.failed}/${stats.total}`);
      console.log(`   ⏱️  Duration: ${(stats.duration / 1000).toFixed(2)}s`);

      if (stats.errors.length > 0) {
        console.log(`⚠️  Errors encountered:`);
        stats.errors.slice(0, 5).forEach(error => console.log(`   • ${error}`));
        if (stats.errors.length > 5) {
          console.log(`   ... and ${stats.errors.length - 5} more errors`);
        }
      }

      return stats;
    } catch (error) {
      stats.duration = Date.now() - startTime;
      console.error('❌ Error in batch processing:', error);
      throw error;
    }
  }

  /**
   * แบ่ง array เป็น chunks
   * @param array array ที่ต้องการแบ่ง
   * @param size ขนาดของแต่ละ chunk
   * @returns array ของ chunks
   */
  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * ประมวลผลจังหวัดเดียวพร้อม error handling
   * @param province ข้อมูลจังหวัด
   * @returns ผลลัพธ์การประมวลผล
   */
  private async processProvinceWithErrorHandling(province: any): Promise<ProcessingResult> {
    try {
      await this.processProvince(province);
      return {
        success: true,
        province: province.name
      };
    } catch (error) {
      return {
        success: false,
        province: province.name,
        error: (error as Error).message
      };
    }
  }

  /**
   * ประมวลผลจังหวัดเดียว (ดึงและบันทึกข้อมูล)
   * @param province ข้อมูลจังหวัด
   */
  private async processProvince(province: any): Promise<void> {
    const lat = Number(province.latitude);
    const lon = Number(province.longitude);

    console.log(`🌤️  Processing ${province.name}...`);

    // ดึงข้อมูลสภาพอากาศและคุณภาพอากาศพร้อมกัน
    const [weatherData, aqiData] = await Promise.all([
      this.withRetry(
        () => this.fetchWeatherData(lat, lon),
        this.MAX_RETRIES,
        `Weather data for ${province.name}`
      ),
      this.withRetry(
        () => this.fetchAqiData(lat, lon),
        this.MAX_RETRIES,
        `AQI data for ${province.name}`
      )
    ]);

    // บันทึกข้อมูลใน database transaction
    await this.saveProvinceDataInTransaction(province, weatherData, aqiData);

    console.log(`✅ Completed processing ${province.name}`);
  }

  /**
   * บันทึกข้อมูลจังหวัดใน database transaction
   * @param province ข้อมูลจังหวัด
   * @param weatherData ข้อมูลสภาพอากาศ
   * @param aqiData ข้อมูลคุณภาพอากาศ
   */
  private async saveProvinceDataInTransaction(
    province: any,
    weatherData: WeatherResponse | null,
    aqiData: AqiResponse | null
  ): Promise<void> {
    await prisma.$transaction(async (tx) => {
      // บันทึกข้อมูลสภาพอากาศ
      if (weatherData) {
        await tx.weatherData.create({
          data: {
            id_province: province.id_province,
            weather_code: weatherData.current.weather_code,
            temperature_2m: weatherData.current.temperature_2m,
            rain: weatherData.current.rain,
            precipitation: weatherData.current.precipitation,
            apparent_temperature: weatherData.current.apparent_temperature,
            sunrise: new Date(weatherData.daily.sunrise[0]), // แปลงเป็น Date
            sunset: new Date(weatherData.daily.sunset[0]),   // แปลงเป็น Date
            uv_index_max: weatherData.daily.uv_index_max[0],
            rain_sum: weatherData.daily.rain_sum[0],
            precipitation_probability_max: weatherData.daily.precipitation_probability_max[0],
            temperature_2m_min: weatherData.daily.temperature_2m_min[0],
            temperature_2m_max: weatherData.daily.temperature_2m_max[0],
            wind_speed_10m_max: weatherData.daily.wind_speed_10m_max[0],
          },
        });
      }

      // บันทึกข้อมูลคุณภาพอากาศ
      if (aqiData) {
        await tx.aqiData.create({
          data: {
            id_province: province.id_province,
            aqi: aqiData.data.aqi,
            // ใช้ค่า PM2.5 จริงหากมี หรือแปลงจาก AQI
            pm25: this.convertAqiToPm25(aqiData.data.iaqi.pm25?.v || aqiData.data.aqi),
            pm10: aqiData.data.iaqi.pm10?.v || null,
            no2: aqiData.data.iaqi.no2?.v || null,
            so2: aqiData.data.iaqi.so2?.v || null,
            o3: aqiData.data.iaqi.o3?.v || null,
            co: aqiData.data.iaqi.co?.v || null,
          },
        });
      }
    });
  }

  /**
   * ดึงข้อมูลสภาพอากาศสำหรับจังหวัดเฉพาะ
   * @param provinceId ID ของจังหวัด
   * @returns ผลลัพธ์การดึงข้อมูล
   */
  async fetchWeatherForProvince(provinceId: string): Promise<{
    success: boolean;
    province: string;
    data: { weather: any; aqi: any };
  }> {
    try {
      const province = await prisma.msProvince.findUnique({
        where: { id_province: provinceId }
      });

      if (!province) {
        throw new Error(`Province with ID ${provinceId} not found`);
      }

      if (!province.latitude || !province.longitude) {
        throw new Error(`Province ${province.name} has no coordinates`);
      }

      console.log(`🌤️  Fetching weather for ${province.name}...`);

      // ดึงข้อมูลสภาพอากาศ
      const weatherData = await this.fetchWeatherData(
        Number(province.latitude),
        Number(province.longitude)
      );

      // ดึงข้อมูลคุณภาพอากาศ
      const aqiData = await this.fetchAqiData(
        Number(province.latitude),
        Number(province.longitude)
      );

      // บันทึกข้อมูล
      const results: { weather: any; aqi: any } = { weather: null, aqi: null };

      if (weatherData) {
        results.weather = await prisma.weatherData.create({
          data: {
            id_province: province.id_province,
            weather_code: weatherData.current.weather_code,
            temperature_2m: weatherData.current.temperature_2m,
            rain: weatherData.current.rain,
            precipitation: weatherData.current.precipitation,
            apparent_temperature: weatherData.current.apparent_temperature,
            sunrise: new Date(weatherData.daily.sunrise[0]), // แปลงเป็น Date
            sunset: new Date(weatherData.daily.sunset[0]),   // แปลงเป็น Date
            uv_index_max: weatherData.daily.uv_index_max[0],
            rain_sum: weatherData.daily.rain_sum[0],
            precipitation_probability_max: weatherData.daily.precipitation_probability_max[0],
            temperature_2m_min: weatherData.daily.temperature_2m_min[0],
            temperature_2m_max: weatherData.daily.temperature_2m_max[0],
            wind_speed_10m_max: weatherData.daily.wind_speed_10m_max[0],
          },
        });
      }

      if (aqiData) {
        results.aqi = await prisma.aqiData.create({
          data: {
            id_province: province.id_province,
            aqi: aqiData.data.aqi,
            pm25: this.convertAqiToPm25(aqiData.data.iaqi.pm25?.v || aqiData.data.aqi),
            pm10: aqiData.data.iaqi.pm10?.v || null,
            no2: aqiData.data.iaqi.no2?.v || null,
            so2: aqiData.data.iaqi.so2?.v || null,
            o3: aqiData.data.iaqi.o3?.v || null,
            co: aqiData.data.iaqi.co?.v || null,
          },
        });
      }

      return {
        success: true,
        province: province.name,
        data: results
      };

    } catch (error) {
      console.error(`❌ Error fetching weather for province:`, error);
      throw error;
    }
  }

  /**
   * ดึงข้อมูลสภาพอากาศจาก Open-Meteo API
   * @param lat ละติจูด
   * @param lon ลองจิจูด
   * @returns ข้อมูลสภาพอากาศ
   */
  private async fetchWeatherData(lat: number, lon: number): Promise<WeatherResponse | null> {
    try {
      const httpClient = this.createHttpClient();
      // ใช้ timezone=auto เพื่อให้ API เลือก timezone ตามพิกัดที่ส่งไป
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=weather_code,temperature_2m,rain,precipitation,apparent_temperature&daily=sunrise,sunset,uv_index_max,rain_sum,precipitation_probability_max,temperature_2m_min,temperature_2m_max,wind_speed_10m_max&timezone=auto`;

      const response = await httpClient.get(url);
      return response.data as WeatherResponse;
    } catch (error) {
      console.error(`Error fetching weather data for coordinates (${lat}, ${lon}):`, (error as Error).message);
      return null;
    }
  }

  /**
   * ดึงข้อมูลคุณภาพอากาศจาก AQICN API
   * @param lat ละติจูด
   * @param lon ลองจิจูด
   * @returns ข้อมูลคุณภาพอากาศ
   */
  private async fetchAqiData(lat: number, lon: number): Promise<AqiResponse | null> {
    try {
      const aqiToken = process.env.AQICN_API_TOKEN;

      if (!aqiToken) {
        console.warn('⚠️  AQICN API token is not configured - AQI data will be skipped');
        return null;
      }

      const httpClient = this.createHttpClient();
      const response = await httpClient.get(
        `https://api.waqi.info/feed/geo:${lat};${lon}/?token=${aqiToken}`
      );

      // ตรวจสอบ response status จาก API
      const responseData = response.data as any;
      if (responseData.status !== 'ok') {
        throw new Error(`AQI API returned status: ${responseData.status}`);
      }

      return response.data as AqiResponse;
    } catch (error) {
      console.error(`Error fetching AQI data for coordinates (${lat}, ${lon}):`, (error as Error).message);
      return null;
    }
  }

  /**
   * คำนวณ interval ถัดไปตามผลลัพธ์ของการทำงาน
   * @param stats สถิติการทำงานล่าสุด
   * @returns interval สำหรับรอบถัดไป (milliseconds)
   */
  private calculateNextInterval(stats: BatchProcessingStats): number {
    const successRate = (stats.successful / stats.total) * 100;
    const duration = stats.duration;

    // ถ้าผลลัพธ์ดี ใช้ interval ปกติ
    if (successRate >= 90 && duration < 60000) { // 60 วินาที
      return this.AUTO_FETCH_INTERVAL;
    }

    // ถ้าผลลัพธ์แย่ ขยายเวลา
    if (successRate < 50) {
      return Math.min(this.AUTO_FETCH_INTERVAL * 2, this.MAX_FETCH_INTERVAL);
    }

    // ถ้าใช้เวลานาน ขยายเวลาเล็กน้อย
    if (duration > 180000) { // 3 นาที
      return Math.min(this.AUTO_FETCH_INTERVAL * 1.5, this.MAX_FETCH_INTERVAL);
    }

    return this.AUTO_FETCH_INTERVAL;
  }

  /**
   * ฟังก์ชันสำหรับการทำงานแบบ recursive
   */
  private async scheduleNextAutoFetch(nextInterval?: number): Promise<void> {
    if (!this.shouldContinueAutoFetch) {
      this.isAutoFetchRunning = false;
      return;
    }

    const interval = nextInterval || this.AUTO_FETCH_INTERVAL;
    console.log(`⏰ Next auto-fetch scheduled in ${(interval / 1000 / 60).toFixed(1)} minutes`);

    this.timeoutId = setTimeout(async () => {
      if (!this.shouldContinueAutoFetch) {
        this.isAutoFetchRunning = false;
        return;
      }

      await this.runAutoFetchCycle();
    }, interval);
  }

  /**
   * เรียกใช้งานหนึ่งรอบของ auto-fetch
   */
  private async runAutoFetchCycle(): Promise<void> {
    const startTime = Date.now();
    console.log('⏰ Auto-fetching weather data started...');

    try {
      const stats = await this.fetchAndStoreWeatherData(true);
      const duration = (Date.now() - startTime) / 1000;

      console.log('✅ Auto-fetch completed successfully');
      console.log(`   📊 Statistics: ${stats.successful}/${stats.total} provinces processed`);
      console.log(`   ⏱️  Total duration: ${duration.toFixed(2)}s`);

      // Log warning if success rate is low
      const successRate = (stats.successful / stats.total) * 100;
      if (successRate < 80) {
        console.warn(`⚠️  Low success rate: ${successRate.toFixed(1)}%`);
      }

      // กำหนด interval ถัดไปตามผลลัพธ์
      const nextInterval = this.calculateNextInterval(stats);
      await this.scheduleNextAutoFetch(nextInterval);

    } catch (error) {
      const duration = (Date.now() - startTime) / 1000;
      console.error('❌ Auto-fetch failed:', (error as Error).message);
      console.error(`   ⏱️  Failed after: ${duration.toFixed(2)}s`);

      // ในกรณีที่ error ให้ขยาย interval
      const errorInterval = Math.min(this.AUTO_FETCH_INTERVAL * 2, this.MAX_FETCH_INTERVAL);
      await this.scheduleNextAutoFetch(errorInterval);
    }
  }

  /**
   * เริ่มการดึงข้อมูลอัตโนมัติแบบ adaptive interval
   */
  startAutoFetch(): void {
    if (this.isAutoFetchRunning) {
      console.log('⚠️  Auto-fetch is already running');
      return;
    }

    console.log('🕒 Starting adaptive automatic weather data fetching...');

    this.shouldContinueAutoFetch = true;
    this.isAutoFetchRunning = true;

    // Run initial fetch
    console.log('🚀 Running initial data fetch...');
    this.runAutoFetchCycle().catch(error => {
      console.error('❌ Initial fetch failed:', error);
      // หากการทำงานครั้งแรกล้มเหลว ให้พยายามใหม่ภายหลัง
      this.scheduleNextAutoFetch(this.MIN_FETCH_INTERVAL);
    });
  }

  /**
   * หยุดการดึงข้อมูลอัตโนมัติ
   */
  stopAutoFetch(): void {
    this.shouldContinueAutoFetch = false;

    if (this.timeoutId) {
      clearTimeout(this.timeoutId);
      this.timeoutId = undefined;
    }

    this.isAutoFetchRunning = false;
    console.log('🛑 Stopped automatic weather data fetching');
  }

  /**
   * ตรวจสอบว่า auto-fetch กำลังทำงานอยู่หรือไม่
   */
  isAutoFetchActive(): boolean {
    return this.isAutoFetchRunning;
  }

  /**
   * เปลี่ยน interval ของ auto-fetch แบบ dynamic
   * @param newInterval interval ใหม่ (milliseconds)
   */
  updateAutoFetchInterval(newInterval: number): void {
    if (newInterval < this.MIN_FETCH_INTERVAL) {
      throw new Error(`Interval too short. Minimum is ${this.MIN_FETCH_INTERVAL / 1000}s`);
    }

    if (newInterval > this.MAX_FETCH_INTERVAL) {
      throw new Error(`Interval too long. Maximum is ${this.MAX_FETCH_INTERVAL / 1000}s`);
    }

    // อัพเดท AUTO_FETCH_INTERVAL
    (this as any).AUTO_FETCH_INTERVAL = newInterval;

    console.log(`📊 Auto-fetch interval updated to ${(newInterval / 1000 / 60).toFixed(1)} minutes`);

    // หากกำลังทำงานอยู่ ให้รีสตาร์ท
    if (this.isAutoFetchRunning) {
      console.log('🔄 Restarting auto-fetch with new interval...');
      this.stopAutoFetch();
      setTimeout(() => this.startAutoFetch(), 1000);
    }
  }

  /**
   * บังคับให้ทำ fetch ทันทีโดยไม่รอ interval
   * @param skipIfRunning ข้าม fetch หากกำลังทำงานอยู่
   */
  async triggerImmediateFetch(skipIfRunning = true): Promise<BatchProcessingStats> {
    if (skipIfRunning && this.isAutoFetchRunning) {
      throw new Error('Auto-fetch is currently running. Set skipIfRunning=false to force execution.');
    }

    console.log('🚀 Triggering immediate weather data fetch...');
    return await this.fetchAndStoreWeatherData(true);
  }

  /**
   * รับสถานะการทำงานของ auto-fetch
   */
  getAutoFetchStatus(): {
    isRunning: boolean;
    currentInterval: number;
    nextScheduledTime?: Date;
    hasTimeoutScheduled: boolean;
  } {
    return {
      isRunning: this.isAutoFetchRunning,
      currentInterval: this.AUTO_FETCH_INTERVAL,
      hasTimeoutScheduled: this.timeoutId !== undefined,
      // Note: setTimeout ไม่มี API สำหรับดูเวลาที่เหลือ
      // อาจต้องเก็บ timestamp เพิ่มเติมหากต้องการความแม่นยำ
    };
  }

  /**
   * ตรวจสอบสถานะของระบบ
   * @returns ข้อมูลสถานะของระบบ
   */
  async getSystemHealth(): Promise<{
    status: 'healthy' | 'degraded' | 'unhealthy';
    services: {
      database: boolean;
      weatherApi: boolean;
      aqiApi: boolean;
    };
    lastUpdate?: Date;
    dataAvailability: {
      provinces: number;
      weatherRecords: number;
      aqiRecords: number;
    };
  }> {
    const health = {
      status: 'healthy' as 'healthy' | 'degraded' | 'unhealthy',
      services: {
        database: false,
        weatherApi: false,
        aqiApi: false
      },
      lastUpdate: undefined as Date | undefined,
      dataAvailability: {
        provinces: 0,
        weatherRecords: 0,
        aqiRecords: 0
      }
    };

    try {
      // ตรวจสอบการเชื่อมต่อ database
      const provinceCount = await prisma.msProvince.count();
      health.services.database = true;
      health.dataAvailability.provinces = provinceCount;

      // ตรวจสอบข้อมูลล่าสุด
      const [weatherCount, aqiCount, latestWeather] = await Promise.all([
        prisma.weatherData.count(),
        prisma.aqiData.count(),
        prisma.weatherData.findFirst({
          orderBy: { created_at: 'desc' }
        })
      ]);

      health.dataAvailability.weatherRecords = weatherCount;
      health.dataAvailability.aqiRecords = aqiCount;
      health.lastUpdate = latestWeather?.created_at;

    } catch (error) {
      console.error('Database health check failed:', error);
      health.status = 'unhealthy';
    }

    // ตรวจสอบ Weather API
    try {
      const testLat = 13.7563; // Bangkok coordinates
      const testLon = 100.5018;
      const weatherResponse = await this.withRetry(
        () => this.fetchWeatherData(testLat, testLon),
        1, // single attempt for health check
        'Weather API health check'
      );
      health.services.weatherApi = weatherResponse !== null;
    } catch (error) {
      console.warn('Weather API health check failed:', (error as Error).message);
    }

    // ตรวจสอบ AQI API
    try {
      if (process.env.AQICN_API_TOKEN) {
        const testLat = 13.7563;
        const testLon = 100.5018;
        const aqiResponse = await this.withRetry(
          () => this.fetchAqiData(testLat, testLon),
          1, // single attempt for health check
          'AQI API health check'
        );
        health.services.aqiApi = aqiResponse !== null;
      } else {
        health.services.aqiApi = false; // No token configured
      }
    } catch (error) {
      console.warn('AQI API health check failed:', (error as Error).message);
    }

    // กำหนดสถานะรวม
    const serviceCount = Object.values(health.services).filter(Boolean).length;
    if (serviceCount === 0) {
      health.status = 'unhealthy';
    } else if (serviceCount < 2) {
      health.status = 'degraded';
    }

    return health;
  }

  /**
   * รับสถิติการใช้งานระบบ
   * @returns สถิติต่างๆ ของระบบ
   */
  async getSystemStatistics(): Promise<{
    autoFetchRunning: boolean;
    dataFreshness: {
      oldestRecord?: Date;
      newestRecord?: Date;
      averageAge?: number; // hours
    };
    provinceCoverage: {
      total: number;
      withWeatherData: number;
      withAqiData: number;
      coveragePercentage: number;
    };
  }> {
    const stats = {
      autoFetchRunning: this.isAutoFetchRunning,
      dataFreshness: {} as any,
      provinceCoverage: {} as any
    };

    try {
      // ข้อมูลความสดใหม่
      const [oldestWeather, newestWeather] = await Promise.all([
        prisma.weatherData.findFirst({
          orderBy: { created_at: 'asc' }
        }),
        prisma.weatherData.findFirst({
          orderBy: { created_at: 'desc' }
        })
      ]);

      if (oldestWeather && newestWeather) {
        stats.dataFreshness.oldestRecord = oldestWeather.created_at;
        stats.dataFreshness.newestRecord = newestWeather.created_at;

        const now = new Date();
        const avgAge = (now.getTime() - newestWeather.created_at.getTime()) / (1000 * 60 * 60);
        stats.dataFreshness.averageAge = Math.round(avgAge * 100) / 100;
      }

      // ความครอบคลุมของข้อมูล
      const [totalProvinces, provincesWithWeather, provincesWithAqi] = await Promise.all([
        prisma.msProvince.count(),
        prisma.msProvince.count({
          where: {
            weather_data: {
              some: {}
            }
          }
        }),
        prisma.msProvince.count({
          where: {
            aqi_data: {
              some: {}
            }
          }
        })
      ]);

      stats.provinceCoverage = {
        total: totalProvinces,
        withWeatherData: provincesWithWeather,
        withAqiData: provincesWithAqi,
        coveragePercentage: Math.round((provincesWithWeather / totalProvinces) * 100)
      };

    } catch (error) {
      console.error('Error getting system statistics:', error);
    }

    return stats;
  }

  /**
   * แปลง AQI เป็น PM2.5 (µg/m³)
   * @param aqi ค่า AQI
   * @returns ค่า PM2.5 ใน µg/m³
   */
  private convertAqiToPm25(aqi: number): number | null {
    if (aqi === null || aqi === undefined) return null;

    // AQI Breakpoints และ PM2.5 Concentration ตาม EPA Standard
    const breakpoints = [
      { aqiLow: 0, aqiHigh: 50, pmLow: 0, pmHigh: 12 },
      { aqiLow: 51, aqiHigh: 100, pmLow: 12.1, pmHigh: 35.4 },
      { aqiLow: 101, aqiHigh: 150, pmLow: 35.5, pmHigh: 55.4 },
      { aqiLow: 151, aqiHigh: 200, pmLow: 55.5, pmHigh: 150.4 },
      { aqiLow: 201, aqiHigh: 300, pmLow: 150.5, pmHigh: 250.4 },
      { aqiLow: 301, aqiHigh: 500, pmLow: 250.5, pmHigh: 500.4 }
    ];

    // หา breakpoint ที่ตรงกับ AQI
    const breakpoint = breakpoints.find(bp => aqi >= bp.aqiLow && aqi <= bp.aqiHigh);

    if (!breakpoint) return null;

    // คำนวณ PM2.5 ด้วยสูตร linear interpolation
    const pm25 = (
      ((aqi - breakpoint.aqiLow) / (breakpoint.aqiHigh - breakpoint.aqiLow)) *
      (breakpoint.pmHigh - breakpoint.pmLow)
    ) + breakpoint.pmLow;

    return Math.round(pm25 * 10) / 10; // ปัดเศษให้ 1 ตำแหน่ง
  }
}