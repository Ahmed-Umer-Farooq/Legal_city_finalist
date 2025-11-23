const db = require('./db');

async function seedSampleBlogs() {
  try {
    // Check if blogs already exist
    const existingBlogs = await db('blogs').count('id as count').first();
    if (existingBlogs.count > 0) {
      console.log('Blogs already exist, skipping seed');
      return;
    }

    // Insert sample blogs
    await db('blogs').insert([
      {
        title: 'Understanding Corporate Law Basics',
        slug: 'understanding-corporate-law-basics',
        excerpt: 'A comprehensive guide to corporate law fundamentals for business owners and entrepreneurs.',
        content: 'Corporate law is a complex field that governs the formation, operation, and dissolution of corporations. This article covers the essential aspects every business owner should understand...',
        featured_image: 'https://via.placeholder.com/600x300/0066cc/ffffff?text=Corporate+Law',
        category: 'Corporate Law',
        author_name: 'Legal Expert',
        status: 'published',
        published_at: new Date('2024-12-01'),
        created_at: new Date('2024-12-01'),
        updated_at: new Date('2024-12-01'),
        views_count: 150
      },
      {
        title: 'Family Law: Child Custody Guidelines',
        slug: 'family-law-child-custody-guidelines',
        excerpt: 'Important information about child custody proceedings and what parents need to know.',
        content: 'Child custody cases are among the most emotionally challenging legal proceedings. Understanding the guidelines and factors that courts consider can help parents navigate this difficult process...',
        featured_image: 'https://via.placeholder.com/600x300/009966/ffffff?text=Family+Law',
        category: 'Family Law',
        author_name: 'Legal Expert',
        status: 'published',
        published_at: new Date('2024-12-05'),
        created_at: new Date('2024-12-05'),
        updated_at: new Date('2024-12-05'),
        views_count: 89
      },
      {
        title: 'Criminal Defense: Your Rights During Arrest',
        slug: 'criminal-defense-your-rights-during-arrest',
        excerpt: 'Know your constitutional rights when facing criminal charges and police interactions.',
        content: 'Being arrested can be a frightening experience, but knowing your rights can make a significant difference in your case. This article outlines the fundamental rights every person has during police encounters...',
        featured_image: 'https://via.placeholder.com/600x300/cc6600/ffffff?text=Criminal+Defense',
        category: 'Criminal Law',
        author_name: 'Legal Expert',
        status: 'published',
        published_at: new Date('2024-12-10'),
        created_at: new Date('2024-12-10'),
        updated_at: new Date('2024-12-10'),
        views_count: 234
      }
    ]);

    console.log('✅ Sample blogs seeded successfully');
  } catch (error) {
    console.error('❌ Error seeding blogs:', error);
  } finally {
    process.exit();
  }
}

seedSampleBlogs();