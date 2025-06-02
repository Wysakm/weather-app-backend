# Weather Scoring System API Documentation

## 🎯 Overview
Weather Scoring System ให้คะแนนสภาพอากาศของแต่ละจังหวัดตามปัจจัยต่างๆ เพื่อจัดอันดับความเหมาะสมของสภาพอากาศ

## 📊 Scoring Criteria (คะแนนเต็ม 100)

### Air Quality (25 คะแนน)
- **AQI Score**: 10 คะแนน - คุณภาพอากาศ
- **PM2.5 Score**: 10 คะแนน - ฝุ่นละอองขนาดเล็ก
- **PM10 Score**: 5 คะแนน - ฝุ่นละอองขนาดใหญ่

### Temperature (30 คะแนน)
- **Temperature Score**: 15 คะแนน - อุณหภูมิ (เหมาะสม: 22-28°C)
- **Comfort Score**: 15 คะแนน - อุณหภูมิที่รู้สึก + ความชื้น

### Weather Conditions (45 คะแนน)
- **Rain Score**: 15 คะแนน - ปริมาณฝน
- **Humidity Score**: 10 คะแนน - ความชื้น (เหมาะสม: 45-65%)
- **UV Score**: 10 คะแนน - ดัชนี UV
- **Wind Score**: 10 คะแนน - ความเร็วลม (เหมาะสม: 5-15 km/h)

## 📱 API Endpoints

### 1. Get All Weather Scores
```http
GET /api/weather/scores
```

**Query Parameters:**
- `limit` (optional): จำนวนผลลัพธ์ที่ต้องการ

**Response:**
```json
{
  "success": true,
  "message": "Retrieved weather scores for 77 provinces",
  "data": [
    {
      "id_score": "uuid",
      "id_province": "uuid", 
      "score": 85.50,
      "rank": 1,
      "aqi_score": 8.5,
      "pm25_score": 9.0,
      "temperature_score": 14.0,
      "calculated_at": "2025-06-02T12:00:00Z",
      "province": {
        "name": "เชียงใหม่"
      }
    }
  ]
}
```

### 2. Get Province Score
```http
GET /api/weather/scores/:provinceId
```

**Response:**
```json
{
  "success": true,
  "message": "Weather score for เชียงใหม่",
  "data": {
    "id_score": "uuid",
    "score": 85.50,
    "rank": 1,
    "province": {
      "name": "เชียงใหม่"
    },
    "weather_data": { /* weather data */ },
    "aqi_data": { /* aqi data */ }
  }
}
```

### 3. Get Rankings (Top 10)
```http
GET /api/weather/rankings
```

**Query Parameters:**
- `limit` (optional): จำนวนอันดับที่ต้องการ (default: 10)

**Response:**
```json
{
  "success": true,
  "message": "Top 10 provinces by weather score",
  "data": {
    "rankings": [
      {
        "rank": 1,
        "province_id": "uuid",
        "province_name": "เชียงใหม่",
        "total_score": 85.50,
        "weather_grade": "A",
        "calculated_at": "2025-06-02T12:00:00Z"
      }
    ],
    "metadata": {
      "total_ranked": 10,
      "timestamp": "2025-06-02T12:00:00Z"
    }
  }
}
```

### 4. Get Score Statistics
```http
GET /api/weather/scores/statistics
```

**Response:**
```json
{
  "success": true,
  "message": "Weather score statistics",
  "data": {
    "total_provinces": 77,
    "average_score": 65.25,
    "highest_score": 89.50,
    "lowest_score": 35.75,
    "last_calculated": "2025-06-02T12:00:00Z"
  }
}
```

### 5. Calculate New Scores
```http
POST /api/weather/scores/calculate
```

**Response:**
```json
{
  "success": true,
  "message": "Weather scores calculated for 77 provinces",
  "data": {
    "calculation_summary": {
      "total_provinces": 77,
      "highest_score": 89.50,
      "best_province": "เชียงใหม่",
      "average_score": 65.25,
      "calculated_at": "2025-06-02T12:00:00Z"
    },
    "top_5": [
      {
        "rank": 1,
        "province": "เชียงใหม่",
        "score": 89.50,
        "grade": "A+"
      }
    ]
  }
}
```

### 6. Get Score Breakdown
```http
GET /api/weather/scores/breakdown/:provinceId
```

