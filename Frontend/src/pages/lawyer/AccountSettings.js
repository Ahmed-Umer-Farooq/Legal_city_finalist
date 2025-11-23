import React, { useState } from 'react';
import { User, Lock, Bell, Shield, Trash2 } from 'lucide-react';
import api from '../../utils/api';

export default function AccountSettings() {
  const [account, setAccount] = useState({
    username: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    emailNotifications: true,
    smsNotifications: false,
    marketingEmails: false,
    twoFactorAuth: false
  });

  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    try {
      await api.put('/lawyer/account', account);
      alert('Account settings updated successfully!');
    } catch (error) {
      alert('Failed to update account settings');
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    if (account.newPassword !== account.confirmPassword) {
      alert('New passwords do not match');
      return;
    }
    setLoading(true);
    try {
      await api.put('/lawyer/password', {
        currentPassword: account.currentPassword,
        newPassword: account.newPassword
      });
      alert('Password updated successfully!');
      setAccount({...account, currentPassword: '', newPassword: '', confirmPassword: ''});
    } catch (error) {
      alert('Failed to update password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#181A2A]">Account Settings</h1>
          <p className="text-[#737791] mt-1">Manage your account preferences and security</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Account Information */}
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4 flex items-center gap-2">
            <User className="w-5 h-5" />
            Account Information
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Username</label>
              <input
                type="text"
                value={account.username}
                onChange={(e) => setAccount({...account, username: e.target.value})}
                placeholder="darlene.robertson"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-[#28B779] text-white px-4 py-2 rounded-lg hover:bg-[#229966] disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </div>

        {/* Password Security */}
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4 flex items-center gap-2">
            <Lock className="w-5 h-5" />
            Password & Security
          </h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
              <input
                type="password"
                value={account.currentPassword}
                onChange={(e) => setAccount({...account, currentPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
              <input
                type="password"
                value={account.newPassword}
                onChange={(e) => setAccount({...account, newPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
              <input
                type="password"
                value={account.confirmPassword}
                onChange={(e) => setAccount({...account, confirmPassword: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={account.twoFactorAuth}
                onChange={(e) => setAccount({...account, twoFactorAuth: e.target.checked})}
                className="rounded"
              />
              <span className="text-sm text-[#737791]">Enable Two-Factor Authentication</span>
            </div>
            <button
              onClick={handlePasswordChange}
              disabled={loading}
              className="w-full bg-[#007EF4] text-white px-4 py-2 rounded-lg hover:bg-[#0066CC] disabled:opacity-50"
            >
              {loading ? 'Updating...' : 'Update Password'}
            </button>
          </div>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4 flex items-center gap-2">
            <Bell className="w-5 h-5" />
            Notification Preferences
          </h2>
          <div className="space-y-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={account.emailNotifications}
                onChange={(e) => setAccount({...account, emailNotifications: e.target.checked})}
                className="rounded"
              />
              <span className="text-[#737791]">Email Notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={account.smsNotifications}
                onChange={(e) => setAccount({...account, smsNotifications: e.target.checked})}
                className="rounded"
              />
              <span className="text-[#737791]">SMS Notifications</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={account.marketingEmails}
                onChange={(e) => setAccount({...account, marketingEmails: e.target.checked})}
                className="rounded"
              />
              <span className="text-[#737791]">Marketing Emails</span>
            </label>
            <button
              onClick={handleSave}
              disabled={loading}
              className="w-full bg-[#28B779] text-white px-4 py-2 rounded-lg hover:bg-[#229966] disabled:opacity-50"
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </button>
          </div>
        </div>

        {/* Privacy & Security */}
        <div className="bg-white rounded-2xl border border-[#F8F9FA] shadow-md p-6">
          <h2 className="text-lg font-semibold text-[#181A2A] mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Privacy & Security
          </h2>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-[#181A2A] mb-2">Account Privacy</h3>
              <p className="text-sm text-[#737791] mb-3">Control who can see your profile and contact you</p>
              <button className="text-sm text-[#007EF4] hover:underline">Manage Privacy Settings</button>
            </div>
            <div className="p-4 bg-gray-50 rounded-lg">
              <h3 className="font-medium text-[#181A2A] mb-2">Data Export</h3>
              <p className="text-sm text-[#737791] mb-3">Download a copy of your account data</p>
              <button className="text-sm text-[#007EF4] hover:underline">Request Data Export</button>
            </div>
            <div className="p-4 bg-red-50 rounded-lg border border-red-200">
              <h3 className="font-medium text-red-800 mb-2 flex items-center gap-2">
                <Trash2 className="w-4 h-4" />
                Delete Account
              </h3>
              <p className="text-sm text-red-600 mb-3">Permanently delete your account and all data</p>
              <button className="text-sm text-red-600 hover:underline font-medium">Delete My Account</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}