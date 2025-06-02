import { Request, Response } from 'express';
import { WeatherScoringService } from '../services/weatherScoringService';

export class WeatherScoreController {
  private weatherScoringService = new WeatherScoringService();

  /**
   * GET /api/weather/scores - ดึงคะแนนสภาพอากาศทั้งหมด
   */
  getAllScores = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit } = req.query;
      const limitNum = limit ? parseInt(limit as string) : undefined;

      const scores = await this.weatherScoringService.getScoresFromDatabase(limitNum);

      res.json({
        success: true,
        message: `Retrieved weather scores for ${scores.length} provinces`,
        data: scores
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching weather scores',
        error: error.message
      });
    }
  };

  /**
   * GET /api/weather/scores/:provinceId - ดึงคะแนนจังหวัดเฉพาะ
   */
  getProvinceScore = async (req: Request, res: Response): Promise<void> => {
    try {
      const { provinceId } = req.params;

      const score = await this.weatherScoringService.getProvinceScore(provinceId);

      if (!score) {
        res.status(404).json({
          success: false,
          message: 'Weather score not found for this province'
        });
        return;
      }

      res.json({
        success: true,
        message: `Weather score for ${score.province.name}`,
        data: score
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching province weather score',
        error: error.message
      });
    }
  };

  /**
   * GET /api/weather/rankings - ดึงอันดับจังหวัด (top 10)
   */
  getRankings = async (req: Request, res: Response): Promise<void> => {
    try {
      const { limit = '10' } = req.query;
      console.log(`🔍 Fetching top ${limit} weather rankings...`,req.query);
      const limitNum = parseInt(limit as string);

      const topScores = await this.weatherScoringService.getScoresFromDatabase(limitNum);

      const rankings = topScores.map((score, index) => ({
        rank: score.rank || (index + 1),
        province_id: score.id_province,
        province_name: score.province.name,
        total_score: Number(score.score),
        weather_grade: this.getWeatherGrade(Number(score.score)),
        calculated_at: score.calculated_at
      }));

      res.json({
        success: true,
        message: `Top ${rankings.length} provinces by weather score`,
        data: {
          rankings,
          metadata: {
            total_ranked: rankings.length,
            timestamp: new Date().toISOString()
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching weather rankings',
        error: error.message
      });
    }
  };

  /**
   * GET /api/weather/scores/statistics - ดึงสถิติคะแนน
   */
  getScoreStatistics = async (req: Request, res: Response): Promise<void> => {
    try {
      const statistics = await this.weatherScoringService.getScoreStatistics();

      res.json({
        success: true,
        message: 'Weather score statistics',
        data: statistics
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching score statistics',
        error: error.message
      });
    }
  };

  /**
   * POST /api/weather/scores/calculate - คำนวณคะแนนใหม่
   */
  calculateScores = async (req: Request, res: Response): Promise<void> => {
    try {
      console.log('🎯 Starting weather score calculation...');
      
      const scores = await this.weatherScoringService.calculateAllProvinceScores();

      if (scores.length === 0) {
        res.status(404).json({
          success: false,
          message: 'No weather data available for score calculation'
        });
        return;
      }

      // สรุปผลลัพธ์
      const topProvince = scores[0];
      const statistics = await this.weatherScoringService.getScoreStatistics();

      res.json({
        success: true,
        message: `Weather scores calculated for ${scores.length} provinces`,
        data: {
          calculation_summary: {
            total_provinces: scores.length,
            highest_score: topProvince.total_score,
            best_province: topProvince.province_name,
            average_score: statistics.average_score,
            calculated_at: new Date().toISOString()
          },
          top_5: scores.slice(0, 5).map(score => ({
            rank: score.rank,
            province: score.province_name,
            score: score.total_score,
            grade: this.getWeatherGrade(score.total_score)
          }))
        }
      });
    } catch (error: any) {
      console.error('❌ Error calculating weather scores:', error);
      res.status(500).json({
        success: false,
        message: 'Error calculating weather scores',
        error: error.message
      });
    }
  };

  /**
   * GET /api/weather/scores/breakdown/:provinceId - ดูรายละเอียดคะแนนย่อย
   */
  getScoreBreakdown = async (req: Request, res: Response): Promise<void> => {
    try {
      const { provinceId } = req.params;

      const score = await this.weatherScoringService.getProvinceScore(provinceId);

      if (!score) {
        res.status(404).json({
          success: false,
          message: 'Weather score not found for this province'
        });
        return;
      }

      const breakdown = {
        province: {
          id: score.province.id_province,
          name: score.province.name
        },
        total_score: Number(score.score),
        rank: score.rank,
        grade: this.getWeatherGrade(Number(score.score)),
        breakdown: {
          air_quality: {
            aqi_score: Number(score.aqi_score || 0),
            pm25_score: Number(score.pm25_score || 0),
            pm10_score: Number(score.pm10_score || 0),
            total: Number(score.aqi_score || 0) + Number(score.pm25_score || 0) + Number(score.pm10_score || 0),
            max_possible: 25
          },
          temperature: {
            temperature_score: Number(score.temperature_score || 0),
            comfort_score: Number(score.comfort_score || 0),
            total: Number(score.temperature_score || 0) + Number(score.comfort_score || 0),
            max_possible: 30
          },
          weather_conditions: {
            rain_score: Number(score.rain_score || 0),
            humidity_score: Number(score.humidity_score || 0),
            uv_score: Number(score.uv_score || 0),
            wind_score: Number(score.wind_score || 0),
            total: Number(score.rain_score || 0) + Number(score.humidity_score || 0) + 
                   Number(score.uv_score || 0) + Number(score.wind_score || 0),
            max_possible: 45
          }
        },
        raw_data: {
          weather: score.weather_data,
          aqi: score.aqi_data
        },
        calculated_at: score.calculated_at
      };

      res.json({
        success: true,
        message: `Detailed weather score breakdown for ${score.province.name}`,
        data: breakdown
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error fetching score breakdown',
        error: error.message
      });
    }
  };

  /**
   * GET /api/weather/scores/compare - เปรียบเทียบคะแนนระหว่างจังหวัด
   */
  compareProvinces = async (req: Request, res: Response): Promise<void> => {
    try {
      const { provinces } = req.query;
      
      if (!provinces) {
        res.status(400).json({
          success: false,
          message: 'Please provide province IDs to compare (comma-separated)'
        });
        return;
      }

      const provinceIds = (provinces as string).split(',').map(id => id.trim());
      
      if (provinceIds.length < 2) {
        res.status(400).json({
          success: false,
          message: 'Please provide at least 2 provinces to compare'
        });
        return;
      }

      const comparisons = [];
      
      for (const provinceId of provinceIds) {
        const score = await this.weatherScoringService.getProvinceScore(provinceId);
        if (score) {
          comparisons.push({
            province_id: score.province.id_province,
            province_name: score.province.name,
            total_score: Number(score.score),
            rank: score.rank,
            grade: this.getWeatherGrade(Number(score.score)),
            aqi_score: Number(score.aqi_score || 0),
            temperature_score: Number(score.temperature_score || 0),
            comfort_score: Number(score.comfort_score || 0),
            calculated_at: score.calculated_at
          });
        }
      }

      if (comparisons.length === 0) {
        res.status(404).json({
          success: false,
          message: 'No weather scores found for the provided provinces'
        });
        return;
      }

      // จัดเรียงตามคะแนน
      comparisons.sort((a, b) => b.total_score - a.total_score);

      res.json({
        success: true,
        message: `Comparing weather scores for ${comparisons.length} provinces`,
        data: {
          comparison: comparisons,
          winner: comparisons[0],
          metadata: {
            compared_provinces: comparisons.length,
            score_difference: comparisons.length > 1 ? 
              (comparisons[0].total_score - comparisons[comparisons.length - 1].total_score).toFixed(2) : 0
          }
        }
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: 'Error comparing provinces',
        error: error.message
      });
    }
  };

  /**
   * แปลงคะแนนเป็นเกรด
   */
  private getWeatherGrade(score: number): string {
    if (score >= 90) return 'A+';
    if (score >= 80) return 'A';
    if (score >= 70) return 'B+';
    if (score >= 60) return 'B';
    if (score >= 50) return 'C+';
    if (score >= 40) return 'C';
    if (score >= 30) return 'D+';
    if (score >= 20) return 'D';
    return 'F';
  }
}

export const weatherScoreController = new WeatherScoreController();
