// Test script for User API endpoints
// This script tests the new admin-only user endpoints

import fetch from 'node-fetch';

const BASE_URL = 'http://localhost:3000/api';

// You'll need to replace this with an actual admin JWT token
const ADMIN_TOKEN = 'YOUR_ADMIN_JWT_TOKEN_HERE';

const headers = {
  'Authorization': `Bearer ${ADMIN_TOKEN}`,
  'Content-Type': 'application/json'
};

async function testUserEndpoints() {
  console.log('🧪 Testing User API Endpoints (Admin Only)\n');

  try {
    // Test 1: Get all users
    console.log('1️⃣ Testing GET /api/users');
    const usersResponse = await fetch(`${BASE_URL}/users?page=1&limit=5`, {
      headers
    });
    
    if (usersResponse.ok) {
      const usersData = await usersResponse.json();
      console.log('✅ GET /api/users - Success');
      console.log(`   Total users: ${usersData.pagination?.totalItems || 0}`);
      console.log(`   Current page: ${usersData.pagination?.currentPage || 1}`);
    } else {
      console.log('❌ GET /api/users - Failed');
      console.log(`   Status: ${usersResponse.status}`);
      const errorData = await usersResponse.json();
      console.log(`   Error: ${errorData.message}`);
    }

    // Test 2: Get user statistics
    console.log('\n2️⃣ Testing GET /api/users/statistics');
    const statsResponse = await fetch(`${BASE_URL}/users/statistics`, {
      headers
    });
    
    if (statsResponse.ok) {
      const statsData = await statsResponse.json();
      console.log('✅ GET /api/users/statistics - Success');
      console.log(`   Total users: ${statsData.data?.total || 0}`);
      console.log(`   Admin users: ${statsData.data?.byRole?.admin || 0}`);
      console.log(`   Regular users: ${statsData.data?.byRole?.user || 0}`);
      console.log(`   Moderators: ${statsData.data?.byRole?.moderator || 0}`);
    } else {
      console.log('❌ GET /api/users/statistics - Failed');
      console.log(`   Status: ${statsResponse.status}`);
      const errorData = await statsResponse.json();
      console.log(`   Error: ${errorData.message}`);
    }

    // Test 3: Search users
    console.log('\n3️⃣ Testing GET /api/users with search');
    const searchResponse = await fetch(`${BASE_URL}/users?search=admin&limit=3`, {
      headers
    });
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      console.log('✅ GET /api/users?search=admin - Success');
      console.log(`   Found ${searchData.data?.length || 0} users matching "admin"`);
    } else {
      console.log('❌ GET /api/users?search=admin - Failed');
      console.log(`   Status: ${searchResponse.status}`);
    }

    // Test 4: Filter by role
    console.log('\n4️⃣ Testing GET /api/users with role filter');
    const roleResponse = await fetch(`${BASE_URL}/users?role=ADMIN&limit=5`, {
      headers
    });
    
    if (roleResponse.ok) {
      const roleData = await roleResponse.json();
      console.log('✅ GET /api/users?role=ADMIN - Success');
      console.log(`   Found ${roleData.data?.length || 0} admin users`);
    } else {
      console.log('❌ GET /api/users?role=ADMIN - Failed');
      console.log(`   Status: ${roleResponse.status}`);
    }

  } catch (error) {
    console.error('🔥 Test failed with error:', error.message);
    console.log('\n💡 Make sure:');
    console.log('   - Server is running on http://localhost:3000');
    console.log('   - You have a valid admin JWT token');
    console.log('   - Database is connected and has user data');
  }

  console.log('\n🏁 Test completed!');
}

// Instructions for getting an admin token
console.log('📋 To test these endpoints, you need an admin JWT token.');
console.log('   1. Register/Login as an admin user');
console.log('   2. Copy the JWT token from the response');
console.log('   3. Replace ADMIN_TOKEN in this script');
console.log('   4. Run: npx ts-node test-user-api.ts\n');

// Uncomment the line below and add a real token to run the tests
// testUserEndpoints();

export { testUserEndpoints };