**Response:**
```json
{
  "success": true,
  "message": "Detailed weather score breakdown for เชียงใหม่",
  "data": {
    "province": {
      "id": "uuid",
      "name": "เชียงใหม่"
    },
    "total_score": 89.50,
    "rank": 1,
    "grade": "A+",
    "breakdown": {
      "air_quality": {
        "aqi_score": 8.5,
        "pm25_score": 9.0,
        "pm10_score": 4.5,
        "total": 22.0,
        "max_possible": 25
      },
      "temperature": {
        "temperature_score": 14.0,
        "comfort_score": 13.5,
        "total": 27.5,
        "max_possible": 30
      },
      "weather_conditions": {
        "rain_score": 13.0,
        "humidity_score": 8.5,
        "uv_score": 8.0,
        "wind_score": 9.0,
        "total": 38.5,
        "max_possible": 45
      }
    },
    "raw_data": {
      "weather": { /* raw weather data */ },
      "aqi": { /* raw aqi data */ }
    }
  }
}
```

### 7. Compare Provinces
```http
GET /api/weather/scores/compare?provinces=id1,id2,id3
```

**Query Parameters:**
- `provinces` (required): รายการ province IDs คั่นด้วยคอมมา

**Response:**
```json
{
  "success": true,
  "message": "Comparing weather scores for 3 provinces",
  "data": {
    "comparison": [
      {
        "province_id": "uuid1",
        "province_name": "เชียงใหม่",
        "total_score": 89.50,
        "rank": 1,
        "grade": "A+",
        "aqi_score": 8.5,
        "temperature_score": 14.0
      }
    ],
    "winner": {
      "province_name": "เชียงใหม่",
      "total_score": 89.50
    },
    "metadata": {
      "compared_provinces": 3,
      "score_difference": "15.25"
    }
  }
}
```

## 🏆 Weather Grades

| Score Range | Grade | Description |
|-------------|-------|-------------|
| 90-100      | A+    | ยอดเยี่ยม |
| 80-89       | A     | ดีมาก |
| 70-79       | B+    | ดี |
| 60-69       | B     | ปานกลาง |
| 50-59       | C+    | พอใช้ |
| 40-49       | C     | ไม่ค่อยดี |
| 30-39       | D+    | แย่ |
| 20-29       | D     | แย่มาก |
| 0-19        | F     | อันตราย |

## 🚀 Automatic Scoring

ระบบจะคำนวณคะแนนอัตโนมัติทุกครั้งที่:
1. Auto-fetch weather data เสร็จสิ้น (ทุก 3 ชั่วโมง)
2. Manual fetch weather data เสร็จสิ้น
3. เรียก API `POST /api/weather/scores/calculate`

## 📊 Integration Examples

### Frontend Integration
```javascript
// ดึงอันดับ Top 10
const rankings = await fetch('/api/weather/rankings?limit=10')
  .then(res => res.json());

// ดึงคะแนนจังหวัดเฉพาะ
const score = await fetch(`/api/weather/scores/${provinceId}`)
  .then(res => res.json());

// เปรียบเทียบจังหวัด
const comparison = await fetch(`/api/weather/scores/compare?provinces=${ids.join(',')}`)
  .then(res => res.json());
```

### CLI Commands
```bash
# ทดสอบระบบ
npm run test:weather-scoring

# คำนวณคะแนนใหม่
npm run scoring:calculate

# ทดสอบระบบแบบเต็ม
npm run scoring:test
```

## 🔧 Configuration

ปรับแต่งน้ำหนักคะแนนได้ในไฟล์ `src/services/weatherScoringService.ts`:

```typescript
private readonly SCORE_WEIGHTS: ScoreWeights = {
  aqi: 10,         // น้ำหนัก AQI
  pm25: 10,        // น้ำหนัก PM2.5
  pm10: 5,         // น้ำหนัก PM10
  temperature: 15, // น้ำหนักอุณหภูมิ
  humidity: 10,    // น้ำหนักความชื้น
  rain: 15,        // น้ำหนักฝน
  uv: 10,          // น้ำหนัก UV
  wind: 10,        // น้ำหนักลม
  comfort: 15      // น้ำหนักความสบาย
};
```

## 🐛 Troubleshooting

### Common Issues:
1. **No weather data available**: ต้องมีข้อมูลสภาพอากาศก่อนถึงจะคำนวณคะแนนได้
2. **Score calculation failed**: ตรวจสอบการเชื่อมต่อฐานข้อมูล
3. **Missing province data**: ตรวจสอบว่า province มีข้อมูล coordinates

### Debug Commands:
```bash
# ตรวจสอบข้อมูล
npx prisma studio

# ดูสถานะระบบ
curl http://localhost:3000/api/weather/scores/statistics

# ทดสอบการคำนวณ
curl -X POST http://localhost:3000/api/weather/scores/calculate
```
