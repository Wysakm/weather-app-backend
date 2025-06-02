import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export interface WeatherScoreResult {
  province_id: string;
  province_name: string;
  total_score: number;
  rank?: number;
  breakdown: {
    aqi_score: number;
    pm25_score: number;
    pm10_score: number;
    temperature_score: number;
    humidity_score: number;
    rain_score: number;
    uv_score: number;
    wind_score: number;
    comfort_score: number;
  };
  weather_data?: any;
  aqi_data?: any;
  calculated_at: Date;
}

export interface ScoreWeights {
  aqi: number;      // น้ำหนัก 10
  pm25: number;     // น้ำหนัก 10
  pm10: number;     // น้ำหนัก 5
  temperature: number; // น้ำหนัก 15
  humidity: number;    // น้ำหนัก 10
  rain: number;        // น้ำหนัก 15
  uv: number;          // น้ำหนัก 10
  wind: number;        // น้ำหนัก 10
  comfort: number;     // น้ำหนัก 15 (อุณหภูมิที่รู้สึก + ความชื้น)
}

export class WeatherScoringService {
  // น้ำหนักคะแนนเต็มสำหรับแต่ละปัจจัย (รวม 100 คะแนน)
  private readonly SCORE_WEIGHTS: ScoreWeights = {
    aqi: 10,
    pm25: 10,
    pm10: 5,
    temperature: 15,
    humidity: 10,
    rain: 15,
    uv: 10,
    wind: 10,
    comfort: 15
  };

  /**
   * คำนวณคะแนนสภาพอากาศสำหรับจังหวัดทั้งหมด
   */
  async calculateAllProvinceScores(): Promise<WeatherScoreResult[]> {
    console.log('🎯 Starting weather score calculation for all provinces...');

    // ดึงข้อมูลจังหวัดที่มีข้อมูลสภาพอากาศล่าสุด
    const provincesWithData = await this.getProvincesWithLatestData();
    
    if (provincesWithData.length === 0) {
      console.log('⚠️  No provinces with weather data found');
      return [];
    }

    console.log(`📍 Found ${provincesWithData.length} provinces with recent weather data`);

    // คำนวณคะแนนสำหรับแต่ละจังหวัด
    const scores: WeatherScoreResult[] = [];
    
    for (const province of provincesWithData) {
      try {
        const score = await this.calculateProvinceScore(province);
        scores.push(score);
      } catch (error) {
        console.error(`❌ Error calculating score for ${province.name}:`, error);
      }
    }

    // จัดอันดับ
    const rankedScores = this.rankScores(scores);

    // บันทึกลงฐานข้อมูล
    await this.saveScoresToDatabase(rankedScores);

    console.log(`✅ Weather scores calculated for ${rankedScores.length} provinces`);
    return rankedScores;
  }

  /**
   * คำนวณคะแนนสำหรับจังหวัดเดียว
   */
  async calculateProvinceScore(provinceData: any): Promise<WeatherScoreResult> {
    const { weather_data, aqi_data } = provinceData;

    // คำนวณคะแนนย่อยสำหรับแต่ละปัจจัย
    const breakdown = {
      aqi_score: this.calculateAqiScore(aqi_data),
      pm25_score: this.calculatePm25Score(aqi_data),
      pm10_score: this.calculatePm10Score(aqi_data),
      temperature_score: this.calculateTemperatureScore(weather_data),
      humidity_score: this.calculateHumidityScore(weather_data),
      rain_score: this.calculateRainScore(weather_data),
      uv_score: this.calculateUvScore(weather_data),
      wind_score: this.calculateWindScore(weather_data),
      comfort_score: this.calculateComfortScore(weather_data)
    };

    // คำนวณคะแนนรวม
    const total_score = Object.values(breakdown).reduce((sum, score) => sum + score, 0);

    return {
      province_id: provinceData.id_province,
      province_name: provinceData.name,
      total_score: Math.round(total_score * 100) / 100, // ปัดเศษ 2 ตำแหน่ง
      breakdown,
      weather_data,
      aqi_data,
      calculated_at: new Date()
    };
  }

  /**
   * คำนวณคะแนน AQI (0-10 คะแนน)
   */
  private calculateAqiScore(aqiData: any): number {
    if (!aqiData?.aqi) return 0;

    const aqi = Number(aqiData.aqi);
    
    if (aqi <= 50) return this.SCORE_WEIGHTS.aqi;      // ดีมาก
    if (aqi <= 100) return this.SCORE_WEIGHTS.aqi * 0.8; // ดี
    if (aqi <= 150) return this.SCORE_WEIGHTS.aqi * 0.6; // ปานกลาง
    if (aqi <= 200) return this.SCORE_WEIGHTS.aqi * 0.3; // แย่
    if (aqi <= 300) return this.SCORE_WEIGHTS.aqi * 0.1; // แย่มาก
    return 0; // อันตราย
  }

