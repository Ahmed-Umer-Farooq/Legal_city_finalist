import React, { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Eye } from 'lucide-react';
import api from '../../utils/api';
import RoleUpdater from './RoleUpdater';

const BlogManagement = () => {
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    category: '',
    featured_image: '',
    author_name: ''
  });
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    checkUserAuth();
    fetchBlogs();
  }, []);

  const checkUserAuth = async () => {
    try {
      const token = localStorage.getItem('token');
      console.log('🔑 Token exists:', !!token);
      
      const response = await api.get('/auth/me');
      setUserInfo(response.data);
      console.log('👤 User info:', response.data);
      console.log('🏛️ User role:', response.data?.role);
      console.log('⚖️ Is lawyer:', response.data?.role === 'lawyer');
    } catch (error) {
      console.error('❌ Error fetching user info:', error);
      setUserInfo(null);
    }
  };

  const updateUserRole = async () => {
    try {
      const response = await api.put('/auth/me', { role: 'lawyer' });
      alert('Role updated to lawyer! Please refresh the page.');
      checkUserAuth();
    } catch (error) {
      console.error('Error updating role:', error);
      alert('Failed to update role. You may need admin access.');
    }
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/blogs');
      // Handle different response formats
      const blogData = response.data?.data || response.data || [];
      setBlogs(Array.isArray(blogData) ? blogData : []);
    } catch (error) {
      console.error('Error fetching blogs:', error);
      if (error.response?.status === 403) {
        console.log('Access denied for fetching blogs');
      }
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const uploadThumbnail = async () => {
    if (!selectedFile) return null;
    
    setUploading(true);
    try {
      const uploadFormData = new FormData();
      uploadFormData.append('file', selectedFile);
      
      console.log('📤 Uploading file:', selectedFile.name);
      
      const response = await api.post('/upload/image', uploadFormData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      console.log('✅ Upload successful:', response.data);
      return response.data.url;
    } catch (error) {
      console.error('❌ Upload failed:', error);
      const errorMsg = error.response?.data?.message || 'Failed to upload image';
      alert(`Upload failed: ${errorMsg}`);
      return null;
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Debug info
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');
    console.log('📝 Creating blog with:', { formData, token: !!token, user });
    
    try {
      let blogData = { ...formData };
      
      // Upload thumbnail if selected
      if (selectedFile) {
        console.log('📤 Uploading file before blog creation...');
        const uploadedUrl = await uploadThumbnail();
        if (uploadedUrl) {
          console.log('✅ File uploaded, URL:', uploadedUrl);
          blogData.featured_image = uploadedUrl;
        } else {
          console.log('❌ Upload failed, proceeding without image');
        }
      }
      
      console.log('📝 Creating blog with data:', blogData);
      const response = await api.post('/blogs', blogData);
      console.log('✅ Blog created successfully:', response.data);
      alert('Blog created successfully!');
      setShowCreateForm(false);
      setFormData({ title: '', content: '', category: '', featured_image: '', author_name: '' });
      setSelectedFile(null);
      fetchBlogs();
    } catch (error) {
      console.error('❌ Error creating blog:', error);
      console.log('📊 Response status:', error.response?.status);
      console.log('📊 Response data:', error.response?.data);
      
      const errorMessage = error.response?.data?.message || error.response?.data?.error || 'Failed to create blog';
      if (error.response?.status === 403) {
        alert(`Access denied: ${errorMessage}\n\nMake sure you are logged in as a verified lawyer.`);
      } else if (error.response?.status === 401) {
        alert('Please login again to create blogs.');
      } else if (error.response?.status === 404) {
        alert('Blog endpoint not found. Backend may not be running or endpoint missing.');
      } else {
        alert(`Error ${error.response?.status}: ${errorMessage}`);
      }
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this blog?')) {
      try {
        await api.delete(`/blogs/${id}`);
        alert('Blog deleted successfully!');
        fetchBlogs();
      } catch (error) {
        console.error('Error deleting blog:', error);
        alert('Failed to delete blog. Please try again.');
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Role Issue Warning */}
      {userInfo && userInfo.role !== 'lawyer' && <RoleUpdater />}
      
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Blog Management</h2>
          {userInfo && (
            <div className="text-sm text-gray-600">
              <p>Logged in as: {userInfo.name} ({userInfo.role || 'user'})</p>
              {userInfo.role !== 'lawyer' && (
                <div className="mt-2">
                  <p className="text-red-600">⚠️ Account role is "{userInfo.role}" but needs to be "lawyer"</p>
                  <button
                    onClick={updateUserRole}
                    className="mt-1 px-3 py-1 bg-yellow-500 text-white text-xs rounded hover:bg-yellow-600"
                  >
                    Update Role to Lawyer
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create Blog
        </button>
      </div>

      {/* Create Form */}
      {showCreateForm && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Create New Blog</h3>
          

          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Author Name *</label>
              <input
                type="text"
                name="author_name"
                value={formData.author_name}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter your name as author..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Enter blog title..."
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Blog Thumbnail (Featured Image)</label>
              <div className="space-y-3">
                <div className="flex items-center space-x-4">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    disabled={uploading}
                    className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 disabled:opacity-50"
                  />
                  {uploading && (
                    <span className="text-sm text-blue-600">🔄 Uploading...</span>
                  )}
                  {selectedFile && !uploading && (
                    <span className="text-sm text-green-600">✓ {selectedFile.name}</span>
                  )}
                </div>
                <div className="text-center text-gray-500">OR</div>
                <input
                  type="url"
                  name="featured_image"
                  value={formData.featured_image}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter image URL for blog thumbnail..."
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Upload an image file or enter a URL for your blog thumbnail</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Category</label>
              <select
                name="category"
                value={formData.category}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Select Category</option>
                <option value="Corporate Law">Corporate Law</option>
                <option value="Family Law">Family Law</option>
                <option value="Criminal Law">Criminal Law</option>
                <option value="Real Estate">Real Estate</option>
                <option value="Immigration">Immigration</option>
                <option value="Personal Injury">Personal Injury</option>
                <option value="Tax Law">Tax Law</option>
                <option value="Employment Law">Employment Law</option>
                <option value="Intellectual Property">Intellectual Property</option>
                <option value="General Legal">General Legal</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Content</label>
              <textarea
                name="content"
                value={formData.content}
                onChange={handleInputChange}
                required
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Write your blog content here..."
              />
            </div>
            
            <div className="flex gap-2">
              <button
                type="submit"
                disabled={uploading}
                className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? 'Uploading...' : 'Publish Blog'}
              </button>
              <button
                type="button"
                onClick={() => setShowCreateForm(false)}
                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-md hover:bg-gray-400 transition-colors font-medium"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Blogs List */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="p-6">
          <h3 className="text-lg font-semibold mb-4">Your Blogs</h3>
          {loading ? (
            <p className="text-center text-gray-500">Loading blogs...</p>
          ) : blogs.length === 0 ? (
            <p className="text-center text-gray-500">No blogs found. Create your first blog!</p>
          ) : (
            <div className="space-y-4">
              {blogs.map((blog) => (
                <div key={blog.id} className="border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="text-lg font-semibold text-gray-900">{blog.title}</h4>
                      <p className="text-sm text-gray-600 mb-2">{blog.category}</p>
                      <p className="text-gray-700 line-clamp-2">{blog.content?.substring(0, 150)}...</p>
                      <p className="text-xs text-gray-500 mt-2">
                        Created: {new Date(blog.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <button
                        onClick={() => window.open(`/blog/${blog.id}`, '_blank')}
                        className="p-2 text-blue-600 hover:bg-blue-100 rounded-md transition-colors"
                        title="View Blog"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => alert('Edit functionality coming soon!')}
                        className="p-2 text-green-600 hover:bg-green-100 rounded-md transition-colors"
                        title="Edit Blog"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(blog.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-md transition-colors"
                        title="Delete Blog"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogManagement;