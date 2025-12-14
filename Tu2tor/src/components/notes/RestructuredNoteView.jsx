import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, Eye, FileText, Sparkles, BarChart3, Clock, 
  ChevronDown, ChevronUp, BookOpen, Target, 
  Network, Zap, RefreshCw, Download, Share2
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AnimatedList from '../reactbits/AnimatedList/AnimatedList';

/**
 * Restructured Note View Component
 * Displays AI-restructured notes with knowledge graph, structured sections, and enhanced learning features
 */
const RestructuredNoteView = ({ note, onClose, onRestructure, onDownload, onShare, isRestructuring }) => {
  const [viewMode, setViewMode] = useState('restructured'); // 'restructured' | 'original' | 'compare'
  const [expandedSections, setExpandedSections] = useState({
    objectives: true,
    concepts: true,
    graph: true,
    exercises: true
  });

  // Extract restructured data
  const restructured = note.restructured || {};
  const { structure = {}, analysis = {}, mainConcepts = [], difficulty, estimatedReadTime, prerequisites = [] } = restructured;
  const { sections = [], introduction, summary, practiceExercises = [] } = structure;
  const { learningObjectives = [], knowledgeHierarchy = {} } = analysis;

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Markdown components for better rendering
  const MarkdownComponents = useMemo(() => ({
    h1: ({ children }) => (
      <h1 className="text-3xl font-bold text-gray-900 mb-4 pb-3 border-b-2 border-gray-200">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
        <span className="text-green-600">●</span>
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
    ),
    code({ inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      return !inline && match ? (
        <div className="my-4 rounded-lg overflow-hidden border border-gray-200">
          <div className="bg-gray-800 text-gray-400 px-4 py-2 text-xs font-mono flex items-center justify-between">
            <span>{match[1]}</span>
          </div>
          <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto">
            <code className="text-sm font-mono">{String(children).replace(/\n$/, '')}</code>
          </pre>
        </div>
      ) : (
        <code className="bg-green-100 text-green-800 px-1.5 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    },
    ul: ({ children }) => (
      <ul className="list-disc list-inside space-y-2 mb-4 text-gray-700">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="list-decimal list-inside space-y-2 mb-4 text-gray-700">{children}</ol>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-green-500 pl-4 py-2 my-4 bg-green-50 text-gray-700 italic">
        {children}
      </blockquote>
    ),
  }), []);

  // Difficulty badge color
  const difficultyColor = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700'
  }[difficulty] || 'bg-gray-100 text-gray-700';

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        className="bg-white w-full h-[90vh] flex overflow-hidden"
        style={{ maxWidth: '1600px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Sidebar - Metadata & Knowledge Graph */}
        <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50 overflow-hidden">
          {/* Header */}
          <div className="p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-2 mb-3">
              <Sparkles className="w-5 h-5 text-green-600" />
              <h3 className="font-bold text-gray-900">AI Restructured</h3>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <span className={`px-2 py-1 rounded font-medium ${difficultyColor}`}>
                {difficulty || 'intermediate'}
              </span>
              <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {estimatedReadTime || 5} min
              </span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* Learning Objectives */}
            {learningObjectives.length > 0 && (
              <div className="border-b border-gray-200 pb-6">
                <button
                  onClick={() => toggleSection('objectives')}
                  className="flex items-center justify-between w-full text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3"
                >
                  <span className="flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-green-600" />
                    Objectives
                  </span>
                  {expandedSections.objectives ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {expandedSections.objectives && (
                  <AnimatedList
                    items={learningObjectives}
                    renderItem={(obj, index) => (
                      <div key={index} className="flex items-start gap-2 text-xs text-gray-700 mb-2">
                        <span className="text-green-600 mt-0.5">✓</span>
                        <span className="flex-1">{obj}</span>
                      </div>
                    )}
                    className="space-y-2"
                    delay={0.05}
                    stagger={0.03}
                  />
                )}
              </div>
            )}

            {/* Core Concepts */}
            {mainConcepts.length > 0 && (
              <div className="border-b border-gray-200 pb-6">
                <button
                  onClick={() => toggleSection('concepts')}
                  className="flex items-center justify-between w-full text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3"
                >
                  <span className="flex items-center gap-2">
                    <Zap className="w-3.5 h-3.5 text-green-600" />
                    Core Concepts ({mainConcepts.length})
                  </span>
                  {expandedSections.concepts ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {expandedSections.concepts && (
                  <AnimatedList
                    items={mainConcepts}
                    renderItem={(concept, index) => (
                      <div key={index} className="flex items-center gap-2 text-xs text-gray-700 mb-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-600"></span>
                        <span className="font-medium">{concept}</span>
                      </div>
                    )}
                    className="space-y-2"
                    delay={0.05}
                    stagger={0.03}
                  />
                )}
              </div>
            )}

            {/* Knowledge Graph */}
            {(knowledgeHierarchy.parent || knowledgeHierarchy.children?.length > 0 || knowledgeHierarchy.related?.length > 0) && (
              <div className="border-b border-gray-200 pb-6">
                <button
                  onClick={() => toggleSection('graph')}
                  className="flex items-center justify-between w-full text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3"
                >
                  <span className="flex items-center gap-2">
                    <Network className="w-3.5 h-3.5 text-green-600" />
                    Knowledge Map
                  </span>
                  {expandedSections.graph ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {expandedSections.graph && (
                  <div className="space-y-3">
                    {knowledgeHierarchy.parent && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Parent Topic:</div>
                        <div className="text-xs text-gray-800 font-medium">{knowledgeHierarchy.parent}</div>
                      </div>
                    )}
                    {knowledgeHierarchy.children?.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Sub-topics:</div>
                        {knowledgeHierarchy.children.map((child, i) => (
                          <div key={i} className="text-xs text-gray-700 ml-3 mb-1">→ {child}</div>
                        ))}
                      </div>
                    )}
                    {knowledgeHierarchy.related?.length > 0 && (
                      <div>
                        <div className="text-xs text-gray-500 mb-1">Related:</div>
                        {knowledgeHierarchy.related.map((rel, i) => (
                          <div key={i} className="text-xs text-gray-700 ml-3 mb-1">↔ {rel}</div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Prerequisites */}
            {prerequisites.length > 0 && (
              <div>
                <div className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-2">Prerequisites</div>
                <div className="space-y-1">
                  {prerequisites.map((prereq, i) => (
                    <div key={i} className="text-xs text-gray-600 flex items-center gap-2">
                      <BookOpen className="w-3 h-3" />
                      {prereq}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Bar */}
          <div className="px-8 py-4 border-b border-gray-200 flex items-center justify-between bg-white">
            <div className="flex items-center gap-4">
              <h2 className="text-xl font-bold text-gray-900">{note.title}</h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setViewMode('restructured')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    viewMode === 'restructured' 
                      ? 'bg-green-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <Sparkles className="w-3 h-3 inline mr-1" />
                  Restructured
                </button>
                <button
                  onClick={() => setViewMode('original')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    viewMode === 'original' 
                      ? 'bg-gray-700 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <FileText className="w-3 h-3 inline mr-1" />
                  Original
                </button>
                <button
                  onClick={() => setViewMode('compare')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-colors ${
                    viewMode === 'compare' 
                      ? 'bg-blue-600 text-white' 
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  <BarChart3 className="w-3 h-3 inline mr-1" />
                  Compare
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {onRestructure && (
                <button
                  onClick={onRestructure}
                  disabled={isRestructuring}
                  className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                >
                  <RefreshCw className={`w-3 h-3 ${isRestructuring ? 'animate-spin' : ''}`} />
                  {isRestructuring ? 'Restructuring...' : 'Re-restructure'}
                </button>
              )}
              {onDownload && (
                <button
                  onClick={onDownload}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Download"
                >
                  <Download className="w-4 h-4" />
                </button>
              )}
              {onShare && (
                <button
                  onClick={onShare}
                  className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
                  title="Share"
                >
                  <Share2 className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
            <AnimatePresence mode="wait">
              {viewMode === 'restructured' && (
                <motion.div
                  key="restructured"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-4xl mx-auto prose prose-lg"
                >
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm]}
                    components={MarkdownComponents}
                  >
                    {note.content}
                  </ReactMarkdown>
                </motion.div>
              )}

              {viewMode === 'original' && note.originalMessages && (
                <motion.div
                  key="original"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-4xl mx-auto space-y-6"
                >
                  <div className="text-sm text-gray-500 mb-6">Original Conversation ({note.originalMessages.length} messages)</div>
                  {note.originalMessages.map((msg, i) => (
                    <div key={i} className="border-l-4 border-gray-300 pl-4 py-2">
                      <div className="text-xs font-semibold text-gray-500 mb-1">
                        {msg.role === 'user' ? '🙋 Student' : '🤖 AI'}
                      </div>
                      <div className="text-gray-700 whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  ))}
                </motion.div>
              )}

              {viewMode === 'compare' && (
                <motion.div
                  key="compare"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="max-w-6xl mx-auto grid grid-cols-2 gap-8"
                >
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <FileText className="w-5 h-5" />
                      Original
                    </h3>
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-4 text-sm space-y-2">
                      <div><span className="font-semibold">Format:</span> Linear Q&A</div>
                      <div><span className="font-semibold">Messages:</span> {note.originalMessages?.length || 0}</div>
                      <div><span className="font-semibold">Length:</span> {note.originalMessages?.reduce((acc, m) => acc + m.content.length, 0) || 0} chars</div>
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-green-600" />
                      Restructured
                    </h3>
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-sm space-y-2">
                      <div><span className="font-semibold">Format:</span> Structured Learning</div>
                      <div><span className="font-semibold">Sections:</span> {sections.length}</div>
                      <div><span className="font-semibold">Concepts:</span> {mainConcepts.length}</div>
                      <div><span className="font-semibold">Exercises:</span> {practiceExercises.length}</div>
                    </div>
                  </div>
                  <div className="col-span-2 mt-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-4">✨ AI Improvements</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {introduction && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="font-semibold text-gray-900 mb-1">Introduction</div>
                          <div className="text-sm text-gray-600">Contextual background added</div>
                        </div>
                      )}
                      {learningObjectives.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="font-semibold text-gray-900 mb-1">Learning Objectives</div>
                          <div className="text-sm text-gray-600">{learningObjectives.length} goals defined</div>
                        </div>
                      )}
                      {practiceExercises.length > 0 && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="font-semibold text-gray-900 mb-1">Practice Exercises</div>
                          <div className="text-sm text-gray-600">{practiceExercises.length} hands-on tasks</div>
                        </div>
                      )}
                      {knowledgeHierarchy.parent && (
                        <div className="bg-white border border-gray-200 rounded-lg p-4">
                          <div className="font-semibold text-gray-900 mb-1">Knowledge Graph</div>
                          <div className="text-sm text-gray-600">Topic relationships mapped</div>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default RestructuredNoteView;

