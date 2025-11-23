import React, { useState, useEffect, Suspense } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';
import {
  Users, UserCheck, UserX, Briefcase, CheckCircle, 
  XCircle, Trash2, Shield, ShieldOff, RefreshCw,
  TrendingUp, Activity, Clock, Search, ChevronLeft, ChevronRight,
  FileText, Eye, Edit
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
    unverifiedLawyers: 0
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
      const response = await api.get('/admin/stats');
      setStats(response.data?.stats || { totalUsers: 0, totalLawyers: 0, verifiedLawyers: 0, unverifiedLawyers: 0 });
      setRecentUsers(response.data?.recentUsers || []);
      setRecentLawyers(response.data?.recentLawyers || []);
    } catch (error) {
      console.error('Admin stats API not found, using defaults');
      setStats({ totalUsers: 0, totalLawyers: 0, verifiedLawyers: 0, unverifiedLawyers: 0 });
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
    try {
      setLoading(true);
      const response = await api.get('/admin/activity-logs', {
        params: {
          page: logsPagination.page,
          limit: logsPagination.limit
        }
      });
      setActivityLogs(response.data?.logs || []);
      setLogsPagination(prev => ({ ...prev, ...response.data?.pagination }));
    } catch (error) {
      console.error('Activity logs API not available');
      setActivityLogs([]);
    } finally {
      setLoading(false);
    }
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

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Dashboard Stats View
  const renderDashboard = () => (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Users</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalUsers}</p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <Users className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Total Lawyers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.totalLawyers}</p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Briefcase className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Verified Lawyers</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.verifiedLawyers}</p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <CheckCircle className="w-8 h-8 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-500 text-sm font-medium">Pending Verification</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{stats.unverifiedLawyers}</p>
            </div>
            <div className="bg-yellow-100 rounded-full p-3">
              <Clock className="w-8 h-8 text-yellow-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Users */}
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Users</h3>
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
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Verified Users</h3>
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
        <div className="bg-white rounded-lg shadow">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Recent Lawyer Registrations</h3>
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
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Created</th>
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
            ) : blogs.length === 0 ? (
              <tr>
                <td colSpan="7" className="px-6 py-8 text-center text-gray-500">
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
                        onClick={() => window.open('/admin-blogs', '_blank')}
                        className="p-1 text-blue-600 hover:text-blue-800"
                        title="View All Blogs"
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

  // Activity Logs View
  const renderActivityLogs = () => (
    <div className="bg-white rounded-lg shadow">
      <div className="px-6 py-4 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Activity Logs</h3>
      </div>
      
      <div className="divide-y divide-gray-200">
        {loading ? (
          <div className="px-6 py-8 text-center text-gray-500">Loading...</div>
        ) : !activityLogs || activityLogs.length === 0 ? (
          <div className="px-6 py-8 text-center text-gray-500">No activity logs</div>
        ) : (
          activityLogs.map(log => (
            <div key={log.id} className="px-6 py-4 hover:bg-gray-50">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <Activity className="w-4 h-4 text-gray-400" />
                    <span className="font-medium text-gray-900">{log.admin_name || 'System'}</span>
                    <span className="text-gray-500">•</span>
                    <span className="text-sm text-gray-500">{log.action.replace(/_/g, ' ')}</span>
                  </div>
                  {log.details && (
                    <p className="text-sm text-gray-600 mt-1 ml-6">
                      {log.details.userName || log.details.lawyerName} ({log.details.userEmail || log.details.lawyerEmail})
                    </p>
                  )}
                </div>
                <span className="text-xs text-gray-400">
                  {new Date(log.created_at).toLocaleString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
        <p className="text-sm text-gray-500">
          Showing {((logsPagination.page - 1) * logsPagination.limit) + 1} to{' '}
          {Math.min(logsPagination.page * logsPagination.limit, logsPagination.total)} of{' '}
          {logsPagination.total} logs
        </p>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setLogsPagination(prev => ({ ...prev, page: prev.page - 1 }))}
            disabled={logsPagination.page === 1}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <span className="text-sm text-gray-700">
            Page {logsPagination.page} of {logsPagination.totalPages || 1}
          </span>
          <button
            onClick={() => setLogsPagination(prev => ({ ...prev, page: prev.page + 1 }))}
            disabled={logsPagination.page >= logsPagination.totalPages}
            className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
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
        {activeTab === 'activity' && renderActivityLogs()}
        </main>
      </div>
    </Suspense>
  );
};

export default AdminDashboard;