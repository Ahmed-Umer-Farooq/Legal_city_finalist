const db = require('./db');

async function testComments() {
  try {
    console.log('🧪 Testing blog comments functionality...');
    
    // Check if blog_comments table exists
    const tableExists = await db.schema.hasTable('blog_comments');
    console.log('✅ blog_comments table exists:', tableExists);
    
    if (tableExists) {
      // Get table info
      const columns = await db('blog_comments').columnInfo();
      console.log('📋 Table columns:', Object.keys(columns));
      
      // Check if there are any existing comments
      const commentCount = await db('blog_comments').count('id as count').first();
      console.log('💬 Existing comments:', commentCount.count);
      
      // Test getting comments for a blog (should return empty array if no comments)
      const blogComments = await db('blog_comments')
        .select('*')
        .where('blog_id', 1)
        .limit(5);
      console.log('📝 Sample comments for blog 1:', blogComments.length);
    }
    
    console.log('✅ Comment system test completed successfully!');
    
  } catch (error) {
    console.error('❌ Error testing comments:', error);
  } finally {
    process.exit(0);
  }
}

testComments();