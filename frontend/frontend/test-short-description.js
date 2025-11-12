const http = require('http');

async function testShortDescription() {
  console.log('🔄 Testing project creation with short description...');
  
  try {
    // Test project with short description
    const testProject = {
      name: 'Test Short Description',
      client: 'Test Client',
      description: 'df', // Short description that was failing
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      budget: 50000,
      status: 'planning',
      progress: 0
    };
    
    console.log('📝 Creating project with short description...');
    const createResponse = await makeRequest('http://localhost:5000/api/projects', 'POST', testProject);
    console.log('✅ Project creation response:', createResponse.success);
    
    if (createResponse.success) {
      console.log('🎉 Project created successfully!');
      console.log('📊 Project details:', createResponse.data);
    } else {
      console.log('❌ Project creation failed:', createResponse);
    }
    
  } catch (error) {
    console.log('❌ Error testing short description:', error.message);
  }
}

function makeRequest(url, method = 'GET', data = null) {
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

testShortDescription();
