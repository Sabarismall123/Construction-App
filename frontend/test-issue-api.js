const http = require('http');

async function testIssueAPI() {
  console.log('🔄 Testing issue API...');
  
  try {
    // Test 1: Get issues
    console.log('📋 Getting issues...');
    const issuesResponse = await makeRequest('http://localhost:5000/api/issues', 'GET');
    console.log('✅ Issues response:', issuesResponse.success);
    console.log('📊 Issues count:', issuesResponse.count);
    
    if (issuesResponse.data && issuesResponse.data.length > 0) {
      console.log('\n📝 Issues found:');
      issuesResponse.data.forEach((issue, index) => {
        console.log(`${index + 1}. ${issue.title} - ${issue.status}`);
        console.log(`   ID: ${issue._id}`);
        console.log(`   Project: ${issue.projectId?.name || 'N/A'}`);
        console.log('---');
      });
    } else {
      console.log('🤷‍♀️ No issues found in database');
    }
    
    // Test 2: Create an issue
    console.log('\n📝 Creating a test issue...');
    const testIssue = {
      title: 'Test Issue',
      description: 'This is a test issue created from frontend',
      projectId: '68f71baed6871d43d70fa5fc', // Use the Sabari Vasan project ID
      assignedTo: 'sabari', // String value like in the form
      reportedBy: 'admin', // String value
      priority: 'high',
      status: 'open',
      category: 'quality',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    };
    
    const createResponse = await makeRequest('http://localhost:5000/api/issues', 'POST', testIssue);
    console.log('✅ Issue creation response:', createResponse.success);
    
    if (createResponse.success) {
      console.log('🎉 Issue created successfully!');
      console.log('📊 Issue details:', createResponse.data);
      
      // Test 3: Get issues again to verify
      console.log('\n📋 Getting issues again to verify...');
      const issuesAfterCreate = await makeRequest('http://localhost:5000/api/issues', 'GET');
      console.log('📊 Issues after creating:', issuesAfterCreate.count);
      
      if (issuesAfterCreate.data && issuesAfterCreate.data.length > 0) {
        console.log('\n📝 All issues now:');
        issuesAfterCreate.data.forEach((issue, index) => {
          console.log(`${index + 1}. ${issue.title} - ${issue.status}`);
          console.log(`   ID: ${issue._id}`);
          console.log(`   Project: ${issue.projectId?.name || 'N/A'}`);
          console.log(`   Assigned To: ${issue.assignedToName || issue.assignedTo?.name || 'N/A'}`);
          console.log(`   Reported By: ${issue.reportedByName || issue.reportedBy?.name || 'N/A'}`);
          console.log('---');
        });
      }
    } else {
      console.log('❌ Issue creation failed:', createResponse);
    }
    
  } catch (error) {
    console.log('❌ Error testing issue API:', error.message);
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

testIssueAPI();
