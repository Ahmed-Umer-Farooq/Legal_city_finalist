const csrf = require('csurf');

// CSRF protection middleware
const csrfProtection = csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  }
});

// Routes that should be exempt from CSRF (like API endpoints with token auth)
const csrfExemptRoutes = [
  '/api/auth/login',
  '/api/auth/register',
  '/api/auth/google',
  '/api/auth/facebook',
  '/api/auth/verify-email',
  '/api/csrf-token'
];

const conditionalCSRF = (req, res, next) => {
  // Skip CSRF for exempt routes
  if (csrfExemptRoutes.some(route => req.path.startsWith(route))) {
    return next();
  }
  
  // Skip CSRF for requests with valid JWT token
  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
    return next();
  }
  
  // Apply CSRF protection for other routes
  csrfProtection(req, res, next);
};

module.exports = { conditionalCSRF, csrfProtection };