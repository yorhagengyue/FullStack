import { useEffect, useState } from 'react';
import { useAI } from '../../context/AIContext';
import { formatCost, formatTokens } from '../../ai/utils/tokenCounter';
import { TrendingUp, DollarSign, Zap, BarChart3, AlertTriangle } from 'lucide-react';

const UsageMonitor = () => {
  const { usageStats, usageTracker } = useAI();
  const [totalStats, setTotalStats] = useState(null);
  const [usagePercent, setUsagePercent] = useState(0);
  const [costSavings, setCostSavings] = useState(null);

  useEffect(() => {
    if (usageTracker) {
      const total = usageTracker.getTotalStats();
      const percent = usageTracker.getDailyUsagePercent();
      const savings = usageTracker.getCostSavings();

      setTotalStats(total);
      setUsagePercent(percent);
      setCostSavings(savings);
    }
  }, [usageStats, usageTracker]);

  const isApproachingLimit = usagePercent >= 80;

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">AI Usage Statistics</h3>

      {/* Today's Usage */}
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Today's Usage</span>
            <span className="text-sm font-bold text-primary-600">
              {usagePercent.toFixed(1)}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                isApproachingLimit
                  ? 'bg-gradient-to-r from-yellow-500 to-red-500'
                  : 'bg-gradient-to-r from-primary-500 to-purple-500'
              }`}
              style={{ width: `${Math.min(100, usagePercent)}%` }}
            />
          </div>
          {isApproachingLimit && (
            <div className="mt-2 p-2 bg-yellow-50 rounded flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-yellow-800">
                You're approaching your daily limit. Consider switching to offline mode.
              </p>
            </div>
          )}
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3">
          {/* Requests */}
          <div className="p-3 bg-blue-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-medium text-blue-900">Requests</span>
            </div>
            <p className="text-2xl font-bold text-blue-900">
              {usageStats?.total?.requests || 0}
            </p>
            <p className="text-xs text-blue-700 mt-1">Today</p>
          </div>

          {/* Tokens */}
          <div className="p-3 bg-purple-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <Zap className="w-4 h-4 text-purple-600" />
              <span className="text-xs font-medium text-purple-900">Tokens</span>
            </div>
            <p className="text-2xl font-bold text-purple-900">
              {formatTokens(usageStats?.total?.tokens || 0)}
            </p>
            <p className="text-xs text-purple-700 mt-1">Used today</p>
          </div>

          {/* Cost */}
          <div className="p-3 bg-green-50 rounded-lg">
            <div className="flex items-center space-x-2 mb-1">
              <DollarSign className="w-4 h-4 text-green-600" />
              <span className="text-xs font-medium text-green-900">Cost</span>
            </div>
            <p className="text-2xl font-bold text-green-900">
              {formatCost(usageStats?.total?.cost || 0)}
            </p>
            <p className="text-xs text-green-700 mt-1">Today</p>
          </div>

          {/* Savings */}
          {costSavings && (
            <div className="p-3 bg-orange-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-1">
                <BarChart3 className="w-4 h-4 text-orange-600" />
                <span className="text-xs font-medium text-orange-900">Saved</span>
              </div>
              <p className="text-2xl font-bold text-orange-900">
                {formatCost(costSavings.savedByCost)}
              </p>
              <p className="text-xs text-orange-700 mt-1">Using Ollama</p>
            </div>
          )}
        </div>

        {/* By Provider */}
        {usageStats?.byProvider && Object.keys(usageStats.byProvider).length > 0 && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">By Provider</h4>
            <div className="space-y-2">
              {Object.entries(usageStats.byProvider).map(([provider, stats]) => (
                <div key={provider} className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`w-2 h-2 rounded-full ${
                        provider === 'gemini' ? 'bg-blue-500' : 'bg-green-500'
                      }`}
                    />
                    <span className="text-sm text-gray-700 capitalize">{provider}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-gray-900">
                      {stats.requests || 0} requests
                    </p>
                    <p className="text-xs text-gray-500">
                      {formatTokens(stats.tokens || 0)} • {formatCost(stats.cost || 0)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* All Time Stats */}
        {totalStats && (
          <div className="pt-4 border-t border-gray-200">
            <h4 className="text-sm font-semibold text-gray-700 mb-3">All Time</h4>
            <div className="grid grid-cols-3 gap-3 text-center">
              <div>
                <p className="text-lg font-bold text-gray-900">{totalStats.requests}</p>
                <p className="text-xs text-gray-600">Total Requests</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {formatTokens(totalStats.tokens)}
                </p>
                <p className="text-xs text-gray-600">Total Tokens</p>
              </div>
              <div>
                <p className="text-lg font-bold text-gray-900">
                  {formatCost(totalStats.cost)}
                </p>
                <p className="text-xs text-gray-600">Total Cost</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsageMonitor;
