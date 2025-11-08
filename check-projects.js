const mongoose = require('mongoose');

// MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017/construction_management';

async function checkProjects() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
    
    // Check if projects collection exists and has data
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('📋 Available collections:', collections.map(c => c.name));
    
    // Check projects collection
    const projectsCollection = db.collection('projects');
    const projectCount = await projectsCollection.countDocuments();
    console.log(`📊 Total projects in database: ${projectCount}`);
    
    if (projectCount > 0) {
      const projects = await projectsCollection.find({}).toArray();
      console.log('📝 Projects found:');
      projects.forEach((project, index) => {
        console.log(`${index + 1}. ${project.name} - ${project.client} (${project.status})`);
        console.log(`   Created: ${project.createdAt}`);
        console.log(`   Budget: $${project.budget}`);
        console.log('---');
      });
    } else {
      console.log('❌ No projects found in database');
    }
    
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected successfully!');
    
  } catch (error) {
    console.error('❌ Error checking projects:', error);
    process.exit(1);
  }
}

checkProjects();
