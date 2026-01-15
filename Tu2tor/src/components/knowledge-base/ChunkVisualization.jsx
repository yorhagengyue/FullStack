import React, { useState, useEffect } from 'react';
import { knowledgeBaseAPI } from '../../services/api';
import { BarChart2, FileText, AlignLeft, Hash, Maximize2, Minimize2, RefreshCw, Loader2 } from 'lucide-react';

const ChunkVisualization = ({ documentId }) => {
  const [chunks, setChunks] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedChunks, setExpandedChunks] = useState(new Set());

  useEffect(() => {
    if (documentId) {
      fetchChunks();
    }
  }, [documentId]);

  const fetchChunks = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await knowledgeBaseAPI.getChunks(documentId);
      setChunks(response.chunks || []);
      setStats(response.stats || null);
    } catch (err) {
      console.error('Failed to fetch chunks:', err);
      setError(err.message || 'Failed to load chunks');
    } finally {
      setLoading(false);
    }
  };

  const toggleChunk = (chunkId) => {
    const newExpanded = new Set(expandedChunks);
    if (newExpanded.has(chunkId)) {
      newExpanded.delete(chunkId);
    } else {
      newExpanded.add(chunkId);
    }
    setExpandedChunks(newExpanded);
  };

  const getChunkTypeStyle = (type) => {
    switch (type) {
      case 'semantic': return { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' };
      case 'paragraph': return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
      case 'section': return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' };
      default: return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-96">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <RefreshCw className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
        <p className="text-gray-600 font-medium">Analyzing document structure...</p>
      </div>
    );
  }

  if (error) {
    // Check if error is due to processing not complete
    const isProcessingError = error.toLowerCase().includes('not processed') || 
                               error.toLowerCase().includes('processing') ||
                               error.toLowerCase().includes('not found');
    
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center px-6">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <FileText className="w-8 h-8 text-gray-400" />
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">
          {isProcessingError ? 'Document Processing In Progress' : 'Unable to Load Chunks'}
        </h3>
        <p className="text-gray-500 mb-6 max-w-sm leading-relaxed">
          {isProcessingError 
            ? 'This document is currently being processed by our AI system. Chunks will be available once processing is complete. Please check back in a few moments.' 
            : error}
        </p>
        {!isProcessingError && (
          <button 
            onClick={fetchChunks} 
            className="px-6 py-2.5 bg-black hover:bg-gray-800 text-white rounded-full font-medium transition-colors shadow-lg"
          >
            Try Again
          </button>
        )}
      </div>
    );
  }

  if (!chunks || chunks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-96 text-center">
        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
          <Loader2 className="w-8 h-8 text-gray-400 animate-spin" />
        </div>
        <p className="text-gray-600 font-medium">Processing document...</p>
        <p className="text-sm text-gray-400 mt-2">Chunks are being generated. This may take a few moments.</p>
      </div>
    );
  }

  return (
    <div className="p-6 md:p-8 bg-gray-50 min-h-full">
      {/* Statistics Section */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-indigo-50 rounded-xl flex items-center justify-center">
              <BarChart2 className="w-6 h-6 text-indigo-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Total Chunks</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalChunks}</p>
            </div>
          </div>
          
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center">
              <AlignLeft className="w-6 h-6 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Avg Tokens</p>
              <p className="text-2xl font-bold text-gray-900">{Math.round(stats.avgTokens)}</p>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 bg-purple-50 rounded-xl flex items-center justify-center">
              <Hash className="w-6 h-6 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500 font-medium uppercase tracking-wide">Total Tokens</p>
              <p className="text-2xl font-bold text-gray-900">{stats.totalTokens.toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}

      {/* Chunks List - Timeline Style */}
      <div className="relative pl-8 space-y-8">
        {/* Continuous Vertical Line */}
        <div className="absolute left-[19px] top-4 bottom-0 w-0.5 bg-gray-200"></div>

        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <FileText className="w-6 h-6 text-gray-800" />
            Chunks Sequence
          </h3>
          <span className="text-sm text-gray-500 font-medium bg-white px-4 py-1.5 rounded-full border border-gray-200 shadow-sm">
            {chunks.length} segments
          </span>
        </div>

        <div className="space-y-8">
          {chunks.map((chunk, index) => {
            const isExpanded = expandedChunks.has(chunk._id);
            const contentPreview = chunk.content.slice(0, 250);
            const needsTruncation = chunk.content.length > 250;
            const typeStyle = getChunkTypeStyle(chunk.metadata.chunkType);

            return (
              <div key={chunk._id} className="relative group">
                {/* Timeline Node - Left Side */}
                <div className="absolute -left-[34px] top-0 flex flex-col items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-sm z-10 border-4 border-gray-50 ${typeStyle.bg} ${typeStyle.text}`}>
                    {index + 1}
                  </div>
                </div>

                {/* Content Card - Right Side */}
                <div 
                  className={`bg-white rounded-[2rem] border transition-all duration-300 overflow-hidden ${
                    isExpanded 
                      ? 'shadow-lg border-indigo-200 ring-1 ring-indigo-50 transform scale-[1.01]' 
                      : 'border-gray-200 hover:border-gray-300 hover:shadow-md'
                  }`}
                >
                  <div className="p-6">
                    {/* Header: Type & Metrics */}
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4 border-b border-gray-100 pb-4">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border ${typeStyle.bg} ${typeStyle.text} ${typeStyle.border}`}>
                        {chunk.metadata.chunkType}
                      </span>
                      
                      <div className="flex items-center gap-4 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                        <span className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                          {chunk.metadata.tokenCount} tokens
                        </span>
                        <span className="flex items-center gap-1.5">
                          <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                          {chunk.metadata.charCount} chars
                        </span>
                      </div>
                    </div>

                    {/* Summary Section (if exists) */}
                    {chunk.metadata.summary && (
                      <div className="mb-5 p-5 bg-gray-50/80 rounded-2xl border border-gray-100">
                        <div className="flex items-center gap-2 mb-2 text-gray-900 font-bold text-sm">
                           <AlignLeft className="w-4 h-4 text-gray-500" />
                           Summary
                        </div>
                        <p className="text-sm text-gray-600 leading-relaxed font-medium">
                          {chunk.metadata.summary}
                        </p>
                      </div>
                    )}

                    {/* Main Content */}
                    <div className="relative">
                      <p className={`text-[15px] text-gray-600 leading-7 font-normal font-sans ${!isExpanded ? 'line-clamp-3' : ''}`}>
                        {chunk.content}
                      </p>
                      
                      {/* Gradient Overlay for truncated text */}
                      {!isExpanded && needsTruncation && (
                        <div className="absolute bottom-0 left-0 right-0 h-16 bg-gradient-to-t from-white via-white/90 to-transparent"></div>
                      )}
                    </div>
                  </div>

                  {/* Expand/Collapse Action */}
                  {needsTruncation && (
                    <button
                      className={`w-full py-3 text-xs font-bold uppercase tracking-widest transition-colors flex items-center justify-center gap-2 ${
                        isExpanded 
                          ? 'bg-gray-50 text-gray-500 hover:bg-gray-100 border-t border-gray-100' 
                          : 'bg-white text-gray-900 hover:bg-gray-50 border-t border-gray-100'
                      }`}
                      onClick={() => toggleChunk(chunk._id)}
                    >
                      {isExpanded ? (
                        <>
                          <Minimize2 className="w-3.5 h-3.5" />
                          Collapse
                        </>
                      ) : (
                        <>
                          <Maximize2 className="w-3.5 h-3.5" />
                          Read More
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default ChunkVisualization;
