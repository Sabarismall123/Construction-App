import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/construction_management';

async function fixAttendanceIndex() {
  try {
    console.log('🔄 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const db = mongoose.connection.db;
    if (!db) {
      throw new Error('Database connection failed');
    }
    const collection = db.collection('attendances');

    // Drop the old unique index if it exists
    try {
      console.log('🗑️  Dropping old index: employeeId_1_date_1');
      await collection.dropIndex('employeeId_1_date_1');
      console.log('✅ Old index dropped successfully');
    } catch (error: any) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('ℹ️  Old index does not exist, skipping...');
      } else {
        console.error('⚠️  Error dropping old index:', error.message);
      }
    }

    // Drop the new index if it exists (to recreate it)
    try {
      await collection.dropIndex('employeeName_1_date_1_projectId_1');
      console.log('✅ Dropped existing employeeName index');
    } catch (error: any) {
      if (error.code === 27 || error.codeName === 'IndexNotFound') {
        console.log('ℹ️  employeeName index does not exist, skipping...');
      }
    }

    // Create new indexes
    console.log('📝 Creating new indexes...');

    // Index for employees (with employeeId) - only applies when employeeId is not null
    try {
      await collection.createIndex(
        { employeeId: 1, date: 1 },
        {
          unique: true,
          partialFilterExpression: { employeeId: { $exists: true, $ne: null } },
          name: 'employeeId_1_date_1'
        }
      );
      console.log('✅ Created employeeId_1_date_1 index (for employees only)');
    } catch (error: any) {
      console.error('⚠️  Error creating employeeId index:', error.message);
      // Try without unique constraint if partial filter fails
      try {
        await collection.createIndex(
          { employeeId: 1, date: 1 },
          {
            unique: true,
            sparse: true,
            name: 'employeeId_1_date_1'
          }
        );
        console.log('✅ Created employeeId_1_date_1 index (sparse, for employees only)');
      } catch (error2: any) {
        console.error('⚠️  Error creating employeeId index (sparse):', error2.message);
      }
    }

    // Index for labour records (without employeeId) - by employeeName + date + projectId
    try {
      await collection.createIndex(
        { employeeName: 1, date: 1, projectId: 1 },
        {
          unique: true,
          partialFilterExpression: { employeeId: null },
          name: 'employeeName_1_date_1_projectId_1'
        }
      );
      console.log('✅ Created employeeName_1_date_1_projectId_1 index (for labour records)');
    } catch (error: any) {
      console.error('⚠️  Error creating employeeName index:', error.message);
    }

    console.log('✅ Index fix completed successfully!');
    console.log('📊 New index structure:');
    console.log('   - employeeId_1_date_1: Unique for employees only (sparse)');
    console.log('   - employeeName_1_date_1_projectId_1: Unique for labour records');

    await mongoose.connection.close();
    console.log('✅ Connection closed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error fixing index:', error);
    process.exit(1);
  }
}

fixAttendanceIndex();

