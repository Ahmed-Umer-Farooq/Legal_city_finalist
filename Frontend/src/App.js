import React, { Suspense, lazy } from 'react';
import { Routes, Route, Navigate, useParams } from 'react-router-dom';
import { Toaster } from 'sonner';

// Eager load critical components
import LegalCityAuth from './LegalCityAuth';
import ProtectedRoute from './components/ProtectedRoute';
import UserInterface from './pages/UserInterface';
import MainLayout from './components/layout/MainLayout';
import SharedLayout from './components/layout/SharedLayout';

// Lazy load non-critical components
const AdminDashboard = lazy(() => import('./pages/admin/AdminDashboard'));
const GoogleUserSetup = lazy(() => import('./pages/auth/GoogleUserSetup'));
const GoogleLawyerSetup = lazy(() => import('./pages/auth/GoogleLawyerSetup'));
const LawyerDirectory = lazy(() => import('./pages/public/LawyerDirectory'));
const LawyerProfile = lazy(() => import('./pages/LawyerProfile'));
const LawyerDashboard = lazy(() => import('./pages/lawyer/LawyerDashboard'));
const FindLawyer = lazy(() => import('./pages/FindLawyer'));
const SearchResults = lazy(() => import('./pages/SearchResults'));
const LegalForms = lazy(() => import('./pages/LegalForms'));
const UserDashboard = lazy(() => import('./pages/userdashboard/UserDashboard'));
const QAPage = lazy(() => import('./pages/public/QAPage'));
const ContactUs = lazy(() => import('./pages/ContactUs'));

// Direct imports for frequently used components
import Blog from './pages/userdashboard/Blog';
import BlogPage from './pages/Blogs/blogs';
import BlogDetail from './pages/Blogs/BlogDetail';
import BlogPosts from './pages/userdashboard/BlogPosts';
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

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
  </div>
);

// Redirect component for legacy blog routes
const BlogRedirect = () => {
  const { id } = useParams();
  return <Navigate to={`/legal-blog/${id}`} replace />;
};

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
      <Suspense fallback={<LoadingSpinner />}>
        <Routes>
        {/* Auth routes - No header/footer */}
        <Route path="/login" element={<LegalCityAuth />} />
        <Route path="/register" element={<Navigate to="/signup" replace />} />
        <Route path="/signup" element={<LegalCityAuth />} />
        <Route path="/forgot-password" element={<LegalCityAuth />} />
        <Route path="/reset-password" element={<LegalCityAuth />} />
        <Route path="/verify-email" element={<LegalCityAuth />} />
        <Route path="/google-user-setup" element={<Suspense fallback={<LoadingSpinner />}><GoogleUserSetup /></Suspense>} />
        <Route path="/google-lawyer-setup" element={<Suspense fallback={<LoadingSpinner />}><GoogleLawyerSetup /></Suspense>} />
        <Route path="/logout" element={<Suspense fallback={<LoadingSpinner />}><Logout /></Suspense>} />
        
        {/* SEO-Friendly Lawyer Dashboard Routes */}
        <Route path="/lawyer-dashboard" element={<Navigate to="/lawyer/dashboard" replace />} />
        <Route path="/lawyer/dashboard" element={<ProtectedRoute><Suspense fallback={<LoadingSpinner />}><LawyerDashboard /></Suspense></ProtectedRoute>} />
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
        <Route path="/lawyer/dashboard/profile" element={<ProtectedRoute><LawyerDashboard /></ProtectedRoute>} />
        <Route path="/lawyer/dashboard/account" element={<ProtectedRoute><LawyerDashboard /></ProtectedRoute>} />
        <Route path="/lawyer-dashboard/chatapp" element={<ProtectedRoute><ChatPage /></ProtectedRoute>} />
        <Route path="/user-dashboard" element={<ProtectedRoute><UserDashboard /></ProtectedRoute>} />
        <Route path="/admin-dashboard" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        
        {/* SEO-Friendly User Dashboard Routes */}
        <Route element={<ProtectedRoute><SharedLayout /></ProtectedRoute>}>
          <Route path="/user/dashboard" element={<Dashboard />} />
          <Route path="/user/legal-blog" element={<BlogPage />} />
          <Route path="/user/legal-blog/:id/:slug?" element={<BlogDetail />} />
          <Route path="/user/legal-blog/:id" element={<BlogDetail />} />
          <Route path="/dashboard/my-blog-posts" element={<BlogPosts />} />
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
        

        
        {/* Admin Blog Routes - No header/footer for admin */}
        <Route path="/admin-blogs" element={<ProtectedRoute><BlogPage /></ProtectedRoute>} />
        <Route path="/admin/legal-blog/:id/:slug?" element={<ProtectedRoute><BlogDetail /></ProtectedRoute>} />
        <Route path="/admin/legal-blog/:id" element={<ProtectedRoute><BlogDetail /></ProtectedRoute>} />
        
        {/* Public pages with Main Layout (Header + Footer) */}
        <Route element={<MainLayout />}>
          <Route path="/" element={<UserInterface />} />
          <Route path="/lawyers" element={<LawyerDirectory />} />
          <Route path="/lawyer-directory" element={<LawyerDirectory />} />
          <Route path="/find-a-lawyer" element={<FindLawyer />} />
          <Route path="/lawyer/:id/:name?" element={<LawyerProfile />} />
          <Route path="/legal-blog" element={<BlogPage />} />
          <Route path="/legal-blog/:id/:slug?" element={<BlogDetail />} />
          <Route path="/legal-blog/:id" element={<BlogDetail />} />
          <Route path="/blog/:id" element={<BlogDetail />} />
          <Route path="/qa" element={<Suspense fallback={<LoadingSpinner />}><QAPage /></Suspense>} />
          <Route path="/contact-us" element={<Suspense fallback={<LoadingSpinner />}><ContactUs /></Suspense>} />
          <Route path="/legal-forms" element={<Suspense fallback={<LoadingSpinner />}><LegalForms /></Suspense>} />
          {/* Legacy redirects */}
          <Route path="/find-lawyer" element={<Navigate to="/find-a-lawyer" replace />} />
          <Route path="/blogs" element={<Navigate to="/legal-blog" replace />} />
        </Route>
        
        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </div>
  );
}

export default App;