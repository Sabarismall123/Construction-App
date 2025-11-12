const http = require('http');

async function testPublicAPI() {
  console.log('🔄 Testing public API endpoints...');
  
  try {
    // Test 1: Get projects without auth
    console.log('📋 Getting projects without authentication...');
    const projectsResponse = await makeRequest('http://localhost:5000/api/projects', 'GET');
    console.log('✅ Projects response:', projectsResponse.success);
    console.log('📊 Projects count:', projectsResponse.count);
    
    if (projectsResponse.data && projectsResponse.data.length > 0) {
      console.log('\n📝 Projects found:');
      projectsResponse.data.forEach((project, index) => {
        console.log(`${index + 1}. ${project.name} - ${project.client}`);
        console.log(`   ID: ${project._id}`);
        console.log(`   Status: ${project.status}`);
        console.log('---');
      });
    }
    
    // Test 2: Create a project without auth
    console.log('\n📝 Creating project without authentication...');
    const testProject = {
      name: 'Sabari Vasan',
      client: 'noel',
      description: 'This is a test project created from frontend',
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      budget: 22222,
      status: 'planning',
      progress: 0
    };
    
    const createResponse = await makeRequest('http://localhost:5000/api/projects', 'POST', testProject);
    console.log('✅ Project creation response:', createResponse.success);
    
    if (createResponse.success) {
      console.log('🎉 Project created successfully!');
      console.log('📊 Project details:', createResponse.data);
      
      // Test 3: Get projects again to verify
      console.log('\n📋 Getting projects again to verify...');
      const projectsAfterCreate = await makeRequest('http://localhost:5000/api/projects', 'GET');
      console.log('📊 Projects after creating:', projectsAfterCreate.count);
      
      if (projectsAfterCreate.data && projectsAfterCreate.data.length > 0) {
        console.log('\n📝 All projects now:');
        projectsAfterCreate.data.forEach((project, index) => {
          console.log(`${index + 1}. ${project.name} - ${project.client}`);
          console.log(`   ID: ${project._id}`);
          console.log(`   Status: ${project.status}`);
          console.log('---');
        });
      }
    } else {
      console.log('❌ Project creation failed:', createResponse);
    }
    
  } catch (error) {
    console.log('❌ Error testing public API:', error.message);
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

testPublicAPI();
