// Weather Scoring System - Frontend Integration Examples
// ====================================================

// 🆕 NEW: Rankings endpoint now includes latitude and longitude coordinates
// Each ranking object now has: { rank, province_id, province_name, latitude, longitude, total_score, weather_grade, calculated_at }

// 1. 🏆 Weather Rankings Component
class WeatherRankings {
  async fetchRankings(limit = 10) {
    try {
      const response = await fetch(`/api/weather/rankings?limit=${limit}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data.rankings;
      }
      throw new Error(data.message);
    } catch (error) {
      console.error('Error fetching rankings:', error);
      return [];
    }
  }

  renderRankings(rankings) {
    return rankings.map(province => ({
      rank: province.rank,
      name: province.province_name,
      score: province.total_score,
      grade: province.weather_grade,
      badge: this.getGradeBadge(province.weather_grade)
    }));
  }

  getGradeBadge(grade) {
    const badges = {
      'A+': { color: 'bg-green-500', text: 'ยอดเยี่ยม' },
      'A': { color: 'bg-green-400', text: 'ดีมาก' },
      'B+': { color: 'bg-blue-400', text: 'ดี' },
      'B': { color: 'bg-blue-300', text: 'ปานกลาง' },
      'C+': { color: 'bg-yellow-400', text: 'พอใช้' },
      'C': { color: 'bg-orange-400', text: 'ไม่ค่อยดี' },
      'D+': { color: 'bg-red-400', text: 'แย่' },
      'D': { color: 'bg-red-500', text: 'แย่มาก' },
      'F': { color: 'bg-red-600', text: 'อันตราย' }
    };
    return badges[grade] || badges['F'];
  }
}

// 2. 📊 Score Breakdown Component
class WeatherScoreBreakdown {
  async fetchScoreBreakdown(provinceId) {
    try {
      const response = await fetch(`/api/weather/scores/breakdown/${provinceId}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message);
    } catch (error) {
      console.error('Error fetching score breakdown:', error);
      return null;
    }
  }

  calculatePercentages(breakdown) {
    return {
      air_quality: {
        percentage: (breakdown.air_quality.total / breakdown.air_quality.max_possible) * 100,
        score: breakdown.air_quality.total,
        max: breakdown.air_quality.max_possible
      },
      temperature: {
        percentage: (breakdown.temperature.total / breakdown.temperature.max_possible) * 100,
        score: breakdown.temperature.total,
        max: breakdown.temperature.max_possible
      },
      weather_conditions: {
        percentage: (breakdown.weather_conditions.total / breakdown.weather_conditions.max_possible) * 100,
        score: breakdown.weather_conditions.total,
        max: breakdown.weather_conditions.max_possible
      }
    };
  }

  getScoreColor(percentage) {
    if (percentage >= 90) return 'text-green-600';
    if (percentage >= 80) return 'text-green-500';
    if (percentage >= 70) return 'text-blue-500';
    if (percentage >= 60) return 'text-blue-400';
    if (percentage >= 50) return 'text-yellow-500';
    if (percentage >= 40) return 'text-orange-500';
    return 'text-red-500';
  }
}

// 3. 🔍 Province Comparison Tool
class ProvinceComparison {
  async compareProvinces(provinceIds) {
    try {
      const response = await fetch(`/api/weather/scores/compare?provinces=${provinceIds.join(',')}`);
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message);
    } catch (error) {
      console.error('Error comparing provinces:', error);
      return null;
    }
  }

  generateComparisonChart(comparison) {
    return {
      type: 'bar',
      data: {
        labels: comparison.comparison.map(p => p.province_name),
        datasets: [
          {
            label: 'Total Score',
            data: comparison.comparison.map(p => p.total_score),
            backgroundColor: comparison.comparison.map(p => this.getScoreColor(p.total_score)),
            borderColor: 'rgba(0,0,0,0.1)',
            borderWidth: 1
          }
        ]
      },
      options: {
        responsive: true,
        scales: {
          y: {
            beginAtZero: true,
            max: 100,
            title: {
              display: true,
              text: 'Weather Score'
            }
          }
        },
        plugins: {
          legend: {
            display: true
          },
          title: {
            display: true,
            text: 'Province Weather Score Comparison'
          }
        }
      }
    };
  }

  getScoreColor(score) {
    if (score >= 90) return 'rgba(34, 197, 94, 0.8)';   // green
    if (score >= 80) return 'rgba(59, 130, 246, 0.8)';  // blue
    if (score >= 70) return 'rgba(168, 85, 247, 0.8)';  // purple
    if (score >= 60) return 'rgba(234, 179, 8, 0.8)';   // yellow
    if (score >= 50) return 'rgba(249, 115, 22, 0.8)';  // orange
    return 'rgba(239, 68, 68, 0.8)';                    // red
  }
}

// 4. 📈 Weather Statistics Dashboard
class WeatherStatistics {
  async fetchStatistics() {
    try {
      const response = await fetch('/api/weather/scores/statistics');
      const data = await response.json();
      
      if (data.success) {
        return data.data;
      }
      throw new Error(data.message);
    } catch (error) {
      console.error('Error fetching statistics:', error);
      return null;
    }
  }

