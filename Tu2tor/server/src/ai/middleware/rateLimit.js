/**
 * Rate Limiting Middleware for AI endpoints
 * 
 * Prevents abuse by limiting the number of AI requests per user/IP
 */

const requestCounts = new Map(); // userId/IP -> { count, resetTime }

// Configuration
const RATE_LIMITS = {
  perMinute: parseInt(process.env.AI_RATE_LIMIT_PER_MINUTE) || 20,
  perHour: parseInt(process.env.AI_RATE_LIMIT_PER_HOUR) || 100,
  perDay: parseInt(process.env.AI_RATE_LIMIT_PER_DAY) || 1000,
};

const WINDOW_SIZES = {
  minute: 60 * 1000,      // 1 minute
  hour: 60 * 60 * 1000,   // 1 hour
  day: 24 * 60 * 60 * 1000, // 1 day
};

/**
 * Get rate limit key (user ID or IP)
 */
function getRateLimitKey(req) {
  // Prefer user ID if authenticated
  if (req.user && req.user._id) {
    return `user:${req.user._id}`;
  }
  // Fall back to IP address
  return `ip:${req.ip || req.connection.remoteAddress}`;
}

/**
 * Check if request exceeds rate limit
 */
function isRateLimitExceeded(key, limit, windowSize) {
  const now = Date.now();
  const windowKey = `${key}:${windowSize}`;

  if (!requestCounts.has(windowKey)) {
    requestCounts.set(windowKey, {
      count: 0,
      resetTime: now + windowSize,
    });
  }

  const record = requestCounts.get(windowKey);

  // Reset if window has passed
  if (now >= record.resetTime) {
    record.count = 0;
    record.resetTime = now + windowSize;
  }

  // Check limit
  if (record.count >= limit) {
    return {
      exceeded: true,
      resetTime: record.resetTime,
      remaining: 0,
    };
  }

  // Increment count
  record.count++;

  return {
    exceeded: false,
    resetTime: record.resetTime,
    remaining: limit - record.count,
  };
}

/**
 * Rate limit middleware
 */
export const aiRateLimit = (req, res, next) => {
  const key = getRateLimitKey(req);

  // Check per-minute limit
  const minuteCheck = isRateLimitExceeded(key, RATE_LIMITS.perMinute, WINDOW_SIZES.minute);
  if (minuteCheck.exceeded) {
    const retryAfter = Math.ceil((minuteCheck.resetTime - Date.now()) / 1000);
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Too many AI requests. Please wait ${retryAfter} seconds.`,
      retryAfter,
      limit: RATE_LIMITS.perMinute,
      window: 'minute',
    });
  }

  // Check per-hour limit
  const hourCheck = isRateLimitExceeded(key, RATE_LIMITS.perHour, WINDOW_SIZES.hour);
  if (hourCheck.exceeded) {
    const retryAfter = Math.ceil((hourCheck.resetTime - Date.now()) / 1000);
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Hourly AI request limit reached. Please try again in ${Math.ceil(retryAfter / 60)} minutes.`,
      retryAfter,
      limit: RATE_LIMITS.perHour,
      window: 'hour',
    });
  }

  // Check per-day limit
  const dayCheck = isRateLimitExceeded(key, RATE_LIMITS.perDay, WINDOW_SIZES.day);
  if (dayCheck.exceeded) {
    const retryAfter = Math.ceil((dayCheck.resetTime - Date.now()) / 1000);
    return res.status(429).json({
      error: 'Rate limit exceeded',
      message: `Daily AI request limit reached. Resets in ${Math.ceil(retryAfter / 3600)} hours.`,
      retryAfter,
      limit: RATE_LIMITS.perDay,
      window: 'day',
    });
  }

  // Add rate limit info to response headers
  res.setHeader('X-RateLimit-Limit-Minute', RATE_LIMITS.perMinute);
  res.setHeader('X-RateLimit-Remaining-Minute', minuteCheck.remaining);
  res.setHeader('X-RateLimit-Reset-Minute', minuteCheck.resetTime);

  next();
};

/**
 * Clean up old rate limit records (run periodically)
 */
export function cleanupRateLimits() {
  const now = Date.now();
  for (const [key, record] of requestCounts.entries()) {
    if (now >= record.resetTime + WINDOW_SIZES.day) {
      requestCounts.delete(key);
    }
  }
}

// Clean up every hour
setInterval(cleanupRateLimits, 60 * 60 * 1000);

export default aiRateLimit;