  /**
   * คำนวณคะแนน PM2.5 (0-10 คะแนน)
   */
  private calculatePm25Score(aqiData: any): number {
    if (!aqiData?.pm25) return 0;

    const pm25 = Number(aqiData.pm25);
    
    if (pm25 <= 12) return this.SCORE_WEIGHTS.pm25;      // ดีมาก
    if (pm25 <= 35) return this.SCORE_WEIGHTS.pm25 * 0.8; // ดี
    if (pm25 <= 55) return this.SCORE_WEIGHTS.pm25 * 0.6; // ปานกลาง
    if (pm25 <= 150) return this.SCORE_WEIGHTS.pm25 * 0.3; // แย่
    if (pm25 <= 250) return this.SCORE_WEIGHTS.pm25 * 0.1; // แย่มาก
    return 0; // อันตราย
  }

  /**
   * คำนวณคะแนน PM10 (0-5 คะแนน)
   */
  private calculatePm10Score(aqiData: any): number {
    if (!aqiData?.pm10) return 0;

    const pm10 = Number(aqiData.pm10);
    
    if (pm10 <= 50) return this.SCORE_WEIGHTS.pm10;      // ดี
    if (pm10 <= 100) return this.SCORE_WEIGHTS.pm10 * 0.7; // ปานกลาง
    if (pm10 <= 150) return this.SCORE_WEIGHTS.pm10 * 0.4; // แย่
    return this.SCORE_WEIGHTS.pm10 * 0.1; // แย่มาก
  }

  /**
   * คำนวณคะแนนอุณหภูมิ (0-15 คะแนน) - เหมาะสมสำหรับประเทศไทย
   */
  private calculateTemperatureScore(weatherData: any): number {
    if (!weatherData?.temperature_2m) return 0;

    const temp = Number(weatherData.temperature_2m);
    
    // อุณหภูมิที่เหมาะสมสำหรับประเทศไทย: 22-28°C
    if (temp >= 22 && temp <= 28) return this.SCORE_WEIGHTS.temperature; // สบายที่สุด
    if (temp >= 20 && temp <= 32) return this.SCORE_WEIGHTS.temperature * 0.8; // สบาย
    if (temp >= 18 && temp <= 35) return this.SCORE_WEIGHTS.temperature * 0.6; // ปานกลาง
    if (temp >= 15 && temp <= 38) return this.SCORE_WEIGHTS.temperature * 0.3; // ไม่สบาย
    return this.SCORE_WEIGHTS.temperature * 0.1; // ไม่สบายมาก
  }

  /**
   * คำนวณคะแนนความชื้น (0-10 คะแนน) - จากข้อมูลฝน
   */
  private calculateHumidityScore(weatherData: any): number {
    // ใช้ข้อมูลฝนและอุณหภูมิเพื่อประเมินความชื้น
    const rain = weatherData?.rain ? Number(weatherData.rain) : 0;
    const temp = weatherData?.temperature_2m ? Number(weatherData.temperature_2m) : 25;
    
    // ประมาณความชื้นจากปริมาณฝนและอุณหภูมิ
    let estimatedHumidity = 60; // ค่าเริ่มต้น
    
    if (rain > 0) {
      estimatedHumidity += Math.min(rain * 5, 30); // เพิ่มความชื้นตามปริมาณฝน
    }
    
    if (temp > 30) {
      estimatedHumidity -= (temp - 30) * 2; // ลดความชื้นตามอุณหภูมิสูง
    }
    
    estimatedHumidity = Math.max(30, Math.min(95, estimatedHumidity));
    
    // ความชื้นที่เหมาะสม: 45-65%
    if (estimatedHumidity >= 45 && estimatedHumidity <= 65) return this.SCORE_WEIGHTS.humidity;
    if (estimatedHumidity >= 35 && estimatedHumidity <= 75) return this.SCORE_WEIGHTS.humidity * 0.8;
    if (estimatedHumidity >= 25 && estimatedHumidity <= 85) return this.SCORE_WEIGHTS.humidity * 0.6;
    return this.SCORE_WEIGHTS.humidity * 0.3;
  }

