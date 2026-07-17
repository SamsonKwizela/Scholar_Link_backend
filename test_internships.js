const http = require('http');

const BASE_URL = 'http://localhost:8000/api/internships';

function makeRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    // Construct full URL by concatenating BASE_URL with path
    const fullUrl = BASE_URL + path;
    const url = new URL(fullUrl);
    const options = {
      hostname: url.hostname,
      port: url.port,
      path: url.pathname + url.search,
      method: method,
      headers: {
        'Content-Type': 'application/json',
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

async function testEndpoints() {
  console.log('Testing Internship Endpoints...\n');

  // Test 1: GET /api/internships (should return 200)
  console.log('1. Testing GET /api/internships');
  try {
    const result = await makeRequest('GET', '/');
    console.log(`   Status: ${result.status}`);
    console.log(`   Response: ${JSON.stringify(result.data, null, 2)}\n`);
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  // Test 2: GET /api/internships/:id (should return 404 for non-existent ID)
  console.log('2. Testing GET /api/internships/:id (non-existent)');
  try {
    const result = await makeRequest('GET', '/123456789012345678901234');
    console.log(`   Status: ${result.status}`);
    console.log(`   Response: ${JSON.stringify(result.data, null, 2)}\n`);
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  // Test 3: POST /api/internships (should return 201 or 401/403 if not authenticated)
  console.log('3. Testing POST /api/internships');
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
    const result = await makeRequest('POST', '/', testData);
    console.log(`   Status: ${result.status}`);
    console.log(`   Response: ${JSON.stringify(result.data, null, 2)}\n`);
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  // Test 4: PUT /api/internships/:id (should return 404 or 401/403)
  console.log('4. Testing PUT /api/internships/:id');
  try {
    const result = await makeRequest('PUT', '/123456789012345678901234', { title: 'Updated' });
    console.log(`   Status: ${result.status}`);
    console.log(`   Response: ${JSON.stringify(result.data, null, 2)}\n`);
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  // Test 5: DELETE /api/internships/:id (should return 404 or 401/403)
  console.log('5. Testing DELETE /api/internships/:id');
  try {
    const result = await makeRequest('DELETE', '/123456789012345678901234');
    console.log(`   Status: ${result.status}`);
    console.log(`   Response: ${JSON.stringify(result.data, null, 2)}\n`);
  } catch (error) {
    console.log(`   Error: ${error.message}\n`);
  }

  console.log('Testing complete!');
}

testEndpoints();