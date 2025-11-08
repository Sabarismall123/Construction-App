const http = require('http');

async function testProjectCreation() {
  console.log('🔄 Testing project creation...');
  
  try {
    // Step 1: Register a test user
    const testUser = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'password123',
      role: 'manager'
    };
    
    const registerResponse = await makeRequest('http://localhost:5000/api/auth/register', 'POST', testUser);
    console.log('✅ Test user registered:', registerResponse.success);
    
    if (!registerResponse.success) {
      // Try to login if user already exists
      const loginData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      const loginResponse = await makeRequest('http://localhost:5000/api/auth/login', 'POST', loginData);
      console.log('✅ Test user logged in:', loginResponse.success);
      
      if (loginResponse.success) {
        var token = loginResponse.token;
      }
    } else {
      var token = registerResponse.token;
    }
    
    if (token) {
      // Step 2: Create a test project
      const testProject = {
        name: 'Test Project from API',
        client: 'Test Client',
        description: 'This is a test project created via API',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        budget: 100000,
        status: 'planning',
        progress: 0
      };
      
      console.log('📝 Creating test project...');
      const createResponse = await makeRequest('http://localhost:5000/api/projects', 'POST', testProject, token);
      console.log('✅ Project creation response:', createResponse);
      
      if (createResponse.success) {
        console.log('🎉 Project created successfully!');
        console.log('📊 Project details:', createResponse.data);
        
        // Step 3: Get all projects to verify
        console.log('📋 Fetching all projects...');
        const projectsResponse = await makeRequest('http://localhost:5000/api/projects', 'GET', null, token);
        console.log('📊 All projects:', projectsResponse);
        
        if (projectsResponse.success && projectsResponse.data.length > 0) {
          console.log('✅ Projects found in database:', projectsResponse.data.length);
          projectsResponse.data.forEach((project, index) => {
            console.log(`${index + 1}. ${project.name} - ${project.client} (${project.status})`);
            console.log(`   ID: ${project._id}`);
            console.log(`   Created: ${project.createdAt}`);
            console.log('---');
          });
        } else {
          console.log('❌ No projects found in database');
        }
      } else {
        console.log('❌ Project creation failed:', createResponse);
      }
    }
    
  } catch (error) {
    console.log('❌ Error testing project creation:', error.message);
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

testProjectCreation();