  /**
   * คำนวณคะแนนฝน (0-15 คะแนน)
   */
  private calculateRainScore(weatherData: any): number {
    const rain = weatherData?.rain ? Number(weatherData.rain) : 0;           // ฝนปัจจุบัน (mm/ชม)
    const rainSum = weatherData?.rain_sum ? Number(weatherData.rain_sum) : 0; // ฝนสะสมทั้งวัน (mm/วัน)
    const precipitationProb = weatherData?.precipitation_probability_max ? 
      Number(weatherData.precipitation_probability_max) : 0;

    let score = this.SCORE_WEIGHTS.rain;
    
    // 1. คำนวณคะแนนจากปริมาณฝนปัจจุบัน (น้ำหนัก 60%)
    let currentRainScore = 1.0;
    if (rain > 0) {
      if (rain <= 1) currentRainScore = 0.95;      // ฝนละอองเล็กน้อย
      else if (rain <= 3) currentRainScore = 0.8;  // ฝนเบา
      else if (rain <= 8) currentRainScore = 0.6;  // ฝนปานกลาง
      else if (rain <= 20) currentRainScore = 0.3; // ฝนหนัก
      else currentRainScore = 0.1;                 // ฝนหนักมาก
    }

    // 2. คำนวณคะแนนจากปริมาณฝนสะสมทั้งวัน (น้ำหนัก 30%)
    let dailyRainScore = 1.0;
    if (rainSum > 0) {
      if (rainSum <= 5) dailyRainScore = 0.9;      // ฝนน้อย
      else if (rainSum <= 15) dailyRainScore = 0.75; // ฝนปานกลาง
      else if (rainSum <= 35) dailyRainScore = 0.5;  // ฝนค่อนข้างมาก
      else if (rainSum <= 70) dailyRainScore = 0.25; // ฝนหนัก
      else dailyRainScore = 0.1;                     // ฝนหนักมาก
    }

    // 3. คำนวณคะแนนจากโอกาสฝนตก (น้ำหนัก 10%)
    let precipitationScore = 1.0;
    if (precipitationProb > 80) precipitationScore = 0.6;
    else if (precipitationProb > 60) precipitationScore = 0.8;
    else if (precipitationProb > 40) precipitationScore = 0.9;

    // รวมคะแนนถ่วงน้ำหนัก
    const combinedScore = (currentRainScore * 0.6) + (dailyRainScore * 0.3) + (precipitationScore * 0.1);
    
    return score * combinedScore;
  }

  /**
   * คำนวณคะแนน UV (0-10 คะแนน)
   */
  private calculateUvScore(weatherData: any): number {
    if (!weatherData?.uv_index_max) return this.SCORE_WEIGHTS.uv * 0.8;

    const uv = Number(weatherData.uv_index_max);
    
    if (uv <= 2) return this.SCORE_WEIGHTS.uv;          // ต่ำ - ปลอดภัย
    if (uv <= 5) return this.SCORE_WEIGHTS.uv * 0.9;   // ปานกลาง
    if (uv <= 7) return this.SCORE_WEIGHTS.uv * 0.7;   // สูง
    if (uv <= 10) return this.SCORE_WEIGHTS.uv * 0.4;  // สูงมาก
    return this.SCORE_WEIGHTS.uv * 0.1;                 // อันตราย
  }

  /**
   * คำนวณคะแนนลม (0-10 คะแนน)
   */
  private calculateWindScore(weatherData: any): number {
    if (!weatherData?.wind_speed_10m_max) return this.SCORE_WEIGHTS.wind * 0.8;

    const windSpeed = Number(weatherData.wind_speed_10m_max);
    
    if (windSpeed <= 5) return this.SCORE_WEIGHTS.wind * 0.7;   // สงบเกินไป
    if (windSpeed <= 15) return this.SCORE_WEIGHTS.wind;        // เหมาะสม
    if (windSpeed <= 25) return this.SCORE_WEIGHTS.wind * 0.8;  // แรงเล็กน้อย
    if (windSpeed <= 40) return this.SCORE_WEIGHTS.wind * 0.5;  // แรง
    return this.SCORE_WEIGHTS.wind * 0.2;                       // แรงมาก
  }

  /**
   * คำนวณคะแนนความสบาย (0-15 คะแนน) - รวมอุณหภูมิที่รู้สึกและความชื้น
   */
  private calculateComfortScore(weatherData: any): number {
    const apparentTemp = weatherData?.apparent_temperature ? 
      Number(weatherData.apparent_temperature) : 
      (weatherData?.temperature_2m ? Number(weatherData.temperature_2m) : 25);

    // อุณหภูมิที่รู้สึกเหมาะสม: 22-28°C
    if (apparentTemp >= 22 && apparentTemp <= 28) return this.SCORE_WEIGHTS.comfort;
    if (apparentTemp >= 20 && apparentTemp <= 30) return this.SCORE_WEIGHTS.comfort * 0.9;
    if (apparentTemp >= 18 && apparentTemp <= 32) return this.SCORE_WEIGHTS.comfort * 0.7;
    if (apparentTemp >= 15 && apparentTemp <= 35) return this.SCORE_WEIGHTS.comfort * 0.4;
    return this.SCORE_WEIGHTS.comfort * 0.2;
  }

