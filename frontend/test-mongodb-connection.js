const mongoose = require('mongoose');

// MongoDB connection string
const MONGODB_URI = 'mongodb://localhost:27017/construction_management';

async function testConnection() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ MongoDB connected successfully!');
    
    // Test creating a simple document
    const testSchema = new mongoose.Schema({
      name: String,
      createdAt: { type: Date, default: Date.now }
    });
    
    const TestModel = mongoose.model('Test', testSchema);
    
    const testDoc = new TestModel({ name: 'Test Document' });
    await testDoc.save();
    console.log('✅ Test document saved successfully!');
    
    // Find the document
    const foundDoc = await TestModel.findOne({ name: 'Test Document' });
    console.log('✅ Test document found:', foundDoc);
    
    // Clean up
    await TestModel.deleteOne({ name: 'Test Document' });
    console.log('✅ Test document cleaned up!');
    
    await mongoose.disconnect();
    console.log('✅ MongoDB disconnected successfully!');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error);
    process.exit(1);
  }
}

testConnection();
