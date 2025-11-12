const https = require('https');
const http = require('http');

// Test the API endpoints
async function testAPI() {
  console.log('🔄 Testing API endpoints...');
  
  // Test 1: Check if backend is running
  try {
    const response = await makeRequest('http://localhost:5000/');
    console.log('✅ Backend is running:', response);
  } catch (error) {
    console.log('❌ Backend is not running:', error.message);
    return;
  }
  
  // Test 2: Try to get projects (should fail without auth)
  try {
    const response = await makeRequest('http://localhost:5000/api/projects');
    console.log('📊 Projects API response:', response);
  } catch (error) {
    console.log('🔒 Projects API requires authentication (expected):', error.message);
  }
  
  // Test 3: Try to register a test user
  try {
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'manager'
    };
    
    const response = await makeRequest('http://localhost:5000/api/auth/register', 'POST', testUser);
    console.log('✅ Test user registered:', response);
    
    // Test 4: Try to login
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const loginResponse = await makeRequest('http://localhost:5000/api/auth/login', 'POST', loginData);
    console.log('✅ Test user logged in:', loginResponse);
    
    if (loginResponse.token) {
      // Test 5: Try to get projects with auth
      const projectsResponse = await makeRequest('http://localhost:5000/api/projects', 'GET', null, loginResponse.token);
      console.log('📊 Projects with auth:', projectsResponse);
      
      // Test 6: Try to create a test project
      const testProject = {
        name: 'Test Project',
        client: 'Test Client',
        description: 'This is a test project',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        budget: 100000,
        status: 'planning',
        progress: 0
      };
      
      const createResponse = await makeRequest('http://localhost:5000/api/projects', 'POST', testProject, loginResponse.token);
      console.log('✅ Test project created:', createResponse);
      
      // Test 7: Get projects again to see if it was saved
      const projectsAfterCreate = await makeRequest('http://localhost:5000/api/projects', 'GET', null, loginResponse.token);
      console.log('📊 Projects after creating test project:', projectsAfterCreate);
    }
    
  } catch (error) {
    console.log('❌ Error testing API:', error.message);
  }
}

function makeRequest(url, method = 'GET', data = null, token = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port,
      path: urlObj.pathname,
      method: method,
      headers: {
        'Content-Type': 'application/json',
      }
    };
    
    if (token) {
      options.headers['Authorization'] = `Bearer ${token}`;
    }
    
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => {
        body += chunk;
      });
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve(jsonBody);
        } catch (e) {
          resolve(body);
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

testAPI();
