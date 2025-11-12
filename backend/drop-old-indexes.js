// Script to drop old unique indexes from Attendance collection
// Run this once in MongoDB shell or MongoDB Compass
// This fixes the "Duplicate key error on employeeId" issue

// Connect to your database first, then run:

// Drop the old unique index on employeeId + date (if it exists)
db.attendances.dropIndex("employeeId_1_date_1");

// Drop any other old unique indexes that might exist
try {
  db.attendances.dropIndex("employeeId_1_date_1");
  print("✅ Dropped old unique index: employeeId_1_date_1");
} catch (e) {
  print("ℹ️ Index employeeId_1_date_1 doesn't exist or already dropped");
}

// List all indexes to verify
print("\n📋 Current indexes on attendances collection:");
db.attendances.getIndexes().forEach(function(index) {
  print("  - " + index.name + ": " + JSON.stringify(index.key) + (index.unique ? " (UNIQUE)" : ""));
});

print("\n✅ Done! The new non-unique indexes will be created automatically when the app restarts.");

