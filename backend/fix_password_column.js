const db = require('./db');

async function fixPasswordColumn() {
  try {
    console.log('Making password column nullable...');
    await db.raw('ALTER TABLE users MODIFY COLUMN password VARCHAR(255) NULL');
    console.log('✅ Password column is now nullable');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixPasswordColumn();