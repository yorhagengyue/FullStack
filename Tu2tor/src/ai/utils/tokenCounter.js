/**
 * Token Counter & Usage Tracker
 *
 * Tracks AI API usage, costs, and enforces limits to prevent unexpected charges
 */

const STORAGE_KEY = 'tu2tor_ai_usage';
const DAILY_LIMIT_KEY = 'tu2tor_ai_daily_limit';

export class UsageTracker {
  constructor() {
    this.dailyUsage = this.loadFromStorage();
    this.maxTokensPerRequest = parseInt(import.meta.env.VITE_MAX_TOKENS_PER_REQUEST) || 2000;
    this.dailyTokenLimit = parseInt(import.meta.env.VITE_DAILY_TOKEN_LIMIT) || 100000;
  }

  /**
   * Load usage data from localStorage
   */
  loadFromStorage() {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (error) {
      console.error('[UsageTracker] Failed to load from storage:', error);
    }

    return {};
  }

  /**
   * Save usage data to localStorage
   */
  saveToStorage() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(this.dailyUsage));
    } catch (error) {
      console.error('[UsageTracker] Failed to save to storage:', error);
    }
  }

  /**
   * Get today's date key
   */
  getTodayKey() {
    return new Date().toDateString();
  }

  /**
   * Track a new AI request
   */
  trackRequest(provider, tokens, cost, metadata = {}) {
    const today = this.getTodayKey();

    if (!this.dailyUsage[today]) {
      this.dailyUsage[today] = {
        total: { tokens: 0, cost: 0, requests: 0 },
        byProvider: {},
      };
    }

    // Update total stats
    this.dailyUsage[today].total.tokens += tokens;
    this.dailyUsage[today].total.cost += cost;
    this.dailyUsage[today].total.requests += 1;

    // Update provider-specific stats
    if (!this.dailyUsage[today].byProvider[provider]) {
      this.dailyUsage[today].byProvider[provider] = {
        tokens: 0,
        cost: 0,
        requests: 0,
        models: {},
      };
    }

    const providerStats = this.dailyUsage[today].byProvider[provider];
    providerStats.tokens += tokens;
    providerStats.cost += cost;
    providerStats.requests += 1;

    // Track by model
    if (metadata.model) {
      if (!providerStats.models[metadata.model]) {
        providerStats.models[metadata.model] = { tokens: 0, cost: 0, requests: 0 };
      }
      providerStats.models[metadata.model].tokens += tokens;
      providerStats.models[metadata.model].cost += cost;
      providerStats.models[metadata.model].requests += 1;
    }

    this.saveToStorage();

    return this.getDailyStats();
  }

  /**
   * Check if a request would exceed limits
   */
  checkLimit(requestTokens) {
    const today = this.getTodayKey();
    const todayStats = this.dailyUsage[today]?.total || { tokens: 0, cost: 0, requests: 0 };

    const wouldExceedDaily = todayStats.tokens + requestTokens > this.dailyTokenLimit;
    const wouldExceedPerRequest = requestTokens > this.maxTokensPerRequest;

    return {
      allowed: !wouldExceedDaily && !wouldExceedPerRequest,
      currentUsage: todayStats.tokens,
      requestTokens,
      dailyLimit: this.dailyTokenLimit,
      perRequestLimit: this.maxTokensPerRequest,
      remainingToday: Math.max(0, this.dailyTokenLimit - todayStats.tokens),
      wouldExceedDaily,
      wouldExceedPerRequest,
    };
  }

  /**
   * Get today's usage statistics
   */
  getDailyStats() {
    const today = this.getTodayKey();
    return (
      this.dailyUsage[today] || {
        total: { tokens: 0, cost: 0, requests: 0 },
        byProvider: {},
      }
    );
  }

  /**
   * Get usage history for the past N days
   */
  getHistoricalStats(days = 7) {
    const history = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      const dateKey = date.toDateString();

      history.push({
        date: dateKey,
        stats: this.dailyUsage[dateKey] || {
          total: { tokens: 0, cost: 0, requests: 0 },
          byProvider: {},
        },
      });
    }

    return history.reverse();
  }

  /**
   * Get total usage across all time
   */
  getTotalStats() {
    const total = {
      tokens: 0,
      cost: 0,
      requests: 0,
      days: 0,
      byProvider: {},
    };

    Object.values(this.dailyUsage).forEach((dayStats) => {
      total.tokens += dayStats.total.tokens || 0;
      total.cost += dayStats.total.cost || 0;
      total.requests += dayStats.total.requests || 0;
      total.days += 1;

      // Aggregate by provider
      Object.entries(dayStats.byProvider || {}).forEach(([provider, stats]) => {
        if (!total.byProvider[provider]) {
          total.byProvider[provider] = { tokens: 0, cost: 0, requests: 0 };
        }
        total.byProvider[provider].tokens += stats.tokens || 0;
        total.byProvider[provider].cost += stats.cost || 0;
        total.byProvider[provider].requests += stats.requests || 0;
      });
    });

    return total;
  }

  /**
   * Check if approaching daily limit
   */
  isApproachingLimit(thresholdPercent = 80) {
    const stats = this.getDailyStats();
    const usagePercent = (stats.total.tokens / this.dailyTokenLimit) * 100;
    return usagePercent >= thresholdPercent;
  }

  /**
   * Get usage percentage for today
   */
  getDailyUsagePercent() {
    const stats = this.getDailyStats();
    return Math.min(100, (stats.total.tokens / this.dailyTokenLimit) * 100);
  }

  /**
   * Reset today's usage (use with caution)
   */
  resetToday() {
    const today = this.getTodayKey();
    delete this.dailyUsage[today];
    this.saveToStorage();
  }

  /**
   * Clear all usage data (use with caution)
   */
  clearAll() {
    this.dailyUsage = {};
    this.saveToStorage();
  }

  /**
   * Clean up old data (keep only last 30 days)
   */
  cleanup(daysToKeep = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const newUsage = {};
    Object.entries(this.dailyUsage).forEach(([dateKey, stats]) => {
      const date = new Date(dateKey);
      if (date >= cutoffDate) {
        newUsage[dateKey] = stats;
      }
    });

    this.dailyUsage = newUsage;
    this.saveToStorage();

    console.log('[UsageTracker] Cleaned up data older than', daysToKeep, 'days');
  }

  /**
   * Export usage data as CSV
   */
  exportAsCSV() {
    const lines = ['Date,Provider,Model,Tokens,Cost,Requests'];

    Object.entries(this.dailyUsage).forEach(([date, dayStats]) => {
      Object.entries(dayStats.byProvider || {}).forEach(([provider, providerStats]) => {
        if (providerStats.models) {
          Object.entries(providerStats.models).forEach(([model, modelStats]) => {
            lines.push(
              `${date},${provider},${model},${modelStats.tokens},${modelStats.cost.toFixed(4)},${modelStats.requests}`
            );
          });
        } else {
          lines.push(
            `${date},${provider},All,${providerStats.tokens},${providerStats.cost.toFixed(4)},${providerStats.requests}`
          );
        }
      });
    });

    return lines.join('\n');
  }

  /**
   * Get cost savings by using free provider (Ollama)
   */
  getCostSavings() {
    const total = this.getTotalStats();
    const ollamaStats = total.byProvider.ollama || { tokens: 0, cost: 0, requests: 0 };

    // Estimate what Ollama requests would have cost with Gemini
    const estimatedGeminiCost = (ollamaStats.tokens / 1000) * 0.00075; // Average Gemini rate

    return {
      actualCost: total.cost,
      savedByCost: estimatedGeminiCost,
      ollamaTokens: ollamaStats.tokens,
      totalTokens: total.tokens,
      savingsPercent:
        total.tokens > 0 ? ((ollamaStats.tokens / total.tokens) * 100).toFixed(1) : 0,
    };
  }
}

// Create and export singleton instance
const usageTracker = new UsageTracker();
export default usageTracker;

/**
 * Estimate tokens from text (rough approximation)
 */
export function estimateTokens(text) {
  // Very rough estimate: ~4 characters per token on average
  return Math.ceil(text.length / 4);
}

/**
 * Format cost for display
 */
export function formatCost(cost) {
  if (cost === 0) return 'Free';
  if (cost < 0.01) return `$${cost.toFixed(4)}`;
  return `$${cost.toFixed(2)}`;
}

/**
 * Format token count for display
 */
export function formatTokens(tokens) {
  if (tokens >= 1000000) {
    return `${(tokens / 1000000).toFixed(1)}M`;
  }
  if (tokens >= 1000) {
    return `${(tokens / 1000).toFixed(1)}K`;
  }
  return tokens.toString();
}
