import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Outlet } from 'react-router-dom';

/**
 * Sub-components (Icons & Logo)
 */

function LegalCityLogo() {
  const navigate = useNavigate();
  
  return (
    <div 
      className="flex items-center gap-2 cursor-pointer"
      onClick={() => navigate('/')}
    >
      <div className="bg-white rounded-lg px-3 py-1.5 shadow-sm">
        <span className="text-[#0284C7] font-bold text-lg tracking-tight">Legal</span>
      </div>
      <span className="text-white font-bold text-lg tracking-tight">City</span>
    </div>
  );
}

function Header({ currentLanguage, setCurrentLanguage, translations }) {
  const navigate = useNavigate();
  const location = useLocation();
  const [showLanguageMenu, setShowLanguageMenu] = useState(false);
  const [showDirectoryMenu, setShowDirectoryMenu] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const [isHeaderVisible, setIsHeaderVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;
    
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
          setIsScrolled(currentScrollY > 10);
          
          if (currentScrollY > lastScrollY && currentScrollY > 0) {
            setIsHeaderVisible(false);
          } else if (currentScrollY < lastScrollY) {
            setIsHeaderVisible(true);
          }
          
          setLastScrollY(currentScrollY);
          ticking = false;
        });
        ticking = true;
      }
    };
    
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const isActive = (path) => location.pathname === path;
  const isDirectoryActive = () => isActive('/lawyers') || isActive('/find-lawyer');

  const languages = [
    { code: 'EN', name: 'English' },
    { code: 'ES', name: 'Español' },
    { code: 'FR', name: 'Français' },
    { code: 'DE', name: 'Deutsch' }
  ];

  const handleLoginClick = () => {
    navigate('/login');
  };

  const handleSignupClick = () => {
    navigate('/signup');
  };

  // Close mobile menu on outside click
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (showMobileMenu && !event.target.closest('nav')) {
        setShowMobileMenu(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [showMobileMenu]);

  const handleLanguageSelect = (language) => {
    setCurrentLanguage(language.code);
    setShowLanguageMenu(false);
  };

  return (
    <header 
      className={`w-full bg-gradient-to-b from-[#0071BC] to-[#00D2FF] h-16 fixed top-0 z-50 transition-transform duration-300 ${
        isScrolled ? 'shadow-lg backdrop-blur-sm' : ''
      }`} 
      style={{ 
        transform: isHeaderVisible ? 'translateY(0)' : 'translateY(-100%)'
      }}
      role="banner"
    >
      <nav className="w-full max-w-[1440px] mx-auto flex items-center justify-between h-full px-4 lg:px-8" role="navigation" aria-label="Main navigation">
        <div className="flex items-center gap-6">
          <LegalCityLogo />
          
          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-1">
            <a 
              href="/"
              onClick={(e) => { e.preventDefault(); navigate('/'); }}
              className={`flex items-center text-sm gap-2 transition-all duration-200 px-3 py-2 relative font-medium ${
                isActive('/') 
                  ? 'text-white' 
                  : 'text-white/90 hover:text-white'
              }`}
              aria-current={isActive('/') ? 'page' : undefined}
            >
              <span>Home</span>
              {isActive('/') && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"></div>
              )}
            </a>
            
            <div 
              className="relative"
              onMouseEnter={() => setShowDirectoryMenu(true)}
              onMouseLeave={() => setShowDirectoryMenu(false)}
            >
              <button 
                className={`flex items-center text-sm gap-2 transition-all duration-200 px-3 py-2 relative font-medium ${
                  isDirectoryActive() 
                    ? 'text-white' 
                    : 'text-white/90 hover:text-white'
                }`}
                aria-expanded={showDirectoryMenu}
                aria-haspopup="true"
              >
                <span>Lawyers</span>
                <svg 
                  width="8" 
                  height="7" 
                  viewBox="0 0 8 7" 
                  fill="none" 
                  xmlns="http://www.w3.org/2000/svg"
                  className={`transition-transform duration-200 ${showDirectoryMenu ? 'rotate-180' : ''}`}
                  aria-hidden="true"
                >
                  <path d="M0.491211 0.34375L3.99121 5.34375L7.49121 0.34375" stroke="white" strokeWidth="1.2"/>
                </svg>
                {isDirectoryActive() && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"></div>
                )}
              </button>
              
              <div className={`absolute top-full left-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-10 min-w-[160px] transition-all duration-200 ${
                showDirectoryMenu 
                  ? 'opacity-100 visible transform translate-y-0' 
                  : 'opacity-0 invisible transform -translate-y-2'
              }`} role="menu">
                <a
                  href="/lawyers"
                  onClick={(e) => { e.preventDefault(); navigate('/lawyers'); setShowDirectoryMenu(false); }}
                  className={`block w-full px-4 py-2 text-left text-sm transition-colors rounded-t-lg ${
                    isActive('/lawyers') 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                  role="menuitem"
                >
                  Directory
                </a>
                <a
                  href="/find-lawyer"
                  onClick={(e) => { e.preventDefault(); navigate('/find-lawyer'); setShowDirectoryMenu(false); }}
                  className={`block w-full px-4 py-2 text-left text-sm transition-colors rounded-b-lg ${
                    isActive('/find-lawyer') 
                      ? 'bg-blue-50 text-blue-600' 
                      : 'text-gray-700 hover:bg-gray-50 hover:text-blue-600'
                  }`}
                  role="menuitem"
                >
                  Find Lawyer
                </a>
              </div>
            </div>
            
            <a 
              href="/blogs"
              onClick={(e) => { e.preventDefault(); navigate('/blogs'); }}
              className={`flex items-center text-sm gap-2 transition-all duration-200 px-3 py-2 relative font-medium ${
                isActive('/blogs') 
                  ? 'text-white' 
                  : 'text-white/90 hover:text-white'
              }`}
              aria-current={isActive('/blogs') ? 'page' : undefined}
            >
              <span>Legal Blog</span>
              {isActive('/blogs') && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"></div>
              )}
            </a>
            
            <a 
              href="/qa"
              onClick={(e) => { e.preventDefault(); navigate('/qa'); }}
              className={`flex items-center text-sm gap-2 transition-all duration-200 px-3 py-2 relative font-medium ${
                isActive('/qa') 
                  ? 'text-white' 
                  : 'text-white/90 hover:text-white'
              }`}
              aria-current={isActive('/qa') ? 'page' : undefined}
            >
              <span>Free Q&A</span>
              {isActive('/qa') && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"></div>
              )}
            </a>
            
            <a 
              href="/contact-us"
              onClick={(e) => { e.preventDefault(); navigate('/contact-us'); }}
              className={`flex items-center text-sm gap-2 transition-all duration-200 px-3 py-2 relative font-medium ${
                isActive('/contact-us') 
                  ? 'text-white' 
                  : 'text-white/90 hover:text-white'
              }`}
              aria-current={isActive('/contact-us') ? 'page' : undefined}
            >
              <span>Contact Us</span>
              {isActive('/contact-us') && (
                <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-white rounded-full"></div>
              )}
            </a>
          </div>
        </div>

        {/* Desktop Actions */}
        <div className="hidden md:flex items-center gap-4">
          <div 
            className="relative"
            onMouseEnter={() => setShowLanguageMenu(true)}
            onMouseLeave={() => setShowLanguageMenu(false)}
          >
            <button 
              className="w-7 h-7 rounded-full bg-white/10 hover:bg-white/20 transition-colors flex items-center justify-center text-xs font-medium text-white"
              aria-expanded={showLanguageMenu}
              aria-haspopup="true"
              aria-label={`Current language: ${currentLanguage}`}
            >
              {currentLanguage}
            </button>
            
            <div className={`absolute top-full right-0 mt-1 bg-white rounded-lg border border-gray-200 shadow-lg z-10 min-w-[80px] transition-all duration-200 ${
              showLanguageMenu 
                ? 'opacity-100 visible transform translate-y-0' 
                : 'opacity-0 invisible transform -translate-y-2'
            }`} role="menu">
              {languages.map((language, index) => (
                <button
                  key={language.code}
                  onClick={() => handleLanguageSelect(language)}
                  className={`w-full px-3 py-2 text-left text-xs hover:bg-gray-50 transition-colors ${
                    index === 0 ? 'rounded-t-lg' : ''
                  } ${
                    index === languages.length - 1 ? 'rounded-b-lg' : ''
                  } ${
                    currentLanguage === language.code ? 'bg-blue-50 text-blue-600' : 'text-gray-700'
                  }`}
                  role="menuitem"
                >
                  {language.code}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button 
              onClick={handleLoginClick}
              className="flex items-center gap-2 h-[38px] px-4 rounded-[20px] bg-transparent border border-white/30 hover:bg-white/10 transition-colors font-medium"
              aria-label="Login to your account"
            >
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                <circle cx="7" cy="4" r="3" stroke="white" strokeWidth="1.5"/>
                <path d="M2 12c0-2.5 2.5-4 5-4s5 1.5 5 4" stroke="white" strokeWidth="1.5"/>
              </svg>
              <span className="text-white text-sm">Login</span>
            </button>

            <button 
              onClick={handleSignupClick}
              className="h-[38px] px-6 rounded-[20px] bg-white text-black text-sm font-medium hover:bg-gray-100 transition-colors"
              aria-label="Create new account"
            >
              Sign Up
            </button>
          </div>
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="md:hidden p-2 text-white hover:bg-white/10 rounded-lg transition-colors"
          onClick={() => setShowMobileMenu(!showMobileMenu)}
          aria-expanded={showMobileMenu}
          aria-label="Toggle mobile menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            {showMobileMenu ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </nav>

      {/* Mobile Menu */}
      {showMobileMenu && (
        <div className="md:hidden bg-white border-t border-gray-200 shadow-lg" role="menu">
          <div className="px-4 py-2 space-y-1">
            <a
              href="/"
              onClick={(e) => { e.preventDefault(); navigate('/'); setShowMobileMenu(false); }}
              className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              role="menuitem"
            >
              Home
            </a>
            <a
              href="/lawyers"
              onClick={(e) => { e.preventDefault(); navigate('/lawyers'); setShowMobileMenu(false); }}
              className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/lawyers') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              role="menuitem"
            >
              Lawyer Directory
            </a>
            <a
              href="/find-lawyer"
              onClick={(e) => { e.preventDefault(); navigate('/find-lawyer'); setShowMobileMenu(false); }}
              className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/find-lawyer') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              role="menuitem"
            >
              Find Lawyer
            </a>
            <a
              href="/blogs"
              onClick={(e) => { e.preventDefault(); navigate('/blogs'); setShowMobileMenu(false); }}
              className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/blogs') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              role="menuitem"
            >
              Legal Blog
            </a>
            <a
              href="/qa"
              onClick={(e) => { e.preventDefault(); navigate('/qa'); setShowMobileMenu(false); }}
              className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/qa') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              role="menuitem"
            >
              Free Q&A
            </a>
            <a
              href="/contact-us"
              onClick={(e) => { e.preventDefault(); navigate('/contact-us'); setShowMobileMenu(false); }}
              className={`block px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                isActive('/contact-us') ? 'bg-blue-50 text-blue-600' : 'text-gray-700 hover:bg-gray-50'
              }`}
              role="menuitem"
            >
              Contact Us
            </a>
            <div className="border-t border-gray-200 pt-2 mt-2">
              <button
                onClick={() => { handleLoginClick(); setShowMobileMenu(false); }}
                className="block w-full text-left px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg transition-colors"
                role="menuitem"
              >
                Login
              </button>
              <button
                onClick={() => { handleSignupClick(); setShowMobileMenu(false); }}
                className="block w-full text-left px-3 py-2 text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 rounded-lg transition-colors mt-1"
                role="menuitem"
              >
                Sign Up
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}

function Footer({ currentLanguage, translations }) {
  const navigate = useNavigate();

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-8">
          <div className="col-span-1 md:col-span-2 lg:col-span-2">
            <div className="flex items-center gap-2 mb-4">
              <div className="bg-white rounded-lg px-3 py-1.5 shadow-sm">
                <span className="text-[#0284C7] font-bold text-lg tracking-tight">Legal</span>
              </div>
              <span className="text-white font-bold text-lg tracking-tight">City</span>
            </div>
            <p className="text-gray-300 mb-6 max-w-md">
              Connect with qualified legal professionals in your area. Find the right lawyer for your specific legal needs with our comprehensive directory.
            </p>
            <div className="flex gap-4">
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 4.557c-.883.392-1.832.656-2.828.775 1.017-.609 1.798-1.574 2.165-2.724-.951.564-2.005.974-3.127 1.195-.897-.957-2.178-1.555-3.594-1.555-3.179 0-5.515 2.966-4.797 6.045-4.091-.205-7.719-2.165-10.148-5.144-1.29 2.213-.669 5.108 1.523 6.574-.806-.026-1.566-.247-2.229-.616-.054 2.281 1.581 4.415 3.949 4.89-.693.188-1.452.232-2.224.084.626 1.956 2.444 3.379 4.6 3.419-2.07 1.623-4.678 2.348-7.29 2.04 2.179 1.397 4.768 2.212 7.548 2.212 9.142 0 14.307-7.721 13.995-14.646.962-.695 1.797-1.562 2.457-2.549z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.46 6c-.77.35-1.6.58-2.46.69.88-.53 1.56-1.37 1.88-2.38-.83.5-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98C8.28 9.09 5.11 7.38 3 4.79c-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.56-.71 0-1.37-.2-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.93.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21 16 21 20.33 14.46 20.33 8.79c0-.19 0-.37-.01-.56.84-.6 1.56-1.36 2.14-2.23z"/>
                </svg>
              </a>
              <a href="#" className="w-10 h-10 bg-gray-800 rounded-full flex items-center justify-center hover:bg-gray-700 transition-colors">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
              </a>
            </div>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Browse Our Site</h3>
            <ul className="space-y-2">
              <li><button onClick={() => navigate('/lawyers')} className="text-gray-300 hover:text-white transition-colors text-sm">Find a Lawyer</button></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Review Your Lawyer</a></li>
              <li><button onClick={() => navigate('/qa')} className="text-gray-300 hover:text-white transition-colors text-sm">Legal Advice</button></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Recently Answered Questions</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Browse Practice Areas</a></li>
              <li><button onClick={() => navigate('/blogs')} className="text-gray-300 hover:text-white transition-colors text-sm">Legal Stories Blog</button></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Popular Locations</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">New York City Lawyers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Los Angeles Lawyers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Chicago Lawyers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Houston Lawyers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Washington, DC Lawyers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Philadelphia Lawyers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Phoenix Lawyers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">San Antonio Lawyers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">San Diego Lawyers</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Popular Practice Areas</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Bankruptcy & Debt Lawyers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Business Lawyers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Criminal Defense Lawyers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">DUI & DWI Lawyers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Estate Planning Lawyers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Car Accident Lawyers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Divorce & Separation Lawyers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Intellectual Property Lawyers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Speeding & Traffic Lawyers</a></li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">About</h3>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">About Legal City</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Careers</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Support</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Rating Explained</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Community Guidelines</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white transition-colors text-sm">Sitemap</a></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">
            © 2024 Legal City Inc. All Rights Reserved.
          </p>
          <div className="flex flex-wrap gap-6 mt-4 md:mt-0">
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Terms of Use</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Privacy Policy</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Do Not Sell or Share My Personal Information</a>
            <a href="#" className="text-gray-400 hover:text-white text-sm transition-colors">Contact</a>
          </div>
        </div>
      </div>
    </footer>
  );
}

export default function MainLayout() {
  const [currentLanguage, setCurrentLanguage] = useState('EN');
  const location = useLocation();
  
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
  
  // Check if user came from dashboard (for lawyer profile)
  const cameFromDashboard = localStorage.getItem('navigatedFromDashboard') === 'true' || location.pathname.startsWith('/dashboard/lawyer/');
  const isLawyerProfile = location.pathname.startsWith('/lawyer/');
  const shouldHideHeader = isLawyerProfile && cameFromDashboard;

  const translations = {
    EN: {
      lawyerDirectory: 'Lawyer Directory',
      login: 'Login',
      signup: 'Signup'
    },
    ES: {
      lawyerDirectory: 'Directorio de Abogados',
      login: 'Iniciar Sesión',
      signup: 'Registrarse'
    },
    FR: {
      lawyerDirectory: 'Annuaire des Avocats',
      login: 'Connexion',
      signup: 'S\'inscrire'
    },
    DE: {
      lawyerDirectory: 'Anwaltsverzeichnis',
      login: 'Anmelden',
      signup: 'Registrieren'
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans" style={{ fontFamily: "'Inter', sans-serif" }}>
      {!isAuthPage && !shouldHideHeader && (
        <Header currentLanguage={currentLanguage} setCurrentLanguage={setCurrentLanguage} translations={translations} />
      )}
      <main className={`flex-1 ${!isAuthPage && !shouldHideHeader ? 'pt-16' : ''}`}>
        <Outlet />
      </main>
      {!isAuthPage && !shouldHideHeader && <Footer currentLanguage={currentLanguage} translations={translations} />}
    </div>
  );
}