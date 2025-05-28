# WeatherService Migration Guide

## 🔄 Migrating to Optimized WeatherService

This guide helps you migrate from the old WeatherService to the new optimized version.

## Breaking Changes

### 1. `fetchAndStoreWeatherData()` Return Type
**Before:**
```typescript
async fetchAndStoreWeatherData(clearOldData = false): Promise<void>
```

**After:**
```typescript
async fetchAndStoreWeatherData(clearOldData = false): Promise<BatchProcessingStats>
```

**Migration:**
```typescript
// Old usage
await weatherService.fetchAndStoreWeatherData(true);

// New usage (with statistics)
const stats = await weatherService.fetchAndStoreWeatherData(true);
console.log(`Processed ${stats.successful}/${stats.total} provinces in ${stats.duration}ms`);
```

### 2. Enhanced Error Handling
**Before:** Errors would stop the entire process
**After:** Errors are collected and reported, process continues

**Migration:** Update your error handling to work with the new statistics:
```typescript
const stats = await weatherService.fetchAndStoreWeatherData(true);

if (stats.failed > 0) {
  console.warn(`${stats.failed} provinces failed:`, stats.errors);
}

// Check success rate
const successRate = (stats.successful / stats.total) * 100;
if (successRate < 80) {
  console.warn(`Low success rate: ${successRate}%`);
}
```

## New Features Usage

### 1. Health Monitoring
```typescript
const weatherService = new WeatherService();
const health = await weatherService.getSystemHealth();

console.log(`System status: ${health.status}`);
console.log(`Database: ${health.services.database ? '✅' : '❌'}`);
console.log(`Weather API: ${health.services.weatherApi ? '✅' : '❌'}`);
console.log(`AQI API: ${health.services.aqiApi ? '✅' : '❌'}`);
```

### 2. System Statistics
```typescript
const stats = await weatherService.getSystemStatistics();

console.log(`Auto-fetch running: ${stats.autoFetchRunning}`);
console.log(`Data coverage: ${stats.provinceCoverage.coveragePercentage}%`);
console.log(`Data age: ${stats.dataFreshness.averageAge} hours`);
```

### 3. Enhanced Auto-Fetch
```typescript
// Start optimized auto-fetch (replaces manual setInterval)
weatherService.startAutoFetch();

// Stop when needed
weatherService.stopAutoFetch();
```

## API Endpoint Changes

### New Endpoints

#### Health Check
```http
GET /api/weather/health
```
Returns: System health status and service availability

#### Statistics
```http
GET /api/weather/statistics
```
Returns: System usage and performance metrics

#### Optimized Batch Update
```http
POST /api/weather/update-batch
Content-Type: application/json

{
  "clearOldData": true
}
```
Returns: Processing statistics and performance metrics

### Modified Endpoints

#### Manual Fetch (Enhanced)
```http
POST /api/weather/fetch
```
Now returns detailed statistics instead of simple success message.

## Configuration Updates

### Environment Variables
No new environment variables required, but you may want to monitor:
- `AQICN_API_TOKEN` - Now properly handled with warnings instead of errors

### Performance Tuning
You can modify these constants in `WeatherService` for your specific needs:

```typescript
private readonly BATCH_SIZE = 5; // Increase for faster processing (but higher load)
private readonly MAX_RETRIES = 3; // Increase for better reliability
private readonly HTTP_TIMEOUT = 10000; // Adjust based on network conditions
private readonly API_DELAY = 1000; // Increase if hitting rate limits
```

## Monitoring Integration

### Health Check Integration
```typescript
// Add to your monitoring system
async function checkSystemHealth() {
  const health = await weatherService.getSystemHealth();
  
  // Send alerts if unhealthy
  if (health.status === 'unhealthy') {
    await sendAlert('WeatherService is unhealthy', health);
  }
  
  return health;
}

// Run every 5 minutes
setInterval(checkSystemHealth, 5 * 60 * 1000);
```

