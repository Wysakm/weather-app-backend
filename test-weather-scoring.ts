import { WeatherScoringService } from '../src/services/weatherScoringService';
import { WeatherService } from '../src/services/weatherService';

async function testWeatherScoringSystem() {
  console.log('🧪 Testing Weather Scoring System');
  console.log('==================================\n');

  const weatherService = new WeatherService();
  const scoringService = new WeatherScoringService();

  try {
    // 1. ดึงข้อมูลสภาพอากาศก่อน
    console.log('📡 Fetching latest weather data...');
    const fetchStats = await weatherService.fetchAndStoreWeatherData(true);
    console.log(`✅ Weather data fetched: ${fetchStats.successful}/${fetchStats.total} provinces\n`);

    // 2. คำนวณคะแนนสภาพอากาศ
    console.log('🎯 Calculating weather scores...');
    const scores = await scoringService.calculateAllProvinceScores();
    console.log(`✅ Weather scores calculated for ${scores.length} provinces\n`);

    // 3. แสดงผลลัพธ์ Top 10
    console.log('🏆 TOP 10 PROVINCES BY WEATHER SCORE');
    console.log('=====================================');
    scores.slice(0, 10).forEach((score, index) => {
      const grade = getWeatherGrade(score.total_score);
      console.log(`${(index + 1).toString().padStart(2)}. ${score.province_name.padEnd(20)} | ${score.total_score.toFixed(2).padStart(6)} pts | Grade: ${grade}`);
    });

    // 4. แสดงรายละเอียดคะแนนของจังหวัดอันดับ 1
    if (scores.length > 0) {
      const topProvince = scores[0];
      console.log(`\n🎯 SCORE BREAKDOWN - ${topProvince.province_name.toUpperCase()}`);
      console.log('='.repeat(50));
      console.log(`🌡️  Temperature Score: ${topProvince.breakdown.temperature_score.toFixed(2)}/15.00`);
      console.log(`🌧️  Rain Score:        ${topProvince.breakdown.rain_score.toFixed(2)}/15.00`);
      console.log(`☀️  Comfort Score:     ${topProvince.breakdown.comfort_score.toFixed(2)}/15.00`);
      console.log(`💨  Air Quality (AQI): ${topProvince.breakdown.aqi_score.toFixed(2)}/10.00`);
      console.log(`🌫️  PM2.5 Score:       ${topProvince.breakdown.pm25_score.toFixed(2)}/10.00`);
      console.log(`💨  Wind Score:        ${topProvince.breakdown.wind_score.toFixed(2)}/10.00`);
      console.log(`💧  Humidity Score:    ${topProvince.breakdown.humidity_score.toFixed(2)}/10.00`);
      console.log(`☀️  UV Score:          ${topProvince.breakdown.uv_score.toFixed(2)}/10.00`);
      console.log(`🌪️  PM10 Score:        ${topProvince.breakdown.pm10_score.toFixed(2)}/5.00`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🏆  TOTAL SCORE:       ${topProvince.total_score.toFixed(2)}/100.00`);
    }

    // 5. ดึงสถิติ
    console.log('\n📊 SYSTEM STATISTICS');
    console.log('====================');
    const statistics = await scoringService.getScoreStatistics();
    console.log(`Total Provinces: ${statistics.total_provinces}`);
    console.log(`Average Score: ${statistics.average_score}`);
    console.log(`Highest Score: ${statistics.highest_score}`);
    console.log(`Lowest Score: ${statistics.lowest_score}`);
    console.log(`Last Calculated: ${statistics.last_calculated?.toLocaleString() || 'Never'}`);

    console.log('\n✅ Weather Scoring System test completed successfully!');

  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

function getWeatherGrade(score: number): string {
  if (score >= 90) return 'A+';
  if (score >= 80) return 'A ';
  if (score >= 70) return 'B+';
  if (score >= 60) return 'B ';
  if (score >= 50) return 'C+';
  if (score >= 40) return 'C ';
  if (score >= 30) return 'D+';
  if (score >= 20) return 'D ';
  return 'F ';
}

// เรียกใช้งานทดสอบ
testWeatherScoringSystem();