  formatStatistics(stats) {
    return {
      totalProvinces: {
        value: stats.total_provinces,
        label: 'จังหวัดทั้งหมด',
        icon: '🌍'
      },
      averageScore: {
        value: stats.average_score.toFixed(1),
        label: 'คะแนนเฉลี่ย',
        icon: '📊',
        grade: this.getGradeFromScore(stats.average_score)
      },
      highestScore: {
        value: stats.highest_score.toFixed(1),
        label: 'คะแนนสูงสุด',
        icon: '🏆',
        grade: this.getGradeFromScore(stats.highest_score)
      },
      lowestScore: {
        value: stats.lowest_score.toFixed(1),
        label: 'คะแนนต่ำสุด',
        icon: '📉',
        grade: this.getGradeFromScore(stats.lowest_score)
      },
      lastCalculated: {
        value: new Date(stats.last_calculated).toLocaleString('th-TH'),
        label: 'อัพเดทล่าสุด',
        icon: '🕐'
      }
    };
  }

  getGradeFromScore(score) {
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

// 5. 🔄 Auto Refresh Manager
class WeatherScoreManager {
  constructor(refreshInterval = 300000) { // 5 minutes
    this.refreshInterval = refreshInterval;
    this.isAutoRefresh = false;
    this.intervalId = null;
  }

  startAutoRefresh(callback) {
    if (this.isAutoRefresh) return;
    
    this.isAutoRefresh = true;
    this.intervalId = setInterval(async () => {
      try {
        const stats = await fetch('/api/weather/scores/statistics').then(r => r.json());
        if (callback) callback(stats);
      } catch (error) {
        console.error('Auto refresh error:', error);
      }
    }, this.refreshInterval);
    
    console.log('🔄 Auto refresh started');
  }

  stopAutoRefresh() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
      this.isAutoRefresh = false;
      console.log('⏸️ Auto refresh stopped');
    }
  }

  async triggerManualCalculation() {
    try {
      const response = await fetch('/api/weather/scores/calculate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const data = await response.json();
      if (data.success) {
        console.log('✅ Manual calculation completed');
        return data.data;
      }
      throw new Error(data.message);
    } catch (error) {
      console.error('Manual calculation error:', error);
      throw error;
    }
  }
}

// 6. 🎨 UI Helper Functions
const WeatherUIHelpers = {
  // สร้าง progress bar สำหรับคะแนน
  createScoreProgressBar(score, maxScore = 100, label = '') {
    const percentage = (score / maxScore) * 100;
    const color = this.getProgressColor(percentage);
    
    return `
      <div class="w-full bg-gray-200 rounded-full h-2.5">
        <div class="${color} h-2.5 rounded-full transition-all duration-300" 
             style="width: ${percentage}%"></div>
      </div>
      <div class="flex justify-between text-xs text-gray-600 mt-1">
        <span>${label}</span>
        <span>${score.toFixed(1)}/${maxScore}</span>
      </div>
    `;
  },

  getProgressColor(percentage) {
    if (percentage >= 90) return 'bg-green-500';
    if (percentage >= 80) return 'bg-green-400';
    if (percentage >= 70) return 'bg-blue-400';
    if (percentage >= 60) return 'bg-blue-300';
    if (percentage >= 50) return 'bg-yellow-400';
    if (percentage >= 40) return 'bg-orange-400';
    return 'bg-red-400';
  },

  // สร้าง weather card
  createWeatherCard(province) {
    return `
      <div class="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
        <div class="flex justify-between items-start mb-4">
          <h3 class="text-lg font-semibold text-gray-800">${province.province_name}</h3>
          <span class="text-2xl font-bold ${this.getScoreTextColor(province.total_score)}">
            ${province.total_score.toFixed(1)}
          </span>
        </div>
        <div class="flex justify-between items-center">
          <span class="text-sm text-gray-600">อันดับ ${province.rank}</span>
          <span class="px-3 py-1 rounded-full text-sm font-medium ${this.getGradeBadgeClass(province.grade)}">
            ${province.grade}
          </span>
        </div>
        ${this.createScoreProgressBar(province.total_score, 100)}
      </div>
    `;
  },

  getScoreTextColor(score) {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-blue-600';
    if (score >= 40) return 'text-yellow-600';
    return 'text-red-600';
  },

  getGradeBadgeClass(grade) {
    const classes = {
      'A+': 'bg-green-100 text-green-800',
      'A': 'bg-green-100 text-green-700',
      'B+': 'bg-blue-100 text-blue-700',
      'B': 'bg-blue-100 text-blue-600',
      'C+': 'bg-yellow-100 text-yellow-700',
      'C': 'bg-orange-100 text-orange-700',
      'D+': 'bg-red-100 text-red-700',
      'D': 'bg-red-100 text-red-800',
      'F': 'bg-red-200 text-red-900'
    };
    return classes[grade] || classes['F'];
  }
};

// 7. 📱 React Hook Example
function useWeatherScores() {
  const [scores, setScores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchScores = useCallback(async (limit) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch(`/api/weather/scores?limit=${limit || 10}`);
      const data = await response.json();
      
      if (data.success) {
        setScores(data.data);
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerCalculation = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/weather/scores/calculate', {
        method: 'POST'
      });
      const data = await response.json();
      
      if (data.success) {
        await fetchScores(); // Refresh scores
        return data.data;
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [fetchScores]);

  useEffect(() => {
    fetchScores();
  }, [fetchScores]);

  return {
    scores,
    loading,
    error,
    fetchScores,
    triggerCalculation
  };
}

// Export for use
export {
  WeatherRankings,
  WeatherScoreBreakdown,
  ProvinceComparison,
  WeatherStatistics,
  WeatherScoreManager,
  WeatherUIHelpers,
  useWeatherScores
};
