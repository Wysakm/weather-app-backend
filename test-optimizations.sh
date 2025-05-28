#!/usr/bin/env bash

# WeatherService Optimization Testing Script
# This script demonstrates the new optimized features

echo "🧪 WeatherService Optimization Testing Script"
echo "============================================="

BASE_URL="http://localhost:3030/api/weather"

echo ""
echo "1. 🔍 Checking system health..."
curl -s -X GET "$BASE_URL/health" | jq '.'

echo ""
echo "2. 📊 Getting system statistics..."
curl -s -X GET "$BASE_URL/statistics" | jq '.'

echo ""
echo "3. 🚀 Testing optimized batch update..."
echo "   (This will trigger the new batch processing system)"
curl -s -X POST "$BASE_URL/update-batch" \
  -H "Content-Type: application/json" \
  -d '{"clearOldData": false}' | jq '.'

echo ""
echo "4. 🔍 Checking health after update..."
curl -s -X GET "$BASE_URL/health" | jq '.data.status'

echo ""
echo "5. 📈 Getting updated statistics..."
curl -s -X GET "$BASE_URL/statistics" | jq '.data.provinceCoverage'

echo ""
echo "✅ Testing completed!"
echo ""
echo "💡 Key improvements demonstrated:"
echo "   - Health monitoring with service status"
echo "   - Detailed system statistics"
echo "   - Batch processing with performance metrics"
echo "   - Error tracking and success rates"
echo ""
echo "🔧 To monitor real-time performance:"
echo "   - Watch logs during batch processing"
echo "   - Check health endpoint periodically"
echo "   - Monitor statistics for trends"
