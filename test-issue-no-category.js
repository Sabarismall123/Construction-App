const http = require('http');

async function testIssueWithoutCategory() {
  console.log('🔄 Testing issue creation without category...');
  
  try {
    // Test issue without category (like from frontend form)
    const testIssue = {
      title: 'Test Issue Without Category',
      description: 'This is a test issue created without category field',
      projectId: '68f71baed6871d43d70fa5fc', // Use the Sabari Vasan project ID
      assignedTo: 'sabari',
      reportedBy: 'admin',
      priority: 'high',
      status: 'open',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      // No category field - this was causing the error
    };
    
    console.log('📝 Creating issue without category...');
    const createResponse = await makeRequest('http://localhost:5000/api/issues', 'POST', testIssue);
    console.log('✅ Issue creation response:', createResponse.success);
    
    if (createResponse.success) {
      console.log('🎉 Issue created successfully!');
      console.log('📊 Issue details:', createResponse.data);
    } else {
      console.log('❌ Issue creation failed:', createResponse);
    }
    
  } catch (error) {
    console.log('❌ Error testing issue creation:', error.message);
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

testIssueWithoutCategory();
