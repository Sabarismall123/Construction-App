// Script to list ALL indexes on Attendance collection
// Run this in MongoDB shell or MongoDB Compass to find unique indexes

// Connect to your database first, then run:

print("📋 ALL INDEXES ON attendances COLLECTION:\n");

const indexes = db.attendances.getIndexes();

indexes.forEach(function(index) {
  const isUnique = index.unique ? " ⚠️ UNIQUE ⚠️" : "";
  const isPartial = index.partialFilterExpression ? " (PARTIAL)" : "";
  print(`Name: ${index.name}`);
  print(`  Keys: ${JSON.stringify(index.key)}`);
  print(`  Type: ${index.unique ? 'UNIQUE' : 'REGULAR'}${isUnique}${isPartial}`);
  if (index.unique) {
    print(`  ⚠️⚠️⚠️ THIS IS A UNIQUE INDEX - DROP IT! ⚠️⚠️⚠️`);
  }
  print("");
});

// Count unique indexes
const uniqueIndexes = indexes.filter(idx => idx.unique);
print(`\n📊 SUMMARY:`);
print(`  Total indexes: ${indexes.length}`);
print(`  Unique indexes: ${uniqueIndexes.length}${uniqueIndexes.length > 1 ? ' ⚠️ (excluding _id_)' : ''}`);

if (uniqueIndexes.length > 1) {
  print(`\n⚠️⚠️⚠️ FOUND ${uniqueIndexes.length - 1} UNIQUE INDEX(ES) TO DROP:`);
  uniqueIndexes.forEach(function(idx) {
    if (idx.name !== '_id_') {
      print(`  - ${idx.name}: ${JSON.stringify(idx.key)}`);
      print(`    Command to drop: db.attendances.dropIndex("${idx.name}")`);
    }
  });
} else {
  print(`\n✅ No unique indexes found (except _id_ which is normal)`);
}

