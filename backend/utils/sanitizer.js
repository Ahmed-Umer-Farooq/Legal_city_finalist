const validator = require('validator');
const xss = require('xss');

// Input sanitization utilities
const sanitizeInput = {
  // Sanitize string input
  string: (input, maxLength = 1000) => {
    if (!input || typeof input !== 'string') return '';
    return xss(validator.escape(input.trim().substring(0, maxLength)));
  },

  // Sanitize email
  email: (email) => {
    if (!email || typeof email !== 'string') return '';
    const sanitized = validator.normalizeEmail(email.trim().toLowerCase());
    return validator.isEmail(sanitized) ? sanitized : '';
  },

  // Sanitize HTML content (for rich text)
  html: (html) => {
    if (!html || typeof html !== 'string') return '';
    return xss(html, {
      whiteList: {
        p: [],
        br: [],
        strong: [],
        em: [],
        u: [],
        ol: [],
        ul: [],
        li: [],
        h1: [], h2: [], h3: [], h4: [], h5: [], h6: []
      }
    });
  },

  // Sanitize numeric input
  number: (input, min = null, max = null) => {
    const num = parseFloat(input);
    if (isNaN(num)) return null;
    if (min !== null && num < min) return min;
    if (max !== null && num > max) return max;
    return num;
  },

  // Sanitize boolean input
  boolean: (input) => {
    if (typeof input === 'boolean') return input;
    if (typeof input === 'string') {
      return input.toLowerCase() === 'true' || input === '1';
    }
    return Boolean(input);
  },

  // Sanitize object by applying sanitization to each field
  object: (obj, schema) => {
    if (!obj || typeof obj !== 'object') return {};
    
    const sanitized = {};
    for (const [key, sanitizer] of Object.entries(schema)) {
      if (obj.hasOwnProperty(key)) {
        sanitized[key] = sanitizer(obj[key]);
      }
    }
    return sanitized;
  }
};

module.exports = { sanitizeInput };