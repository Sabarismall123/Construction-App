
const http = require('http');

async function testTaskWithStringUser() {
  console.log('🔄 Testing task creation with string user...');
  
  try {
    // Test task with string assignedTo (like "sabari")
    const testTask = {
      title: 'Test Task with String User',
      description: 'Testing with string assignedTo',
      projectId: '68f71baed6871d43d70fa5fc', // Use the Sabari Vasan project ID
      assignedTo: 'sabari', // This was causing the validation error
      priority: 'high',
      status: 'todo',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
      estimatedHours: 8
    };
    
    console.log('📝 Creating task with assignedTo: "sabari"...');
    const createResponse = await makeRequest('http://localhost:5000/api/tasks', 'POST', testTask);
    console.log('✅ Task creation response:', createResponse.success);
    
    if (createResponse.success) {
      console.log('🎉 Task created successfully!');
      console.log('📊 Task details:', createResponse.data);
    } else {
      console.log('❌ Task creation failed:', createResponse);
    }
    
  } catch (error) {
    console.log('❌ Error testing task creation:', error.message);
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

testTaskWithStringUser();