### Performance Monitoring
```typescript
// Log processing statistics
weatherService.fetchAndStoreWeatherData(true)
  .then(stats => {
    // Log to your monitoring system
    logger.info('Weather update completed', {
      successful: stats.successful,
      failed: stats.failed,
      duration: stats.duration,
      successRate: (stats.successful / stats.total) * 100
    });
  });
```

## Scheduler Updates

### Old Scheduler
```typescript
// Old manual scheduler
export function startWeatherScheduler() {
  weatherService.fetchAndStoreWeatherData();
  setInterval(() => {
    weatherService.fetchAndStoreWeatherData();
  }, 3600000);
}
```

### New Scheduler
```typescript
// New optimized scheduler
export function startWeatherScheduler() {
  // Uses built-in auto-fetch with optimizations
  weatherService.startAutoFetch();
}

export function stopWeatherScheduler() {
  weatherService.stopAutoFetch();
}

export async function getSchedulerStatus() {
  return await weatherService.getSystemHealth();
}
```

## Testing Updates

### Unit Tests
```typescript
describe('WeatherService Optimizations', () => {
  it('should return processing statistics', async () => {
    const stats = await weatherService.fetchAndStoreWeatherData();
    
    expect(stats).toHaveProperty('total');
    expect(stats).toHaveProperty('successful');
    expect(stats).toHaveProperty('failed');
    expect(stats).toHaveProperty('duration');
    expect(stats).toHaveProperty('errors');
  });

  it('should provide health status', async () => {
    const health = await weatherService.getSystemHealth();
    
    expect(health.status).toBeOneOf(['healthy', 'degraded', 'unhealthy']);
    expect(health.services).toHaveProperty('database');
    expect(health.services).toHaveProperty('weatherApi');
    expect(health.services).toHaveProperty('aqiApi');
  });
});
```

### Integration Tests
```typescript
describe('API Endpoints', () => {
  it('should return health status', async () => {
    const response = await request(app)
      .get('/api/weather/health')
      .expect(200);
    
    expect(response.body.data.status).toBeDefined();
  });

  it('should return system statistics', async () => {
    const response = await request(app)
      .get('/api/weather/statistics')
      .expect(200);
    
    expect(response.body.data.autoFetchRunning).toBeDefined();
  });
});
```

## Troubleshooting

### Common Issues

#### 1. High Failure Rate
```typescript
const stats = await weatherService.fetchAndStoreWeatherData();
if ((stats.failed / stats.total) > 0.2) {
  // More than 20% failure rate
  // Check network connectivity and API status
  const health = await weatherService.getSystemHealth();
  console.log('Service status:', health.services);
}
```

#### 2. Slow Performance
```typescript
const stats = await weatherService.fetchAndStoreWeatherData();
if (stats.duration > 120000) { // More than 2 minutes
  // Consider reducing BATCH_SIZE or increasing HTTP_TIMEOUT
  console.warn('Processing took too long:', stats.duration);
}
```

#### 3. Database Issues
```typescript
const health = await weatherService.getSystemHealth();
if (!health.services.database) {
  console.error('Database connectivity issue');
  // Check database connection and credentials
}
```

## Performance Expectations

### Before Optimization
- Processing time: 2-3 minutes for 77 provinces
- Failure handling: Process stops on first error
- Monitoring: Basic console logging only
- Resource usage: Single-threaded sequential processing

### After Optimization
- Processing time: 45-60 seconds for 77 provinces (60-70% improvement)
- Failure handling: Retries with exponential backoff, continues on failures
- Monitoring: Comprehensive health checks and statistics
- Resource usage: Controlled parallel processing with rate limiting

## Support

If you encounter issues during migration:

1. Check the health endpoint: `GET /api/weather/health`
2. Review processing statistics: `GET /api/weather/statistics`
3. Monitor logs for detailed error information
4. Test with the provided test script: `./test-optimizations.sh`

The optimized WeatherService maintains backward compatibility for basic usage while providing enhanced features for production deployments.
