import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Search, ArrowLeft } from 'lucide-react';


// Blog Card Component
const BlogCard = ({ id, image, category, title, author, authorImage, date }) => {
  const navigate = useNavigate();
  const [imageError, setImageError] = useState(false);
  const [authorImageError, setAuthorImageError] = useState(false);
  
  const handleClick = () => {
    console.log('🔗 BlogCard clicked:', { id, title, category });
    console.log('📍 Navigating to:', `/blog/${id}`);
    navigate(`/blog/${id}`);
  };
  
  const getImageSrc = (featuredImage) => {
    if (imageError || !featuredImage) {
      return null; // Will show CSS fallback
    }
    return featuredImage;
  };
  
  const getAuthorImageSrc = (authorImg) => {
    if (authorImageError || !authorImg) {
      return null; // Will show initials fallback
    }
    return authorImg;
  };
  
  const handleImageLoad = () => {
    console.log('✅ Image loaded successfully:', image);
    setImageError(false);
  };
  
  const handleImageError = (e) => {
    console.error('❌ Image failed to load:', image, e);
    setImageError(true);
  };
  
  const handleAuthorImageError = (e) => {
    console.error('❌ Author image failed to load:', authorImage, e);
    setAuthorImageError(true);
  };
  
  return (
    <div 
      onClick={handleClick}
      className="blog-card bg-white rounded-lg border border-[#E8E8EA] p-3 flex flex-col gap-3 hover:shadow-md cursor-pointer"
    >
      {getImageSrc(image) ? (
        <img 
          src={getImageSrc(image)} 
          alt={title || "Blog post"} 
          className="w-full h-48 object-cover rounded-md" 
          onLoad={handleImageLoad}
          onError={handleImageError}
        />
      ) : (
        <div className="w-full h-48 bg-gradient-to-br from-[#E7EFFD] via-[#B8D4F1] to-[#0071BC] rounded-md flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 bg-white/20 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 3a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V5a2 2 0 00-2-2H4zm12 12H4l4-8 3 6 2-4 3 6z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-white font-medium text-sm">{category || 'Legal'} Blog</span>
          </div>
        </div>
      )}
      <div className="flex flex-col gap-3 p-1">
        <div className="flex flex-col gap-2">
          <div className="inline-flex px-2.5 py-1 justify-center items-center rounded-md bg-[rgba(75,107,251,0.05)] self-start">
            <span className="text-[#0082C8] text-sm font-medium">{category}</span>
          </div>
          <h3 className="text-[#181A2A] text-lg font-semibold leading-6 line-clamp-2">
            {title}
          </h3>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            {getAuthorImageSrc(authorImage) ? (
              <img 
                src={getAuthorImageSrc(authorImage)} 
                alt={author} 
                className="w-9 h-9 rounded-full object-cover" 
                onLoad={() => console.log('✅ Author image loaded:', authorImage)}
                onError={handleAuthorImageError}
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-[#E7EFFD] to-[#0071BC] flex items-center justify-center">
                <span className="text-white text-xs font-bold">{author?.charAt(0) || 'A'}</span>
              </div>
            )}
            <span className="text-[#97989F] text-base font-medium">{author}</span>
          </div>
          <span className="text-[#97989F] text-base">{date}</span>
        </div>
      </div>
    </div>
  );
};



// Categories Widget
const CategoriesWidget = ({ onCategoryClick, selectedCategory }) => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Real API call to your backend
        const response = await fetch('/api/blogs/categories');
        const data = await response.json();
        console.log('📊 Categories API response:', data);
        setCategories(data || []);
      } catch (error) {
        console.error('❌ Failed to fetch categories:', error);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="h-14 bg-gradient-to-b from-[#0071BC] to-[#00D2FF] flex items-center px-4">
          <h2 className="text-white text-xl font-semibold capitalize">Categories</h2>
        </div>
        <div className="p-4">
          <div className="animate-pulse space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-4 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-widget">
      <div className="h-12 bg-gradient-to-b from-[#0071BC] to-[#00D2FF] flex items-center px-4">
        <h2 className="text-white text-lg font-semibold capitalize">Categories</h2>
      </div>
      <div className="compact-padding">
        {categories && categories.length > 0 ? categories.map((category, index) => (
          <div key={index}>
            <button 
              onClick={() => onCategoryClick(category.name)}
              className={`w-full flex justify-between items-center py-3 hover:bg-gray-50 transition-colors ${
                selectedCategory === category.name ? 'bg-blue-50 text-blue-600' : ''
              }`}
            >
              <span className="text-[15px] font-medium capitalize">{category.name}</span>
              <span className="text-[15px] font-medium">{category.count?.toString().padStart(2, '0') || '00'}</span>
            </button>
            {index < categories.length - 1 && <div className="h-px bg-[#D1E7E5]"></div>}
          </div>
        )) : (
          <div className="p-4 text-center text-gray-500">
            No categories available
          </div>
        )}
      </div>
    </div>
  );
};

