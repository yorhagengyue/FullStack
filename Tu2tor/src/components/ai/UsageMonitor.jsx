/**
 * UsageMonitor - Display AI usage statistics from backend
 */

import { useEffect, useState } from 'react';
import { useAI } from '../../context/AIContext';
import { Activity, DollarSign, Zap } from 'lucide-react';

const UsageMonitor = () => {
  const { getUsageStats, isInitialized } = useAI();
  const [stats, setStats] = useState({
    totalRequests: 0,
    totalTokens: 0,
    totalCost: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      if (!isInitialized) return;
      
      try {
        const backendStats = await getUsageStats();
        if (backendStats) {
          setStats({
            totalRequests: backendStats.totalRequests || 0,
            totalTokens: backendStats.totalTokens || 0,
            totalCost: backendStats.totalCost || 0,
          });
        }
      } catch (error) {
        console.error('[UsageMonitor] Failed to fetch stats:', error);
      }
    };

    fetchStats();
    const interval = setInterval(fetchStats, 10000); // Update every 10 seconds

    return () => clearInterval(interval);
  }, [isInitialized, getUsageStats]);

  const formatTokens = (tokens) => {
    if (tokens >= 1000000) return `${(tokens / 1000000).toFixed(2)}M`;
    if (tokens >= 1000) return `${(tokens / 1000).toFixed(1)}K`;
    return tokens.toString();
  };

  const formatCost = (cost) => {
    return `$${cost.toFixed(4)}`;
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">AI Usage</h3>

      {/* Stats List */}
      <div className="space-y-4">
        {/* Requests */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">Requests</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {stats.totalRequests}
          </span>
        </div>

        {/* Tokens */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-600" />
            <span className="text-sm text-gray-600">Tokens</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {formatTokens(stats.totalTokens)}
          </span>
        </div>

        {/* Cost */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Cost</span>
          </div>
          <span className="text-sm font-semibold text-gray-900">
            {formatCost(stats.totalCost)}
          </span>
        </div>
      </div>

      {/* Info */}
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-xs text-gray-500">
          Statistics are updated every 10 seconds from the server.
        </p>
      </div>
    </div>
  );
};

export default UsageMonitor;
