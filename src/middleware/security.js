const rateLimit = require('express-rate-limit');

// Rate limiter for contact inquiry submission: max 10 requests per 15 minutes per IP
const contactLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: {
    success: false,
    error: 'Too many inquiries submitted from this IP. Please wait a few minutes before trying again.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

// Rate limiter for login: max 15 attempts per 15 minutes per IP
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  message: {
    success: false,
    error: 'Too many login attempts. Please try again later.'
  },
  standardHeaders: true,
  legacyHeaders: false
});

module.exports = {
  contactLimiter,
  loginLimiter
};
