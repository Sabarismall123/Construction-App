const http = require('http');

async function testTaskAPI() {
  console.log('🔄 Testing task API...');
  
  try {
    // Test 1: Get tasks
    console.log('📋 Getting tasks...');
    const tasksResponse = await makeRequest('http://localhost:5000/api/tasks', 'GET');
    console.log('✅ Tasks response:', tasksResponse.success);
    console.log('📊 Tasks count:', tasksResponse.count);
    
    if (tasksResponse.data && tasksResponse.data.length > 0) {
      console.log('\n📝 Tasks found:');
      tasksResponse.data.forEach((task, index) => {
        console.log(`${index + 1}. ${task.title} - ${task.status}`);
        console.log(`   ID: ${task._id}`);
        console.log(`   Project: ${task.projectId?.name || 'N/A'}`);
        console.log('---');
      });
    } else {
      console.log('🤷‍♀️ No tasks found in database');
    }
    
    // Test 2: Create a task
    console.log('\n📝 Creating a test task...');
    const testTask = {
      title: 'floor cleaning',
      description: 'need t finsh',
      projectId: '68f71baed6871d43d70fa5fc', // Use the Sabari Vasan project ID
      priority: 'high',
      status: 'todo',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
      estimatedHours: 8
    };
    
    const createResponse = await makeRequest('http://localhost:5000/api/tasks', 'POST', testTask);
    console.log('✅ Task creation response:', createResponse.success);
    
    if (createResponse.success) {
      console.log('🎉 Task created successfully!');
      console.log('📊 Task details:', createResponse.data);
      
      // Test 3: Get tasks again to verify
      console.log('\n📋 Getting tasks again to verify...');
      const tasksAfterCreate = await makeRequest('http://localhost:5000/api/tasks', 'GET');
      console.log('📊 Tasks after creating:', tasksAfterCreate.count);
      
      if (tasksAfterCreate.data && tasksAfterCreate.data.length > 0) {
        console.log('\n📝 All tasks now:');
        tasksAfterCreate.data.forEach((task, index) => {
          console.log(`${index + 1}. ${task.title} - ${task.status}`);
          console.log(`   ID: ${task._id}`);
          console.log(`   Project: ${task.projectId?.name || 'N/A'}`);
          console.log(`   Assigned To: ${task.assignedTo?.name || 'N/A'}`);
          console.log('---');
        });
      }
    } else {
      console.log('❌ Task creation failed:', createResponse);
    }
    
  } catch (error) {
    console.log('❌ Error testing task API:', error.message);
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

testTaskAPI();