  /**
   * จัดอันดับคะแนน
   */
  private rankScores(scores: WeatherScoreResult[]): WeatherScoreResult[] {
    return scores
      .sort((a, b) => b.total_score - a.total_score)
      .map((score, index) => ({
        ...score,
        rank: index + 1
      }));
  }

  /**
   * ดึงข้อมูลจังหวัดที่มีข้อมูลสภาพอากาศล่าสุด
   */
  private async getProvincesWithLatestData() {
    return await prisma.msProvince.findMany({
      include: {
        weather_data: {
          orderBy: { created_at: 'desc' },
          take: 1
        },
        aqi_data: {
          orderBy: { created_at: 'desc' },
          take: 1
        }
      },
      where: {
        OR: [
          { weather_data: { some: {} } },
          { aqi_data: { some: {} } }
        ]
      }
    }).then(provinces => 
      provinces.map(province => ({
        ...province,
        weather_data: province.weather_data[0] || null,
        aqi_data: province.aqi_data[0] || null
      })).filter(province => 
        province.weather_data || province.aqi_data
      )
    );
  }

  /**
   * บันทึกคะแนนลงฐานข้อมูล
   */
  private async saveScoresToDatabase(scores: WeatherScoreResult[]): Promise<void> {
    console.log('💾 Saving weather scores to database...');

    // ลบคะแนนเก่า
    await prisma.weatherScore.deleteMany({});

    // บันทึกคะแนนใหม่
    for (const score of scores) {
      await prisma.weatherScore.create({
        data: {
          id_province: score.province_id,
          score: score.total_score,
          rank: score.rank,
          aqi_score: score.breakdown.aqi_score,
          pm25_score: score.breakdown.pm25_score,
          pm10_score: score.breakdown.pm10_score,
          temperature_score: score.breakdown.temperature_score,
          humidity_score: score.breakdown.humidity_score,
          rain_score: score.breakdown.rain_score,
          uv_score: score.breakdown.uv_score,
          wind_score: score.breakdown.wind_score,
          comfort_score: score.breakdown.comfort_score,
          weather_data_id: score.weather_data?.id_weather || null,
          aqi_data_id: score.aqi_data?.id_aqi || null
        }
      });
    }

    console.log(`✅ Saved ${scores.length} weather scores to database`);
  }

  /**
   * ดึงคะแนนจากฐานข้อมูล
   */
  async getScoresFromDatabase(limit?: number): Promise<any[]> {
    return await prisma.weatherScore.findMany({
      include: {
        province: true,
        weather_data: true,
        aqi_data: true
      },
      orderBy: [
        { rank: 'asc' },
        { score: 'desc' }
      ],
      take: limit
    });
  }

  /**
   * ดึงคะแนนจังหวัดเฉพาะ (รองรับทั้ง ID และชื่อจังหวัด)
   */
  async getProvinceScore(provinceIdentifier: string): Promise<any | null> {
    // ตรวจสอบว่าเป็น UUID หรือชื่อจังหวัด
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(provinceIdentifier);
    
    if (isUUID) {
      // ค้นหาด้วย ID
      return await prisma.weatherScore.findFirst({
        where: { id_province: provinceIdentifier },
        include: {
          province: true,
          weather_data: true,
          aqi_data: true
        }
      });
    } else {
      // ค้นหาด้วยชื่อจังหวัด
      return await prisma.weatherScore.findFirst({
        where: { 
          province: { 
            name: provinceIdentifier 
          } 
        },
        include: {
          province: true,
          weather_data: true,
          aqi_data: true
        }
      });
    }
  }

  /**
   * ดึงสถิติคะแนน
   */
  async getScoreStatistics(): Promise<{
    total_provinces: number;
    average_score: number;
    highest_score: number;
    lowest_score: number;
    last_calculated: Date | null;
  }> {
    const scores = await prisma.weatherScore.findMany({
      orderBy: { calculated_at: 'desc' }
    });

    if (scores.length === 0) {
      return {
        total_provinces: 0,
        average_score: 0,
        highest_score: 0,
        lowest_score: 0,
        last_calculated: null
      };
    }

    const scoreValues = scores.map(s => Number(s.score));
    
    return {
      total_provinces: scores.length,
      average_score: Math.round((scoreValues.reduce((a, b) => a + b, 0) / scoreValues.length) * 100) / 100,
      highest_score: Math.max(...scoreValues),
      lowest_score: Math.min(...scoreValues),
      last_calculated: scores[0].calculated_at
    };
  }
}
