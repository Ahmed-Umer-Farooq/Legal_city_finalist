import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'sonner';

import LegalCityAuth from './LegalCityAuth';
import ProtectedRoute from './components/ProtectedRoute';
import AdminDashboard from './pages/admin/AdminDashboard';
import GoogleUserSetup from './pages/auth/GoogleUserSetup';
import GoogleLawyerSetup from './pages/auth/GoogleLawyerSetup';
import LawyerDirectory from './pages/public/LawyerDirectory';
import LawyerProfile from './pages/LawyerProfile';
import LawyerDashboard from './pages/lawyer/LawyerDashboard';
import FindLawyer from './pages/FindLawyer';
import SearchResults from './pages/SearchResults';
import UserDashboard from './pages/userdashboard/UserDashboard';
import UserInterface from './pages/UserInterface';
import SharedLayout from './components/layout/SharedLayout';
import MainLayout from './components/layout/MainLayout';
import Blog from './pages/userdashboard/Blog';
import BlogPage from './pages/Blogs/blogs';
import BlogDetail from './pages/Blogs/BlogDetail';
import QAPage from './pages/public/QAPage';
import Messages from './pages/userdashboard/Messages';
import Directory from './pages/userdashboard/Directory';
import Forms from './pages/userdashboard/Forms';
import SocialMedia from './pages/userdashboard/SocialMedia';
import Tasks from './pages/userdashboard/Tasks';
import Cases from './pages/userdashboard/Cases';
import Dashboard from './pages/userdashboard/Dashboard';
import Accounting from './pages/userdashboard/Accounting';
import Profile from './pages/userdashboard/Profile';
import Calendar from './pages/userdashboard/Calendar';
import QA from './pages/userdashboard/QA';
import ChatPage from './pages/userdashboard/ChatPage';

import Refer from './pages/userdashboard/Refer';
import Settings from './pages/userdashboard/Settings';
import Logout from './pages/auth/Logout';

function App() {
  return (
    <div className="App">
      <Toaster 
        position="top-right" 
        richColors 
        closeButton 
        duration={2000}
        toastOptions={{
          style: {
            fontSize: '14px',
            fontWeight: '500',
          },
        }}
      />
      <Routes>
        {/* Auth routes - No header/footer */}
        <Route path="/login" element={<LegalCityAuth />} />
        <Route path="/register" element={<LegalCityAuth />} />
        <Route path="/forgot-password" element={<LegalCityAuth />} />
        <Route path="/reset-password" element={<LegalCityAuth />} />
        <Route path="/verify-email" element={<LegalCityAuth />} />
        <Route path="/google-user-setup" element={<GoogleUserSetup />} />
        <Route path="/google-lawyer-setup" element={<GoogleLawyerSetup />} />
        <Route path="/logout" element={<Logout />} />
        
        {/* SEO-Friendly Lawyer Dashboard Routes */}
        <Route path="/lawyer-dashboard" element={<Navigate to="/lawyer/dashboard" replace />} />
        <Route path="/lawyer/dashboard" element={<ProtectedRoute><LawyerDashboard /></ProtectedRoute>} />
        <Route path="/lawyer/dashboard/overview" element={<ProtectedRoute><LawyerDashboard /></ProtectedRoute>} />
        <Route path="/lawyer/dashboard/cases" element={<ProtectedRoute><LawyerDashboard /></ProtectedRoute>} />
        <Route path="/lawyer/dashboard/clients" element={<ProtectedRoute><LawyerDashboard /></ProtectedRoute>} />
        <Route path="/lawyer/dashboard/contacts" element={<ProtectedRoute><LawyerDashboard /></ProtectedRoute>} />
        <Route path="/lawyer/dashboard/calendar" element={<ProtectedRoute><LawyerDashboard /></ProtectedRoute>} />
        <Route path="/lawyer/dashboard/documents" element={<ProtectedRoute><LawyerDashboard /></ProtectedRoute>} />
        <Route path="/lawyer/dashboard/reports" element={<ProtectedRoute><LawyerDashboard /></ProtectedRoute>} />
        <Route path="/lawyer/dashboard/tasks" element={<ProtectedRoute><LawyerDashboard /></ProtectedRoute>} />
        <Route path="/lawyer/dashboard/messages" element={<ProtectedRoute><LawyerDashboard /></ProtectedRoute>} />
        <Route path="/lawyer/dashboard/blogs" element={<ProtectedRoute><LawyerDashboard /></ProtectedRoute>} />
        <Route path="/lawyer-dashboard/chatapp" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        
        {/* SEO-Friendly User Dashboard Routes */}
        <Route element={<ProtectedRoute><SharedLayout /></ProtectedRoute>}>
          <Route path="/user/dashboard" element={<Dashboard />} />
          <Route path="/user/legal-blog" element={<Blog />} />
          <Route path="/user/messages" element={<Messages />} />
          <Route path="/user/chat" element={<Messages />} />
          <Route path="/user/lawyer-directory" element={<Directory />} />
          <Route path="/user/legal-forms" element={<Forms />} />
          <Route path="/user/social-media-management" element={<SocialMedia />} />
          <Route path="/user/legal-tasks" element={<Tasks />} />
          <Route path="/user/legal-cases" element={<Cases />} />
          <Route path="/user/accounting-billing" element={<Accounting />} />
          <Route path="/user/profile-settings" element={<Profile />} />
          <Route path="/user/calendar-appointments" element={<Calendar />} />
          <Route path="/user/legal-questions-answers" element={<QA />} />
          <Route path="/user/referral-program" element={<Refer />} />
          <Route path="/user/account-settings" element={<Settings />} />
        </Route>
        
        {/* User Dashboard Blog Route */}
        <Route path="/user/legal-blog-posts" element={<ProtectedRoute><BlogPage /></ProtectedRoute>} />
        
        {/* Admin Blog Route - No header/footer for admin */}
        <Route path="/admin-blogs" element={<ProtectedRoute><BlogPage /></ProtectedRoute>} />
        
        {/* Public pages with Main Layout (Header + Footer) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<UserInterface />} />
          <Route path="/lawyers" element={<LawyerDirectory />} />
          <Route path="/find-lawyer" element={<FindLawyer />} />
          <Route path="/lawyer/:id" element={<LawyerProfile />} />
          <Route path="/blogs" element={<BlogPage />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/qa" element={<QAPage />} />
        </Route>
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

export default App;