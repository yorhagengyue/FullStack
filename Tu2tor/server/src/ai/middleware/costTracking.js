/**
 * Cost Tracking Middleware for AI endpoints
 * 
 * Monitors AI usage costs and enforces budget limits
 */

const userCosts = new Map(); // userId -> { daily, monthly, lastReset }

// Configuration
const COST_LIMITS = {
  dailyPerUser: parseFloat(process.env.AI_MAX_DAILY_COST_PER_USER) || 1.00,  // $1 per user per day
  totalDaily: parseFloat(process.env.AI_MAX_DAILY_COST_TOTAL) || 50.00,      // $50 total per day
  warnThreshold: parseFloat(process.env.AI_WARN_COST_THRESHOLD) || 0.70,     // Warn at 70%
};

let totalDailyCost = 0;
let lastDailyReset = new Date().setHours(0, 0, 0, 0);

/**
 * Reset daily costs if needed
 */
function resetDailyCostsIfNeeded() {
  const now = Date.now();
  const todayStart = new Date().setHours(0, 0, 0, 0);

  if (now >= todayStart && lastDailyReset < todayStart) {
    console.log('[Cost Tracking] Resetting daily costs');
    totalDailyCost = 0;
    lastDailyReset = todayStart;
    userCosts.clear();
  }
}

/**
 * Get user cost record
 */
function getUserCostRecord(userId) {
  if (!userCosts.has(userId)) {
    userCosts.set(userId, {
      daily: 0,
      monthly: 0,
      lastReset: Date.now(),
    });
  }
  return userCosts.get(userId);
}

/**
 * Check if cost limit would be exceeded
 */
export const checkCostLimit = (req, res, next) => {
  resetDailyCostsIfNeeded();

  // Check total daily limit
  if (totalDailyCost >= COST_LIMITS.totalDaily) {
    // Calculate midnight tomorrow correctly
    const tomorrow = new Date();
    tomorrow.setHours(0, 0, 0, 0);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    return res.status(503).json({
      success: false,
      error: 'Service temporarily unavailable',
      message: 'Daily AI cost limit reached. Please try again tomorrow.',
      resetTime: tomorrow.getTime(),
    });
  }

  // Check per-user daily limit (if authenticated)
  if (req.user && req.user._id) {
    const userCost = getUserCostRecord(req.user._id.toString());

    if (userCost.daily >= COST_LIMITS.dailyPerUser) {
      // Calculate midnight tomorrow correctly
      const tomorrow = new Date();
      tomorrow.setHours(0, 0, 0, 0);
      tomorrow.setDate(tomorrow.getDate() + 1);
      
      return res.status(429).json({
        success: false,
        error: 'Daily limit reached',
        message: `You've reached your daily AI usage limit ($${COST_LIMITS.dailyPerUser}). Resets tomorrow.`,
        currentCost: userCost.daily.toFixed(4),
        limit: COST_LIMITS.dailyPerUser,
        resetTime: tomorrow.getTime(),
      });
    }

    // Warn if approaching limit
    if (userCost.daily >= COST_LIMITS.dailyPerUser * COST_LIMITS.warnThreshold) {
      res.setHeader('X-Cost-Warning', 'Approaching daily limit');
      res.setHeader('X-Cost-Remaining', (COST_LIMITS.dailyPerUser - userCost.daily).toFixed(4));
    }
  }

  next();
};

/**
 * Track cost after AI request (call this in controllers after AI response)
 */
export function trackCost(userId, cost) {
  resetDailyCostsIfNeeded();

  // Track total cost
  totalDailyCost += cost;

  // Track user cost
  if (userId) {
    const userCost = getUserCostRecord(userId.toString());
    userCost.daily += cost;
    userCost.monthly += cost;

    console.log(`[Cost Tracking] User ${userId}: $${cost.toFixed(4)} (Daily: $${userCost.daily.toFixed(4)})`);
  }

  // Log warnings
  if (totalDailyCost >= COST_LIMITS.totalDaily * COST_LIMITS.warnThreshold) {
    console.warn(`[Cost Tracking] WARNING: Approaching daily cost limit ($${totalDailyCost.toFixed(2)} / $${COST_LIMITS.totalDaily})`);
  }
}

/**
 * Get cost statistics
 */
export function getCostStats() {
  resetDailyCostsIfNeeded();

  return {
    totalDaily: totalDailyCost,
    totalDailyLimit: COST_LIMITS.totalDaily,
    utilizationPercent: (totalDailyCost / COST_LIMITS.totalDaily * 100).toFixed(2),
    userCount: userCosts.size,
    lastReset: new Date(lastDailyReset).toISOString(),
  };
}

export default { checkCostLimit, trackCost, getCostStats };

