import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Clock, Calendar, Share2, Heart, Bookmark, Twitter, Facebook, Linkedin } from 'lucide-react';

const BlogDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [blogPost, setBlogPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [relatedArticles, setRelatedArticles] = useState([]);

  // Mock blog data - this will be replaced with API call
  const mockBlogData = {
    1: {
      id: 1,
      title: "The Impact of Technology on the Workplace: How Technology is Changing the Future of Work",
      subtitle: "Exploring how digital transformation is reshaping modern work environments and employee experiences",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/11f7861cf89e09f6875572fe63029caefc31975f?width=1200",
      category: "Technology",
      author: "Tracey Wilson",
      authorImage: "https://api.builder.io/api/v1/image/assets/TEMP/6e945e1cd44d2b22a4cb1d0842ee1f337241865a?width=72",
      authorBio: "Senior Technology Writer with 10+ years of experience covering digital transformation and workplace innovation.",
      date: "August 20, 2022",
      readTime: "8 min read",
      content: `<p>The modern workplace has undergone a dramatic transformation in recent years, driven largely by rapid technological advancement and changing employee expectations...</p>`
    },
    2: {
      id: 2,
      title: "Remote Work Best Practices for 2024",
      subtitle: "Essential strategies for building effective remote teams and maintaining productivity",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/450d0adf401d715bca87a6daa7b1191160d2fbd0?width=1200",
      category: "Workplace",
      author: "Jason Francisco",
      authorImage: "https://api.builder.io/api/v1/image/assets/TEMP/757c3729b6e0edaf54ca15744d2032dbf6f9f7e4?width=72",
      authorBio: "Remote work consultant and productivity expert helping companies transition to distributed teams.",
      date: "August 15, 2022",
      readTime: "6 min read",
      content: `<p>Remote work has become the new normal for millions of professionals worldwide. As we move into 2024, organizations are refining their remote work strategies...</p>`
    },
    3: {
      id: 3,
      title: "AI Tools Every Professional Should Know",
      subtitle: "Discover the artificial intelligence tools that are revolutionizing professional workflows",
      image: "https://api.builder.io/api/v1/image/assets/TEMP/009a2c6f83dbee655315ff081a26f62a37882d38?width=1200",
      category: "AI & Technology",
      author: "Ernie Smith",
      authorImage: "https://api.builder.io/api/v1/image/assets/TEMP/61278300fa3bc490e7708662fbbdb4b37596dc7c?width=72",
      authorBio: "AI researcher and technology journalist specializing in practical applications of artificial intelligence.",
      date: "August 10, 2022",
      readTime: "7 min read",
      content: `<p>Artificial Intelligence is no longer a futuristic concept—it's here, and it's transforming how we work. From content creation to data analysis...</p>`
    }
  };

  useEffect(() => {
    const fetchBlogPost = async () => {
      try {
        setLoading(true);
        console.log('🔍 Fetching blog post with ID:', id);
        
        const response = await fetch(`http://localhost:5001/api/blogs/${id}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('📊 Blog detail response:', data);
        
        // Transform backend data to match frontend format
        const transformedPost = {
          id: data.id,
          title: data.title,
          subtitle: data.excerpt || 'Read more about this topic',
          image: data.featured_image,
          category: data.category || 'General',
          author: data.author_name || 'Unknown Author',
          authorImage: data.author_image,
          authorBio: data.author_bio || 'Professional writer and legal expert',
          date: new Date(data.published_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
          }),
          readTime: '5 min read',
          content: data.content || '<p>Content coming soon...</p>'
        };
        
        console.log('✅ Transformed blog post:', transformedPost);
        setBlogPost(transformedPost);
        
      } catch (err) {
        console.error('❌ Error fetching blog post:', err);
        setError('Failed to load blog post');
      } finally {
        setLoading(false);
      }
    };

    fetchBlogPost();
  }, [id]);

  // Fetch related articles from database
  useEffect(() => {
    const fetchRelatedArticles = async () => {
      try {
        console.log('🔗 Fetching related articles...');
        const response = await fetch('http://localhost:5001/api/blogs?limit=6');
        const articles = await response.json();
        
        // Filter out current article and take first 3
        const related = articles
          .filter(article => article.id !== parseInt(id))
          .slice(0, 3)
          .map(article => ({
            id: article.id,
            title: article.title,
            image: article.featured_image,
            category: article.category || 'General',
            readTime: '5 min read'
          }));
        
        console.log('✅ Related articles:', related);
        setRelatedArticles(related);
      } catch (error) {
        console.error('❌ Error fetching related articles:', error);
      }
    };

    if (id) {
      fetchRelatedArticles();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading blog post...</p>
        </div>
      </div>
    );
  }

  if (error || !blogPost) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Blog Post Not Found</h1>
          <p className="text-gray-600 mb-6">{error || 'The requested blog post could not be found.'}</p>
          <button 
            onClick={() => navigate('/blogs')}
            className="flex items-center gap-2 mx-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Back to Blogs
          </button>
        </div>
      </div>
    );
  }

  const currentBlogPost = {
    ...blogPost
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Navigation */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <button 
            onClick={() => navigate('/blogs')}
            className="flex items-center gap-2 text-gray-600 hover:text-blue-600 transition-colors font-medium"
          >
            <ArrowLeft size={20} />
            Back to Blogs
          </button>
        </div>
      </div>

      {/* Hero Section */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          {/* Category Badge */}
          <div className="mb-6">
            <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
              {currentBlogPost.category}
            </span>
          </div>

          {/* Title */}
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
            {currentBlogPost.title}
          </h1>

          {/* Subtitle */}
          <p className="text-xl text-gray-600 leading-relaxed mb-8">
            {currentBlogPost.subtitle}
          </p>

          {/* Meta Information */}
          <div className="flex flex-wrap items-center gap-6 mb-8">
            <div className="flex items-center gap-3">
              {currentBlogPost.authorImage ? (
                <img 
                  src={currentBlogPost.authorImage} 
                  alt={currentBlogPost.author}
                  className="w-12 h-12 rounded-full object-cover"
                />
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E7EFFD] to-[#0071BC] flex items-center justify-center">
                  <span className="text-white font-bold">{currentBlogPost.author?.charAt(0) || 'A'}</span>
                </div>
              )}
              <div>
                <p className="font-semibold text-gray-900">{currentBlogPost.author}</p>
                <p className="text-sm text-gray-600">Senior Technology Writer</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Calendar size={16} />
                {currentBlogPost.date}
              </div>
              <div className="flex items-center gap-1">
                <Clock size={16} />
                {currentBlogPost.readTime}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-4 mb-8">
            <button className="flex items-center gap-2 px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors">
              <Heart size={18} />
              <span className="font-medium">Like</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors">
              <Bookmark size={18} />
              <span className="font-medium">Save</span>
            </button>
            <button className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors">
              <Share2 size={18} />
              <span className="font-medium">Share</span>
            </button>
          </div>
        </div>
      </div>

      {/* Featured Image */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {currentBlogPost.image ? (
            <img 
              src={currentBlogPost.image} 
              alt={currentBlogPost.title}
              className="w-full h-96 object-cover rounded-xl shadow-lg"
            />
          ) : (
            <div className="w-full h-96 bg-gradient-to-br from-[#E7EFFD] via-[#B8D4F1] to-[#0071BC] rounded-xl shadow-lg flex items-center justify-center">
              <div className="text-center">
                <div className="w-20 h-20 mx-auto mb-4 bg-white/20 rounded-full flex items-center justify-center">
                  <svg className="w-10 h-10 text-white" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                  </svg>
                </div>
                <span className="text-white font-medium text-lg">{currentBlogPost.category} Article</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Article Content */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="prose prose-lg max-w-none">
            <div 
              dangerouslySetInnerHTML={{ __html: currentBlogPost.content }}
              className="text-gray-800 leading-relaxed space-y-6"
              style={{
                fontSize: '18px',
                lineHeight: '1.8'
              }}
            />
          </div>
        </div>
      </div>

      {/* Author Bio */}
      <div className="bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="bg-white rounded-xl p-8 shadow-sm">
            <div className="flex items-start gap-6">
              {currentBlogPost.authorImage ? (
                <img 
                  src={currentBlogPost.authorImage} 
                  alt={currentBlogPost.author}
                  className="w-20 h-20 rounded-full object-cover flex-shrink-0"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[#E7EFFD] to-[#0071BC] flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-2xl font-bold">{currentBlogPost.author?.charAt(0) || 'A'}</span>
                </div>
              )}
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">About {currentBlogPost.author}</h3>
                <p className="text-gray-600 leading-relaxed mb-4">{currentBlogPost.authorBio}</p>
                <div className="flex items-center gap-4">
                  <button className="text-blue-600 hover:text-blue-700 transition-colors">
                    <Twitter size={20} />
                  </button>
                  <button className="text-blue-600 hover:text-blue-700 transition-colors">
                    <Linkedin size={20} />
                  </button>
                  <button className="text-blue-600 hover:text-blue-700 transition-colors">
                    <Facebook size={20} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Articles */}
      <div className="bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">Related Articles</h2>
          {relatedArticles.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-600">Loading related articles...</p>
            </div>
          )}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {relatedArticles.map((article) => (
              <div 
                key={article.id}
                onClick={() => {
                  console.log('🔗 Related article clicked:', article.title);
                  navigate(`/blog/${article.id}`);
                }}
                className="bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
              >
                {article.image ? (
                  <img 
                    src={article.image} 
                    alt={article.title}
                    className="w-full h-48 object-cover"
                    onError={(e) => {
                      console.error('❌ Related article image failed:', article.image);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                ) : null}
                <div className="w-full h-48 bg-gradient-to-br from-[#E7EFFD] via-[#B8D4F1] to-[#0071BC] flex items-center justify-center" style={{display: article.image ? 'none' : 'flex'}}>
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-2 bg-white/20 rounded-full flex items-center justify-center">
                      <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
                      </svg>
                    </div>
                    <span className="text-white font-medium text-sm">{article.category}</span>
                  </div>
                </div>
                <div className="p-6">
                  <div className="mb-3">
                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {article.category}
                    </span>
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                    {article.title}
                  </h3>
                  <p className="text-sm text-gray-600">{article.readTime}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Newsletter Signup */}
      <div className="bg-gradient-to-r from-blue-600 to-cyan-400">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-white mb-4">Stay Updated</h2>
            <p className="text-xl text-blue-100 mb-8">Get the latest insights delivered to your inbox</p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input 
                type="email" 
                placeholder="Enter your email"
                className="flex-1 px-4 py-3 rounded-lg border-0 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
              <button className="px-6 py-3 bg-white text-blue-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BlogDetail;