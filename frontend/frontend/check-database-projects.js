const http = require('http');

async function checkDatabaseProjects() {
  console.log('🔄 Checking projects in database...');
  
  try {
    // Login first
    const loginData = {
      email: 'test@example.com',
      password: 'password123'
    };
    
    const loginResponse = await makeRequest('http://localhost:5000/api/auth/login', 'POST', loginData);
    console.log('✅ Login successful:', loginResponse.success);
    
    if (loginResponse.success && loginResponse.token) {
      // Get all projects
      const projectsResponse = await makeRequest('http://localhost:5000/api/projects', 'GET', null, loginResponse.token);
      console.log('📊 Projects in database:');
      console.log('Success:', projectsResponse.success);
      console.log('Count:', projectsResponse.count);
      console.log('Total:', projectsResponse.total);
      
      if (projectsResponse.data && projectsResponse.data.length > 0) {
        console.log('\n📝 Projects found:');
        projectsResponse.data.forEach((project, index) => {
          console.log(`${index + 1}. ${project.name} - ${project.client}`);
          console.log(`   ID: ${project._id}`);
          console.log(`   Status: ${project.status}`);
          console.log(`   Budget: $${project.budget}`);
          console.log(`   Created: ${project.createdAt}`);
          console.log('---');
        });
      } else {
        console.log('❌ No projects found in database');
      }
    }
    
  } catch (error) {
    console.log('❌ Error checking database:', error.message);
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

checkDatabaseProjects();
