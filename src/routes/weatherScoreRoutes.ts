import { Router } from 'express';
import { weatherScoreController } from '../controllers/weatherScoreController';

const router = Router();

// Weather Scoring Routes

// GET /api/weather/scores - ดึงคะแนนสภาพอากาศทั้งหมด
router.get('/scores', weatherScoreController.getAllScores);

// GET /api/weather/scores/statistics - ดึงสถิติคะแนน
router.get('/scores/statistics', weatherScoreController.getScoreStatistics);

// GET /api/weather/scores/compare - เปรียบเทียบคะแนนระหว่างจังหวัด
router.get('/scores/compare', weatherScoreController.compareProvinces);

// GET /api/weather/rankings - ดึงอันดับจังหวัด (top 10)
router.get('/rankings', weatherScoreController.getRankings);

// GET /api/weather/scores/breakdown/:provinceId - ดูรายละเอียดคะแนนย่อย
router.get('/scores/breakdown/:provinceId', weatherScoreController.getScoreBreakdown);

// GET /api/weather/scores/:provinceId - ดึงคะแนนจังหวัดเฉพาะ
router.get('/scores/:provinceId', weatherScoreController.getProvinceScore);

// POST /api/weather/scores/calculate - คำนวณคะแนนใหม่
router.post('/scores/calculate', weatherScoreController.calculateScores);

export default router;
