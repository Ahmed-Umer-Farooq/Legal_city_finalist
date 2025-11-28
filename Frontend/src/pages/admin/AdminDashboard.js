import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
  Users, UserCheck, UserX, Briefcase, CheckCircle, 
  XCircle, Trash2, Shield, ShieldOff, RefreshCw,
  TrendingUp, Activity, Clock, Search, ChevronLeft, ChevronRight,
  FileText, Eye, Edit, MessageCircle
} from 'lucide-react';

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center p-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
  </div>
);

const AdminDashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Dashboard stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalLawyers: 0,
    verifiedLawyers: 0,
    unverifiedLawyers: 0,
    totalBlogs: 0,
    publishedBlogs: 0,
    draftBlogs: 0,
    totalComments: 0
  });
  const [recentUsers, setRecentUsers] = useState([]);
  const [recentLawyers, setRecentLawyers] = useState([]);
  
  // Users management
  const [users, setUsers] = useState([]);
  const [usersPagination, setUsersPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [usersSearch, setUsersSearch] = useState('');
  const [usersFilter, setUsersFilter] = useState('all');
  
  // Lawyers management
  const [lawyers, setLawyers] = useState([]);
  const [lawyersPagination, setLawyersPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [lawyersSearch, setLawyersSearch] = useState('');
  const [lawyersFilter, setLawyersFilter] = useState('all');
  
  // Activity logs
  const [activityLogs, setActivityLogs] = useState([]);
  const [logsPagination, setLogsPagination] = useState({ page: 1, limit: 20, total: 0 });
  
  // Blog management
  const [blogs, setBlogs] = useState([]);
  const [blogsPagination, setBlogsPagination] = useState({ page: 1, limit: 10, total: 0 });
  const [blogsSearch, setBlogsSearch] = useState('');
  const [blogsFilter, setBlogsFilter] = useState('all');
  const [selectedBlogForComments, setSelectedBlogForComments] = useState(null);
  const [blogComments, setBlogComments] = useState([]);
  const [loadingComments, setLoadingComments] = useState(false);

  // Auto-refresh interval (every 30 seconds)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshData();
    }, 30000);
    
    return () => clearInterval(interval);
  }, [activeTab]);

  // Initial load
  useEffect(() => {
    if (activeTab === 'dashboard') {
      fetchDashboardStats();
    } else if (activeTab === 'users') {
      fetchUsers();
    } else if (activeTab === 'lawyers') {
      fetchLawyers();
    } else if (activeTab === 'activity') {
      fetchActivityLogs();
    } else if (activeTab === 'blogs') {
      fetchBlogs();
    }
  }, [activeTab, usersPagination.page, lawyersPagination.page, logsPagination.page]);

  const refreshData = async () => {
    setRefreshing(true);
    if (activeTab === 'dashboard') {
      await fetchDashboardStats();
    } else if (activeTab === 'users') {
      await fetchUsers();
    } else if (activeTab === 'lawyers') {
      await fetchLawyers();
    } else if (activeTab === 'activity') {
      await fetchActivityLogs();
    } else if (activeTab === 'blogs') {
      await fetchBlogs();
    }
    setRefreshing(false);
  };

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      
      // Fetch multiple endpoints for comprehensive stats
      const [usersRes, lawyersRes, blogsRes] = await Promise.all([
        api.get('/admin/users').catch(() => ({ data: { users: [] } })),
        api.get('/admin/lawyers').catch(() => ({ data: { lawyers: [] } })),
        api.get('/blogs').catch(() => ({ data: [] }))
      ]);
      
      const users = usersRes.data?.users || [];
      const lawyers = lawyersRes.data?.lawyers || [];
      const blogs = Array.isArray(blogsRes.data) ? blogsRes.data : blogsRes.data?.data || [];
      
      const verifiedLawyers = lawyers.filter(l => l.lawyer_verified || l.is_verified || l.verified).length;
      const publishedBlogs = blogs.filter(b => b.status === 'published').length;
      const draftBlogs = blogs.filter(b => b.status === 'draft').length;
      
      setStats({
        totalUsers: users.length,
        totalLawyers: lawyers.length,
        verifiedLawyers,
        unverifiedLawyers: lawyers.length - verifiedLawyers,
        totalBlogs: blogs.length,
        publishedBlogs,
        draftBlogs,
        totalComments: blogs.reduce((sum, blog) => sum + (parseInt(blog.comment_count) || 0), 0)
      });
      
      setRecentUsers(users.slice(0, 5));
      setRecentLawyers(lawyers.slice(0, 5));
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      setStats({ totalUsers: 0, totalLawyers: 0, verifiedLawyers: 0, unverifiedLawyers: 0, totalBlogs: 0, publishedBlogs: 0, draftBlogs: 0, totalComments: 0 });
      setRecentUsers([]);
      setRecentLawyers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/users', {
        params: {
          page: usersPagination.page,
          limit: usersPagination.limit,
          search: usersSearch,
          role: usersFilter === 'all' ? undefined : usersFilter === 'admin' ? 'admin' : 'user'
        }
      });
      setUsers(response.data?.users || []);
      setUsersPagination(prev => ({ ...prev, ...response.data?.pagination }));
    } catch (error) {
      console.error('Admin users API not available');
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchLawyers = async () => {
    try {
      setLoading(true);
      const response = await api.get('/admin/lawyers', {
        params: {
          page: lawyersPagination.page,
          limit: lawyersPagination.limit,
          search: lawyersSearch,
          verified: lawyersFilter === 'all' ? undefined : lawyersFilter === 'verified'
        }
      });
      setLawyers(response.data?.lawyers || []);
      setLawyersPagination(prev => ({ ...prev, ...response.data?.pagination }));
    } catch (error) {
      console.error('Admin lawyers API not available');
      setLawyers([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    setLoading(true);
    try {
      // Get recent chat activity
      const chatResponse = await api.get('/chat/conversations').catch(() => ({ data: [] }));
      const conversations = chatResponse.data || [];
      
      const chatLogs = conversations.slice(0, 3).map(conv => ({
        id: `chat-${conv.partner_id}`,
        event: 'Message Activity',
        user: conv.partner_email || conv.partner_name,
        timestamp: new Date(conv.last_message_time).toLocaleDateString(),
        status: 'success'
      }));

      const logs = [
        ...chatLogs,
        ...recentUsers.slice(0, 2).map((user) => ({
          id: `user-${user.id}`,
          event: 'User Registration',
          user: user.email,
          timestamp: new Date(user.created_at).toLocaleDateString(),
          status: user.is_verified ? 'success' : 'pending'
        })),
        ...recentLawyers.slice(0, 2).map((lawyer) => ({
          id: `lawyer-${lawyer.id}`,
          event: lawyer.is_verified ? 'Lawyer Verified' : 'Lawyer Registration',
          user: lawyer.email,
          timestamp: new Date(lawyer.created_at).toLocaleDateString(),
          status: lawyer.is_verified ? 'success' : 'pending'
        }))
      ].slice(0, 8);
      
      setActivityLogs(logs);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
    setLoading(false);
  };

  const fetchBlogs = async () => {
    try {
      setLoading(true);
      const response = await api.get('/blogs', {
        params: {
          page: blogsPagination.page,
          limit: blogsPagination.limit,
          search: blogsSearch,
          status: blogsFilter === 'all' ? undefined : blogsFilter
        }
      });
      setBlogs(Array.isArray(response.data) ? response.data : response.data?.data || []);
      setBlogsPagination(prev => ({ ...prev, total: response.data?.length || 0 }));
    } catch (error) {
      console.error('Blogs API not available');
      setBlogs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyLawyer = async (lawyerId) => {
    try {
      await api.put(`/admin/verify-lawyer/${lawyerId}`);
      alert('Lawyer verified successfully');
      refreshData();
    } catch (error) {
      alert('Failed to verify lawyer');
    }
  };

  const handleRejectLawyer = async (lawyerId) => {
    if (!window.confirm('Are you sure you want to reject this lawyer?')) return;
    
    try {
      await api.put(`/admin/reject-lawyer/${lawyerId}`, {
        reason: 'Rejected by admin'
      });
      alert('Lawyer verification rejected');
      refreshData();
    } catch (error) {
      alert('Failed to reject lawyer');
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    
    try {
      await api.delete(`/admin/users/${userId}`);
      alert('User deleted successfully');
      refreshData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to delete user');
    }
  };

  const handleDeleteLawyer = async (lawyerId) => {
    if (!window.confirm('Are you sure you want to delete this lawyer?')) return;
    
    try {
      await api.delete(`/admin/lawyers/${lawyerId}`);
      alert('Lawyer deleted successfully');
      refreshData();
    } catch (error) {
      alert('Failed to delete lawyer');
    }
  };

  const handleMakeAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to grant admin access to this user?')) return;
    
    try {
      await api.put(`/admin/users/${userId}/make-admin`);
      alert('Admin access granted successfully');
      refreshData();
    } catch (error) {
      alert('Failed to grant admin access');
    }
  };

  const handleRemoveAdmin = async (userId) => {
    if (!window.confirm('Are you sure you want to remove admin access?')) return;
    
    try {
      await api.put(`/admin/users/${userId}/remove-admin`);
      alert('Admin access removed successfully');
      refreshData();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to remove admin access');
    }
  };

  const handleDeleteBlog = async (blogId) => {
    if (!window.confirm('Are you sure you want to delete this blog?')) return;
    
    try {
      await api.delete(`/blogs/${blogId}`);
      alert('Blog deleted successfully');
      refreshData();
    } catch (error) {
      alert('Failed to delete blog');
    }
  };
  
  const handleViewBlogComments = async (blog) => {
    setSelectedBlogForComments(blog);
    setLoadingComments(true);
    try {
      const response = await api.get(`/blogs/${blog.id}/comments`);
      setBlogComments(response.data || []);
    } catch (error) {
      console.error('Error fetching blog comments:', error);
      setBlogComments([]);
    } finally {
      setLoadingComments(false);
    }
  };
  
  const handleDeleteComment = async (commentId) => {
    if (!window.confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      await api.delete(`/blogs/comments/${commentId}/moderate`);
      alert('Comment deleted successfully');
      // Refresh comments
      if (selectedBlogForComments) {
        handleViewBlogComments(selectedBlogForComments);
      }
    } catch (error) {
      alert('Failed to delete comment');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Dashboard Stats View
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Total Users</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{stats.totalUsers.toLocaleString()}</div>
              <div className="text-xs text-green-600 mt-1">↗ +12% from last month</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Briefcase className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Total Lawyers</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{stats.totalLawyers.toLocaleString()}</div>
              <div className="text-xs text-green-600 mt-1">↗ +8% from last month</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Verified Lawyers</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{stats.verifiedLawyers.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">{Math.round((stats.verifiedLawyers/stats.totalLawyers)*100)}% of total</div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Clock className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Pending Review</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{stats.unverifiedLawyers.toLocaleString()}</div>
              <div className="text-xs text-amber-600 mt-1">Requires attention</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Message Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Total Messages</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{allMessages.length.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Platform communication</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Users className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Active Conversations</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{Math.ceil(allMessages.length / 3)}</div>
              <div className="text-xs text-green-600 mt-1">User-Lawyer chats</div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Content Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <FileText className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Total Articles</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{stats.totalBlogs.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">Content library</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Published</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{stats.publishedBlogs.toLocaleString()}</div>
              <div className="text-xs text-green-600 mt-1">Live content</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Edit className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Drafts</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{stats.draftBlogs.toLocaleString()}</div>
              <div className="text-xs text-amber-600 mt-1">In progress</div>
            </div>
          </div>
        </div>
        
        <div className="bg-white border border-gray-200 rounded-lg p-5 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <MessageCircle className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-600">Comments</span>
              </div>
              <div className="text-2xl font-semibold text-gray-900">{stats.totalComments.toLocaleString()}</div>
              <div className="text-xs text-gray-500 mt-1">User engagement</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 flex items-center">
              <Users className="w-4 h-4 mr-2 text-gray-500" />
              Recent Users
            </h3>
          </div>
          <div className="p-6">
            {recentUsers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent users</p>
            ) : (
              <div className="space-y-4">
                {recentUsers.map(user => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Verified Users */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 flex items-center">
              <CheckCircle className="w-4 h-4 mr-2 text-gray-500" />
              Verified Users
            </h3>
          </div>
          <div className="p-6">
            {recentUsers.filter(user => user.verified || user.is_verified || user.status === 'verified').length === 0 ? (
              <p className="text-gray-500 text-center py-4">No verified users</p>
            ) : (
              <div className="space-y-4">
                {recentUsers.filter(user => user.verified || user.is_verified || user.status === 'verified').map(user => (
                  <div key={user.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{user.name}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                    <span className="text-xs text-gray-400">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Lawyers */}
        <div className="bg-white border border-gray-200 rounded-lg">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-semibold text-gray-900 flex items-center">
              <Briefcase className="w-4 h-4 mr-2 text-gray-500" />
              Recent Lawyers
            </h3>
          </div>
          <div className="p-6">
            {recentLawyers.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent lawyers</p>
            ) : (
              <div className="space-y-4">
                {recentLawyers.map(lawyer => (
                  <div key={lawyer.id} className="flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-900">{lawyer.name}</p>
                      <p className="text-sm text-gray-500">{lawyer.email}</p>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      lawyer.lawyer_verified || lawyer.is_verified || lawyer.verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {lawyer.lawyer_verified || lawyer.is_verified || lawyer.verified ? 'Verified' : 'Pending'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  // Users Management View
  const renderUsers = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-gray-900">User Management</h3>
          <div className="flex items-center space-x-4">
            <select
              value={usersFilter}
              onChange={(e) => {
                setUsersFilter(e.target.value);
                setUsersPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Users</option>
              <option value="admin">Admin Users</option>
              <option value="user">Regular Users</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search users..."
                value={usersSearch}
                onChange={(e) => setUsersSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchUsers()}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={fetchUsers}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Phone</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Joined</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  No users found
                </td>
              </tr>
            ) : (
              users.map(user => (
                <tr key={user.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{user.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{user.name || 'Not provided'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{user.mobile_number || 'Not provided'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.is_admin || user.role === 'admin'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}>
                      {user.is_admin || user.role === 'admin' ? 'Admin' : 'User'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      user.verified || user.is_verified || user.status === 'verified'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {user.verified || user.is_verified || user.status === 'verified' ? 'Verified' : 'Active'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      {!(user.is_admin || user.role === 'admin') && (
                        <button
                          onClick={() => handleMakeAdmin(user.id)}
                          className="p-1 text-purple-600 hover:text-purple-800"
                          title="Make Admin"
                        >
                          <Shield className="w-4 h-4" />
                        </button>
                      )}
                      {(user.is_admin || user.role === 'admin') && user.id !== user.id && (
                        <button
                          onClick={() => handleRemoveAdmin(user.id)}
                          className="p-1 text-orange-600 hover:text-orange-800"
                          title="Remove Admin"
                        >
                          <ShieldOff className="w-4 h-4" />
                        </button>
                      )}
                      {!(user.is_admin || user.role === 'admin') && (
                        <button
                          onClick={() => handleDeleteUser(user.id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Delete User"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {((usersPagination.page - 1) * usersPagination.limit) + 1} to{' '}
          {Math.min(usersPagination.page * usersPagination.limit, usersPagination.total)} of{' '}
          {usersPagination.total} users
        </p>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setUsersPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={usersPagination.page === 1}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-700">
            Page {usersPagination.page} of {usersPagination.totalPages || 1}
          </span>
          <button
            onClick={() => setUsersPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={usersPagination.page >= usersPagination.totalPages}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  // Lawyers Management View
  const renderLawyers = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Lawyer Management</h3>
          <div className="flex items-center space-x-4">
            <select
              value={lawyersFilter}
              onChange={(e) => {
                setLawyersFilter(e.target.value);
                setLawyersPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Lawyers</option>
              <option value="verified">Verified Only</option>
              <option value="unverified">Pending Only</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search lawyers..."
                value={lawyersSearch}
                onChange={(e) => setLawyersSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchLawyers()}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={fetchLawyers}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registration ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Speciality</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : lawyers.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
                  No lawyers found
                </td>
              </tr>
            ) : (
              lawyers.map(lawyer => (
                <tr key={lawyer.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{lawyer.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{lawyer.name || 'Not provided'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{lawyer.email}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{lawyer.registration_id || 'Not provided'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{lawyer.speciality || 'Not provided'}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      lawyer.lawyer_verified || lawyer.is_verified || lawyer.verified
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {lawyer.lawyer_verified || lawyer.is_verified || lawyer.verified ? 'Verified' : 'Pending'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      {!(lawyer.lawyer_verified || lawyer.is_verified || lawyer.verified) && (
                        <button
                          onClick={() => handleVerifyLawyer(lawyer.id)}
                          className="p-1 text-green-600 hover:text-green-800"
                          title="Verify Lawyer"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                      )}
                      {(lawyer.lawyer_verified || lawyer.is_verified || lawyer.verified) && (
                        <button
                          onClick={() => handleRejectLawyer(lawyer.id)}
                          className="p-1 text-yellow-600 hover:text-yellow-800"
                          title="Unverify Lawyer"
                        >
                          <UserX className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteLawyer(lawyer.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete Lawyer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {((lawyersPagination.page - 1) * lawyersPagination.limit) + 1} to{' '}
          {Math.min(lawyersPagination.page * lawyersPagination.limit, lawyersPagination.total)} of{' '}
          {lawyersPagination.total} lawyers
        </p>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setLawyersPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={lawyersPagination.page === 1}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-700">
            Page {lawyersPagination.page} of {lawyersPagination.totalPages || 1}
          </span>
          <button
            onClick={() => setLawyersPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={lawyersPagination.page >= lawyersPagination.totalPages}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );

  // Blog Management View
  const renderBlogs = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <h3 className="text-lg font-semibold text-gray-900">Blog Management</h3>
          <div className="flex items-center space-x-4">
            <select
              value={blogsFilter}
              onChange={(e) => {
                setBlogsFilter(e.target.value);
                setBlogsPagination(prev => ({ ...prev, page: 1 }));
              }}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Blogs</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search blogs..."
                value={blogsSearch}
                onChange={(e) => setBlogsSearch(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && fetchBlogs()}
                className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <button
              onClick={fetchBlogs}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Search
            </button>
          </div>
        </div>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Title</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Author</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Comments</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {loading ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : blogs.length === 0 ? (
              <tr>
                <td colSpan="8" className="px-6 py-8 text-center text-gray-500">
                  No blogs found
                </td>
              </tr>
            ) : (
              blogs.map(blog => (
                <tr key={blog.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{blog.id}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">{blog.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{blog.author_name || 'Unknown'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{blog.category || 'General'}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    <span className="flex items-center gap-1">
                      <MessageCircle className="w-4 h-4" />
                      {blog.comment_count || 0}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      blog.status === 'published'
                        ? 'bg-green-100 text-green-800'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}>
                      {blog.status || 'Published'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(blog.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => handleViewBlogComments(blog)}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="View Comments"
                      >
                        <MessageCircle className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => navigate(`/admin/legal-blog/${blog.id}`)}
                        className="p-1 text-green-600 hover:text-green-800"
                        title="View Blog"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteBlog(blog.id)}
                        className="p-1 text-red-600 hover:text-red-800"
                        title="Delete Blog"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Messages View
  const [allMessages, setAllMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(false);

  const fetchAllMessages = async () => {
    setLoadingMessages(true);
    try {
      // Direct query to get all chat messages with user details
      const response = await api.get('/admin/chat-messages');
      
      const messages = response.data || [];
      setAllMessages(messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setAllMessages([]);
    }
    setLoadingMessages(false);
  };

  React.useEffect(() => {
    if (activeTab === 'messages') {
      fetchAllMessages();
    }
  }, [activeTab]);

  const renderMessages = () => (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-gray-900 flex items-center">
            <MessageCircle className="w-4 h-4 mr-2 text-gray-500" />
            All Messages ({allMessages.length})
          </h3>
          <button onClick={fetchAllMessages} className="text-sm text-blue-600 hover:text-blue-800">
            Refresh
          </button>
        </div>
      </div>
      <div className="max-h-[600px] overflow-y-auto">
        {loadingMessages ? (
          <div className="p-8 text-center text-gray-500">Loading messages...</div>
        ) : allMessages.length === 0 ? (
          <div className="p-8 text-center text-gray-500">No messages found</div>
        ) : (
          <div className="divide-y divide-gray-100">
            {Array.isArray(allMessages) && allMessages.map((msg, index) => (
              <div key={index} className="p-4 hover:bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <div className="flex items-center space-x-2">
                        <div className={`w-2 h-2 rounded-full ${
                          msg.sender_type === 'lawyer' ? 'bg-blue-500' : 'bg-green-500'
                        }`} />
                        <span className="font-medium text-gray-900">{msg.sender_name}</span>
                        <span className="text-gray-400">→</span>
                        <span className="text-gray-600">{msg.receiver_name}</span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {msg.sender_type === 'lawyer' ? 'L' : 'U'} → {msg.receiver_type === 'lawyer' ? 'L' : 'U'}
                      </span>
                    </div>
                    <p className="text-gray-800 text-sm">{msg.message || msg.content}</p>
                  </div>
                  <div className="text-xs text-gray-400 ml-4">
                    {new Date(msg.created_at || msg.timestamp).toLocaleString()}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  // Activity Logs View
  const renderActivityLogs = () => (
    <div className="bg-white border border-gray-200 rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-base font-semibold text-gray-900">Recent Activity</h3>
      </div>
      
      <div className="divide-y divide-gray-100">
        {loading ? (
          <div className="px-6 py-8 text-center text-gray-500">Loading...</div>
        ) : (
          activityLogs.map(log => (
            <div key={log.id} className="px-6 py-3 flex items-center justify-between hover:bg-gray-50">
              <div className="flex items-center space-x-3">
                <div className={`w-2 h-2 rounded-full ${
                  log.status === 'success' ? 'bg-green-500' : 
                  log.status === 'pending' ? 'bg-yellow-500' : 'bg-gray-400'
                }`} />
                <div>
                  <div className="text-sm font-medium text-gray-900">{log.event}</div>
                  <div className="text-xs text-gray-500">{log.user}</div>
                </div>
              </div>
              <div className="text-xs text-gray-400">{log.timestamp}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );

  if (!user || (user.role !== 'admin' && !user.is_admin)) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center">
          <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 mb-6">You don't have permission to access this page.</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  return (
    <Suspense fallback={<LoadingSpinner />}>
      <div className="min-h-screen bg-gray-100">
        {/* Header */}
        <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
              <button
                onClick={refreshData}
                disabled={refreshing}
                className="p-2 text-gray-600 hover:text-gray-900 disabled:opacity-50"
                title="Refresh Data"
              >
                <RefreshCw className={`w-5 h-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/')}
                className="text-gray-600 hover:text-gray-900 text-sm"
              >
                Home
              </button>
              <span className="text-sm text-gray-600">Welcome, {user?.name || 'Admin'}</span>
              <button
                onClick={handleLogout}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab('dashboard')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'dashboard'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <TrendingUp className="w-4 h-4" />
                <span>Dashboard</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('users')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'users'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Users className="w-4 h-4" />
                <span>Users</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('lawyers')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'lawyers'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Briefcase className="w-4 h-4" />
                <span>Lawyers</span>
              </div>
            </button>

            <button
              onClick={() => setActiveTab('blogs')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'blogs'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Blogs</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('messages')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'messages'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <MessageCircle className="w-4 h-4" />
                <span>Messages</span>
              </div>
            </button>
            <button
              onClick={() => setActiveTab('activity')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'activity'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4" />
                <span>Activity Logs</span>
              </div>
            </button>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'dashboard' && renderDashboard()}
        {activeTab === 'users' && renderUsers()}
        {activeTab === 'lawyers' && renderLawyers()}
        {activeTab === 'blogs' && renderBlogs()}
        {activeTab === 'messages' && renderMessages()}
        {activeTab === 'activity' && renderActivityLogs()}
        </main>
      </div>
      
      {/* Blog Comments Modal */}
      {selectedBlogForComments && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full mx-4 max-h-[90vh] overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900">
                Comments for: {selectedBlogForComments.title}
              </h3>
              <button
                onClick={() => setSelectedBlogForComments(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <XCircle className="w-6 h-6" />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto max-h-[70vh]">
              {loadingComments ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                  <p className="text-gray-500 mt-2">Loading comments...</p>
                </div>
              ) : blogComments.length === 0 ? (
                <div className="text-center py-8">
                  <MessageCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-500">No comments found for this blog</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {blogComments.map(comment => (
                    <div key={comment.id} className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {comment.user_name?.charAt(0) || 'U'}
                              </span>
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{comment.user_name || 'Anonymous'}</p>
                              <p className="text-xs text-gray-500">
                                {new Date(comment.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                          <p className="text-gray-700 ml-11">{comment.comment_text}</p>
                        </div>
                        <button
                          onClick={() => handleDeleteComment(comment.id)}
                          className="p-1 text-red-600 hover:text-red-800 ml-4"
                          title="Delete Comment"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </Suspense>
  );
};

export default AdminDashboard;