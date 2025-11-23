import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Search } from 'lucide-react';

const Blog = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [blogs] = useState([
    {
      id: 1,
      title: "Understanding Your Rights: A Comprehensive Guide to Legal Protection",
      category: "Legal",
      author: "Sarah Johnson",
      date: "December 15, 2024",
      image: "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?w=400&h=250&fit=crop"
    },
    {
      id: 2,
      title: "Corporate Compliance: Essential Guidelines for Modern Businesses",
      category: "Business Law",
      author: "Michael Chen",
      date: "December 12, 2024",
      image: "https://images.unsplash.com/photo-1521791136064-7986c2920216?w=400&h=250&fit=crop"
    },
    {
      id: 3,
      title: "Navigating Divorce Proceedings: What You Need to Know",
      category: "Family Law",
      author: "Emily Rodriguez",
      date: "December 10, 2024",
      image: "https://images.unsplash.com/photo-1450101499163-c8848c66ca85?w=400&h=250&fit=crop"
    },
    {
      id: 4,
      title: "Your Rights During Police Encounters: A Legal Perspective",
      category: "Criminal Law",
      author: "David Thompson",
      date: "December 8, 2024",
      image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=250&fit=crop"
    },
    {
      id: 5,
      title: "Property Law Essentials: Buying and Selling Real Estate Safely",
      category: "Real Estate",
      author: "Lisa Wang",
      date: "December 5, 2024",
      image: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop"
    },
    {
      id: 6,
      title: "Immigration Law Updates: Recent Changes and Their Impact",
      category: "Immigration",
      author: "Carlos Martinez",
      date: "December 3, 2024",
      image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=400&h=250&fit=crop"
    }
  ]);

  const filteredBlogs = blogs.filter(blog =>
    blog.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    blog.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link 
          to="/user-dashboard"
          className="text-blue-600 hover:text-blue-800 font-medium"
        >
          Back to Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-blue-800">Legal City</h1>
      </div>

      {/* Search Section */}
      <div className="bg-white rounded-lg border border-gray-100 p-4">
        <div className="flex gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search blogs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
          <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
            Search Blogs
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-3">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Latest Blogs</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {filteredBlogs.map(blog => (
              <div key={blog.id} className="bg-white rounded-lg border border-gray-100 overflow-hidden hover:shadow-md transition-shadow">
                <img 
                  src={blog.image} 
                  alt={blog.title}
                  className="w-full h-48 object-cover"
                />
                <div className="p-4">
                  <span className="inline-block px-2 py-1 text-xs bg-blue-100 text-blue-800 rounded-full mb-2">
                    {blog.category}
                  </span>
                  <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">{blog.title}</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <span>{blog.author}</span>
                    <span>•</span>
                    <span>{blog.date}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center">
            <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
              View All Blogs
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Categories */}
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4">
              <h3 className="text-white font-semibold">Categories</h3>
            </div>
            <div className="p-4">
              <p className="text-gray-500 text-sm">No categories available</p>
            </div>
          </div>

          {/* Top Authors */}
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4">
              <h3 className="text-white font-semibold">Top Authors</h3>
            </div>
            <div className="p-4 space-y-4">
              {['Sarah Johnson', 'Michael Chen', 'Emily Rodriguez'].map((author, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">{author.charAt(0)}</span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 text-sm">{author}</p>
                    <p className="text-xs text-gray-500">{Math.floor(Math.random() * 10) + 1} posts</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Search with Tags */}
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4">
              <h3 className="text-white font-semibold">Search with Tags</h3>
            </div>
            <div className="p-4">
              <div className="flex flex-wrap gap-2">
                {['Legal Rights', 'Business', 'Family Law', 'Criminal', 'Real Estate', 'Immigration'].map((tag, index) => (
                  <button 
                    key={index}
                    className="px-3 py-1 text-sm border border-gray-300 rounded-full hover:bg-blue-50 hover:border-blue-300 transition-colors"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Popular Posts */}
          <div className="bg-white rounded-lg border border-gray-100 overflow-hidden">
            <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-4">
              <h3 className="text-white font-semibold">Popular Posts</h3>
            </div>
            <div className="p-4 space-y-4">
              {filteredBlogs.slice(0, 3).map(blog => (
                <div key={blog.id} className="flex gap-3">
                  <img 
                    src={blog.image} 
                    alt={blog.title}
                    className="w-16 h-12 object-cover rounded"
                  />
                  <div className="flex-1">
                    <h4 className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">{blog.title}</h4>
                    <p className="text-xs text-gray-500">{blog.author}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Blog;