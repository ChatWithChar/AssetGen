const rateLimit = require('express-rate-limit');
const config = require('../config');

/**
 * Rate limiter middleware to prevent abuse of the API
 */
const apiRateLimiter = rateLimit({
  windowMs: config.rateLimit.windowMs,
  max: config.rateLimit.max,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    status: 'error',
    message: 'Too many requests, please try again later.',
  },
});

module.exports = {
  apiRateLimiter,
};
