const http = require('http');

const BASE_URL = 'http://localhost:8000/api/internships';
let authToken = null;

function makeRequest(method, path, body = null, token = null) {
  return new Promise((resolve, reject) => {
    const fullUrl = BASE_URL + path;
    const url = new URL(fullUrl);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        ...(token && { Authorization: `Bearer ${token}` }),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => data += chunk);
      res.on('end', () => {
        try {
          const json = JSON.parse(data);
          resolve({ status: res.statusCode, data: json });
        } catch {
          resolve({ status: res.statusCode, data: data });
        }
      });
    });

    req.on('error', reject);

    if (body) {
      req.write(JSON.stringify(body));
    }
    req.end();
  });
}

async function login() {
  console.log('Logging in as admin...\n');
  try {
    const result = await makeRequest('POST', '/auth/login', {
      email: 'admin@example.com',
      password: 'admin123'
    }, null, 'http://localhost:8000/api/auth/login');
    
    if (result.status === 200 && result.data.data?.token) {
      authToken = result.data.data.token;
      console.log('✓ Login successful\n');
      return true;
    }
  } catch (error) {
    console.log('✗ Login failed:', error.message);
  }
  console.log('Continuing without authentication...\n');
  return false;
}

async function testEndpoints() {
  console.log('=== Testing Internship Endpoints with Authentication ===\n');

  // Test 1: GET /api/internships (should return 200)
  console.log('1. Testing GET /api/internships');
  try {
    const result = await makeRequest('GET', '/', null, authToken);
    console.log(`   Status: ${result.status} (Expected: 200)`);
    console.log(`   Response: ${JSON.stringify(result.data, null, 2)}\n`);
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  // Test 2: POST /api/internships (should return 201 with auth, 401 without)
  console.log('2. Testing POST /api/internships (create)');
  try {
    const testData = {
      title: 'Test Internship',
      company: 'Test Company',
      location: 'Remote',
      duration: '3 months',
      deadline: new Date('2025-12-31').toISOString(),
      description: 'Test description',
      requirements: 'Test requirements',
      benefits: 'Test benefits',
      idealCandidate: 'Test candidate',
      responsibilities: 'Test responsibilities',
      expectedOutcome: 'Test outcome',
      salary: 1000
    };
    const result = await makeRequest('POST', '/', testData, authToken);
    console.log(`   Status: ${result.status} (Expected: 201 with auth, 401 without)`);
    console.log(`   Response: ${JSON.stringify(result.data, null, 2)}\n`);
    
    // Save the created internship ID for further tests
    if (result.status === 201 && result.data.data?._id) {
      return result.data.data._id;
    }
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  return null;
}

async function testWithId(internshipId) {
  if (!internshipId) {
    console.log('\n=== Skipping ID-based tests (no internship created) ===\n');
    return;
  }

  console.log('\n=== Testing ID-based Endpoints ===\n');

  // Test 3: GET /api/internships/:id
  console.log('3. Testing GET /api/internships/:id');
  try {
    const result = await makeRequest('GET', `/${internshipId}`, null, authToken);
    console.log(`   Status: ${result.status} (Expected: 200)`);
    console.log(`   Response: ${JSON.stringify(result.data, null, 2)}\n`);
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  // Test 4: PUT /api/internships/:id
  console.log('4. Testing PUT /api/internships/:id');
  try {
    const result = await makeRequest('PUT', `/${internshipId}`, { title: 'Updated Title' }, authToken);
    console.log(`   Status: ${result.status} (Expected: 200 with auth)`);
    console.log(`   Response: ${JSON.stringify(result.data, null, 2)}\n`);
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  // Test 5: DELETE /api/internships/:id
  console.log('5. Testing DELETE /api/internships/:id');
  try {
    const result = await makeRequest('DELETE', `/${internshipId}`, null, authToken);
    console.log(`   Status: ${result.status} (Expected: 200 with auth)`);
    console.log(`   Response: ${JSON.stringify(result.data, null, 2)}\n`);
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }
}

async function runTests() {
  console.log('Starting Internship API Tests...\n');
  console.log('=' .repeat(60) + '\n');
  
  const createdId = await testEndpoints();
  await testWithId(createdId);
  
  console.log('=' .repeat(60));
  console.log('\n✓ All tests completed!');
  console.log('\nNote: Protected routes (POST, PUT, DELETE) require admin authentication.');
  console.log('Expected status codes:');
  console.log('  - GET /api/internships → 200');
  console.log('  - POST /api/internships → 201 (with auth) or 401 (without)');
  console.log('  - PUT /api/internships/:id → 200 (with auth) or 401 (without)');
  console.log('  - DELETE /api/internships/:id → 200 (with auth) or 401 (without)');
}

runTests().catch(console.error);