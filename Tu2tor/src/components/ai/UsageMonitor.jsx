import { useEffect, useState } from 'react';
import { useAI } from '../../context/AIContext';
import { formatCost, formatTokens } from '../../ai/utils/tokenCounter';

const UsageMonitor = () => {
  const { usageStats, usageTracker } = useAI();
  const [totalStats, setTotalStats] = useState(null);
  const [usagePercent, setUsagePercent] = useState(0);

  useEffect(() => {
    if (usageTracker) {
      const total = usageTracker.getTotalStats();
      const percent = usageTracker.getDailyUsagePercent();

      setTotalStats(total);
      setUsagePercent(percent);
    }
  }, [usageStats, usageTracker]);

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">Usage</h3>

      {/* Today's Usage Progress */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-gray-600">Today</span>
          <span className="text-sm font-semibold text-gray-900">
            {usagePercent.toFixed(1)}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className="h-full bg-primary-600 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(100, usagePercent)}%` }}
          />
        </div>
      </div>

      {/* Stats List */}
      <div className="space-y-3">
        {/* Requests */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Requests</span>
          <span className="text-sm font-semibold text-gray-900">
            {usageStats?.total?.requests || 0}
          </span>
        </div>

        {/* Tokens */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Tokens</span>
          <span className="text-sm font-semibold text-gray-900">
            {formatTokens(usageStats?.total?.tokens || 0)}
          </span>
        </div>

        {/* Cost */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Cost</span>
          <span className="text-sm font-semibold text-gray-900">
            {formatCost(usageStats?.total?.cost || 0)}
          </span>
        </div>
      </div>

      {/* By Provider */}
      {usageStats?.byProvider && Object.keys(usageStats.byProvider).length > 0 && (
        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="space-y-3">
            {Object.entries(usageStats.byProvider).map(([provider, stats]) => (
              <div key={provider} className="flex items-center justify-between">
                <span className="text-sm text-gray-600 capitalize">{provider}</span>
                <div className="text-right">
                  <p className="text-sm font-semibold text-gray-900">
                    {stats.requests || 0}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatCost(stats.cost || 0)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default UsageMonitor;