// Top Authors Widget
const TopAuthorsWidget = () => {
  const [authors, setAuthors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTopAuthors = async () => {
      try {
        // Real API call to your backend
        const response = await fetch('/api/blogs/top-authors');
        const data = await response.json();
        console.log('📊 Top authors API response:', data);
        setAuthors(data || []);
      } catch (error) {
        console.error('❌ Failed to fetch top authors:', error);
        setAuthors([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTopAuthors();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="h-14 bg-gradient-to-b from-[#0071BC] to-[#00D2FF] flex items-center px-4">
          <h2 className="text-white text-xl font-semibold capitalize">top authors</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex gap-6">
                <div className="w-[73px] h-[73px] bg-gray-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-full"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-widget">
      <div className="h-12 bg-gradient-to-b from-[#0071BC] to-[#00D2FF] flex items-center px-4">
        <h2 className="text-white text-lg font-semibold capitalize">top authors</h2>
      </div>
      <div className="compact-padding flex flex-col compact-spacing">
        {authors.map((author) => (
          <div key={author.id} className="flex gap-3">
            {author.profile_image ? (
              <img 
                src={author.profile_image} 
                alt={author.name} 
                className="w-12 h-12 rounded-full object-cover flex-shrink-0"
                onError={(e) => {
                  console.error('❌ Top author image failed:', author.profile_image);
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[#E7EFFD] to-[#0071BC] flex items-center justify-center flex-shrink-0" style={{display: author.profile_image ? 'none' : 'flex'}}>
              <span className="text-white text-sm font-bold">{author.name?.charAt(0) || 'A'}</span>
            </div>
            <div className="flex-1">
              <h3 className="text-[#222] text-sm font-semibold capitalize mb-1">{author.name}</h3>
              <p className="text-[#666] text-xs font-light leading-[150%] capitalize mb-2">
                {author.bio || `${author.post_count} articles`}
              </p>
              <div className="flex items-center gap-2">
                <span className="text-[#0071BC] text-xs font-medium">{author.post_count} Posts</span>
                <div className="flex gap-1.5">
                  {[...Array(Math.min(author.post_count, 5))].map((_, i) => (
                    <div key={i} className="w-[18px] h-[18px] rounded-sm border border-[#C4C4C4] bg-gradient-to-b from-[#0071BC] to-[#00D2FF]"></div>
                  ))}
                  {[...Array(Math.max(0, 5 - author.post_count))].map((_, i) => (
                    <div key={i} className="w-[18px] h-[18px] rounded-sm border border-[#C4C4C4]"></div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Tags Widget
const TagsWidget = ({ onTagClick, selectedTag }) => {
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTags = async () => {
      try {
        // Real API call to your backend
        const response = await fetch('/api/blogs/tags');
        const data = await response.json();
        console.log('📊 Tags API response:', data);
        setTags(data || []);
      } catch (error) {
        console.error('❌ Failed to fetch tags:', error);
        setTags([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTags();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="h-14 bg-gradient-to-b from-[#0071BC] to-[#00D2FF] flex items-center px-4">
          <h2 className="text-white text-xl font-semibold capitalize">Search with tags</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse flex flex-wrap gap-3">
            {[...Array(9)].map((_, i) => (
              <div key={i} className="h-8 w-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-widget">
      <div className="h-12 bg-gradient-to-b from-[#0071BC] to-[#00D2FF] flex items-center px-4">
        <h2 className="text-white text-lg font-semibold capitalize">Search with tags</h2>
      </div>
      <div className="compact-padding">
        <div className="flex flex-wrap gap-2">
          {tags.map((tag, index) => (
            <button
              key={index}
              onClick={() => onTagClick(tag.name)}
              className={`px-5 py-2.5 rounded text-[15px] capitalize transition-all ${
                selectedTag === tag.name
                  ? 'border-transparent bg-gradient-to-b from-[#0071BC] to-[#00D2FF] text-white'
                  : 'border border-[#C4C4C4] text-[#666] hover:border-[#0071BC]'
              }`}
            >
              {tag.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

// Popular Posts Widget
const PopularPostsWidget = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPopularPosts = async () => {
      try {
        // Real API call to your backend
        const response = await fetch('/api/blogs/popular');
        const data = await response.json();
        console.log('📊 Popular posts API response:', data);
        setPosts(data || []);
      } catch (error) {
        console.error('❌ Failed to fetch popular posts:', error);
        setPosts([]);
      } finally {
        setLoading(false);
      }
    };

    fetchPopularPosts();
  }, []);

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-md overflow-hidden">
        <div className="h-14 bg-gradient-to-b from-[#0071BC] to-[#00D2FF] flex items-center px-4">
          <h2 className="text-white text-xl font-semibold capitalize">Popular posted</h2>
        </div>
        <div className="p-6">
          <div className="animate-pulse space-y-6">
            {[...Array(2)].map((_, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-28 h-[100px] bg-gray-200 rounded"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-3 bg-gray-200 rounded w-1/4"></div>
                  <div className="h-4 bg-gray-200 rounded w-full"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="sidebar-widget">
      <div className="h-12 bg-gradient-to-b from-[#0071BC] to-[#00D2FF] flex items-center px-4">
        <h2 className="text-white text-lg font-semibold capitalize">Popular posted</h2>
      </div>
      <div className="compact-padding flex flex-col compact-spacing">
        {posts.map((post) => (
          <div key={post.id} className="flex gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded transition-colors">
            {post.featured_image ? (
              <img 
                src={post.featured_image} 
                alt={post.title || "Popular post"} 
                className="w-20 h-16 rounded object-cover flex-shrink-0"
                onError={(e) => {
                  console.error('❌ Popular post image failed:', post.featured_image);
                  e.target.style.display = 'none';
                  e.target.nextSibling.style.display = 'flex';
                }}
              />
            ) : null}
            <div className="w-20 h-16 rounded bg-gradient-to-br from-[#E7EFFD] to-[#0071BC]/20 flex items-center justify-center flex-shrink-0" style={{display: post.featured_image ? 'none' : 'flex'}}>
              <span className="text-[#0071BC] text-xs font-medium">No Image</span>
            </div>
            <div className="flex-1 flex flex-col">
              <div className="inline-flex px-1.5 py-1 rounded bg-[#F6F8FF] self-start mb-2">
                <span className="text-[#666] text-[10px] capitalize">{post.category}</span>
              </div>
              <h4 className="text-[#222] text-sm font-medium leading-[150%] capitalize mb-auto line-clamp-2">
                {post.title}
              </h4>
              <div className="flex items-center gap-2 mt-2">
                <div className="w-4 h-4 rounded-full bg-gray-300"></div>
                <span className="text-[#777] text-[10px] capitalize">{post.author_name}</span>
                <div className="w-2.5 h-px bg-[#999]"></div>
                <span className="text-[#777] text-[10px]">{post.views_count} views</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};



// Main Blog Component
const Blog = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [blogPosts, setBlogPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Check if coming from user dashboard or admin dashboard
  const fromUserDashboard = location.state?.from === 'user-dashboard';
  const fromAdminDashboard = location.pathname === '/admin-blogs';

  // Fetch blogs from your backend
  useEffect(() => {
    const fetchBlogs = async () => {
      try {
        setLoading(true);
        console.log('🔄 Fetching blogs from:', 'http://localhost:5001/api/blogs');
        
        // Use relative URL due to proxy configuration
        const response = await fetch('/api/blogs', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        });
        console.log('📡 Response status:', response.status, response.statusText);
        
        if (!response.ok) {
          const errorText = await response.text();
          console.error('❌ API Error Response:', errorText);
          throw new Error(`HTTP error! status: ${response.status} - ${errorText}`);
        }
        
        const data = await response.json();
        console.log('📊 Backend blogs response:', data);
        console.log('📊 Response type:', typeof data, 'Is array:', Array.isArray(data));
        
        // Backend now returns array directly
        if (!Array.isArray(data)) {
          console.error('Expected array but got:', typeof data, data);
          throw new Error('Invalid data format from server');
        }
        
        // Transform your database data to match frontend format
        const transformedBlogs = data.map(blog => ({
          id: blog.id,
          title: blog.title,
          excerpt: blog.excerpt,
          image: blog.featured_image,
          category: blog.category || 'General',
          author: blog.author_name || 'Unknown Author',
          authorImage: blog.author_image,
          date: new Date(blog.published_at).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long', 
            day: 'numeric'
          }),
          slug: blog.slug,
          tags: blog.tags ? JSON.parse(blog.tags) : [],
          views: blog.views_count
        }));
        
        console.log('✅ Transformed blogs:', transformedBlogs);
        setBlogPosts(transformedBlogs);
        setError(null); // Clear any previous errors
      } catch (err) {
        console.error('❌ Error fetching blogs:', err);
        console.error('❌ Error details:', err.message, err.stack);
        setError(`Failed to load blogs: ${err.message}`);
      } finally {
        setLoading(false);
      }
    };

    fetchBlogs();
  }, []);

  // Fallback mock data for testing (remove after backend is connected)
  const mockBlogPosts = useMemo(() => [
    {
      id: 1,
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=720&h=400&fit=crop",
      category: "Legal",
      title: "Understanding Your Rights: A Comprehensive Guide to Legal Protection",
      author: "Sarah Johnson",
      authorImage: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=72&h=72&fit=crop&crop=face",
      date: "December 15, 2024"
    },
    {
      id: 2,
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=720&h=400&fit=crop",
      category: "Business Law",
      title: "Corporate Compliance: Essential Guidelines for Modern Businesses",
      author: "Michael Chen",
      authorImage: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=72&h=72&fit=crop&crop=face",
      date: "December 12, 2024"
    },
    {
      id: 3,
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=720&h=400&fit=crop",
      category: "Family Law",
      title: "Navigating Divorce Proceedings: What You Need to Know",
      author: "Emily Rodriguez",
      authorImage: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=72&h=72&fit=crop&crop=face",
      date: "December 10, 2024"
    },
    {
      id: 4,
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=720&h=400&fit=crop",
      category: "Criminal Law",
      title: "Your Rights During Police Encounters: A Legal Perspective",
      author: "David Thompson",
      authorImage: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=72&h=72&fit=crop&crop=face",
      date: "December 8, 2024"
    },
    {
      id: 5,
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=720&h=400&fit=crop",
      category: "Real Estate",
      title: "Property Law Essentials: Buying and Selling Real Estate Safely",
      author: "Lisa Wang",
      authorImage: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=72&h=72&fit=crop&crop=face",
      date: "December 5, 2024"
    },
    {
      id: 6,
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=720&h=400&fit=crop",
      category: "Immigration",
      title: "Immigration Law Updates: Recent Changes and Their Impact",
      author: "Carlos Martinez",
      authorImage: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=72&h=72&fit=crop&crop=face",
      date: "December 3, 2024"
    }
  ], []);

  // Use real data if available, otherwise fallback to mock data
  const currentBlogPosts = blogPosts.length > 0 ? blogPosts : mockBlogPosts;

  // Filter posts based on search term and category
  useEffect(() => {
    console.log('🔍 Filtering posts with:', { searchTerm, selectedCategory, totalPosts: currentBlogPosts.length });
    let filtered = currentBlogPosts;
    
    if (searchTerm) {
      filtered = filtered.filter(post => 
        post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
        post.category.toLowerCase().includes(searchTerm.toLowerCase())
      );
      console.log('🔍 After search filter:', filtered.length, 'posts');
    }
    
    if (selectedCategory) {
      filtered = filtered.filter(post => 
        post.category.toLowerCase() === selectedCategory.toLowerCase()
      );
      console.log('📁 After category filter:', filtered.length, 'posts');
    }
    
    console.log('✅ Final filtered posts:', filtered.length);
    setFilteredPosts(filtered);
  }, [searchTerm, selectedCategory, currentBlogPosts]);

  const handleSearch = () => {
    console.log('🔍 Search button clicked, current term:', searchTerm);
    // Search is handled by useEffect
  };

  const handleCategoryClick = (category) => {
    console.log('📁 Category clicked:', category, 'Previous:', selectedCategory);
    const newCategory = category === selectedCategory ? '' : category;
    console.log('📁 Setting category to:', newCategory);
    setSelectedCategory(newCategory);
  };

  const handleTagClick = (tag) => {
    console.log('🏷️ Tag clicked:', tag, 'Previous:', selectedTag);
    const newTag = tag === selectedTag ? '' : tag;
    const newSearchTerm = tag === selectedTag ? '' : tag;
    console.log('🏷️ Setting tag to:', newTag, 'Search term to:', newSearchTerm);
    setSelectedTag(newTag);
    setSearchTerm(newSearchTerm);
  };

  const displayPosts = filteredPosts.length > 0 ? filteredPosts : currentBlogPosts;


  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-[#E7EFFD]">
        <div className="w-full bg-[#E7EFFD] px-4 sm:px-6 md:px-12 lg:px-[244px] pt-8 pb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 sm:gap-6 max-w-2xl">
            <div className="relative flex-1">
              <div className="w-full h-[38px] bg-gray-200 animate-pulse rounded-md"></div>
            </div>
            <div className="h-[38px] w-32 bg-gray-200 animate-pulse rounded-md"></div>
          </div>
        </div>
        <section className="w-full px-4 md:px-8 lg:px-28 py-16 md:py-24">
          <div className="max-w-[1216px] mx-auto">
            <div className="flex flex-col lg:flex-row gap-8">
              <div className="flex-1">
                <div className="h-8 w-48 bg-gray-200 animate-pulse rounded mb-8"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
                      <div className="w-full h-60 bg-gray-200 rounded-md mb-4"></div>
                      <div className="space-y-3">
                        <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                        <div className="h-6 bg-gray-200 rounded w-full"></div>
                        <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-[#E7EFFD] flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Failed to Load Blogs</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >Try Again</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#E7EFFD]">
      {/* Back to Dashboard Header */}
      {fromUserDashboard && (
        <div className="w-full bg-white border-b border-gray-200 px-4 sm:px-6 md:px-12 lg:px-[244px] py-4">
          <button
            onClick={() => navigate('/user-dashboard')}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to User Dashboard</span>
          </button>
        </div>
      )}
      
      {fromAdminDashboard && (
        <div className="w-full bg-white border-b border-gray-200 px-4 sm:px-6 md:px-12 lg:px-[244px] py-4">
          <button
            onClick={() => navigate('/admin-dashboard')}
            className="flex items-center gap-2 text-red-600 hover:text-red-800 transition-colors"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Back to Admin Dashboard</span>
          </button>
        </div>
      )}
      
      {/* Blog Search Section */}
      <div className="w-full bg-[#E7EFFD] px-4 sm:px-6 md:px-12 lg:px-24 py-4">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6 sm:gap-6 max-w-2xl">
          <div className="relative flex-1">
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => {
                console.log('✏️ Search input changed:', e.target.value);
                setSearchTerm(e.target.value);
              }}
              className="w-full h-[38px] pl-4 pr-3 py-2.5 border border-[#CCC] bg-white text-base font-inter placeholder:text-gray-500 rounded-md"
            />
          </div>
          <button 
            onClick={() => {
              console.log('🔍 Search button clicked');
              handleSearch();
            }}
            className="h-[38px] px-6 bg-gradient-to-b from-[#0071BC] to-[#00D2FF] text-white font-inter text-sm font-normal leading-[22.5px] hover:opacity-90 transition-opacity whitespace-nowrap rounded-md"
          >
            Search Blogs
          </button>
        </div>
      </div>

      <section className="w-full px-4 md:px-8 lg:px-24 py-6">
        <div className="blog-container">
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Blog Posts */}
            <div className="blog-main flex-1">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-[#181A2A] text-2xl font-bold">Latest Blogs</h2>
                {/* LawyerActions removed - using existing dashboard */}
              </div>
              
              <div className="blog-grid grid grid-cols-1 gap-4 mb-6">
                {displayPosts.map((post, index) => (
                  <BlogCard key={index} {...post} />
                ))}
              </div>
              
              {displayPosts.length === 0 && searchTerm && (
                <div className="text-center py-8">
                  <p className="text-gray-600">No blogs found matching "{searchTerm}"</p>
                </div>
              )}

              <div className="flex justify-center">
                <button 
                  onClick={() => console.log('📜 View All Blogs clicked')}
                  className="px-5 py-3 rounded-md border border-[#696A75]/30 text-[#696A75] text-base font-medium hover:bg-gray-50 transition-colors"
                >
                  View All Blogs
                </button>
              </div>
            </div>

            {/* Right Sidebar */}
            <aside className="blog-sidebar w-full lg:w-[320px] flex-shrink-0">
              <div className="sidebar-sticky flex flex-col gap-4">
                <CategoriesWidget 
                  onCategoryClick={handleCategoryClick} 
                  selectedCategory={selectedCategory} 
                />
                <TopAuthorsWidget />
                <TagsWidget 
                  onTagClick={handleTagClick} 
                  selectedTag={selectedTag} 
                />
                <PopularPostsWidget />
              </div>
            </aside>
          </div>
        </div>
      </section>


    </div>
  );
};

export default Blog;