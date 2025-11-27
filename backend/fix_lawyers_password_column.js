const db = require('./db');

async function fixLawyersPasswordColumn() {
  try {
    console.log('Making lawyers password column nullable...');
    await db.raw('ALTER TABLE lawyers MODIFY COLUMN password VARCHAR(255) NULL');
    console.log('✅ Lawyers password column is now nullable');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

fixLawyersPasswordColumn();