import React, { useState, useMemo, useRef } from 'react';
import { motion } from 'framer-motion';
import { X, Edit2, Download, Trash2, Save, Eye, FileText, BookOpen, Tag, Sparkles, List, ChevronDown, ChevronUp } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import AnimatedList from '../../components/reactbits/AnimatedList/AnimatedList';

const NoteDetailView = ({ note, onClose, onUpdate, onDelete, onDownload, MarkdownComponents }) => {
  const [editingNote, setEditingNote] = useState(null);
  const [editMode, setEditMode] = useState('preview');
  const [expandedSections, setExpandedSections] = useState({ sources: true, highlights: true, toc: true });
  const contentRef = useRef(null);

  // Extract Table of Contents from markdown
  const tableOfContents = useMemo(() => {
    if (!note.content) return [];
    const toc = [];
    const regex = /^(#{1,3})\s+(.+)$/gm;
    let match;
    while ((match = regex.exec(note.content)) !== null) {
      const level = match[1].length;
      const text = match[2];
      // Generate id that matches the one created by heading renderer
      const id = `heading-${text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}`;
      toc.push({ level, text, id });
    }
    return toc;
  }, [note.content]);

  // Enhanced Markdown Components with heading IDs for TOC navigation
  const enhancedMarkdownComponents = useMemo(() => {
    const generateHeadingId = (text) => {
      if (typeof text === 'string') {
        return `heading-${text.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}`;
      }
      // Handle array of children (when text contains formatting)
      if (Array.isArray(text)) {
        const textContent = text.map(child => 
          typeof child === 'string' ? child : child?.props?.children || ''
        ).join('');
        return `heading-${textContent.toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-')}`;
      }
      return '';
    };

    // Get original heading components or use defaults
    const originalH1 = MarkdownComponents?.h1;
    const originalH2 = MarkdownComponents?.h2;
    const originalH3 = MarkdownComponents?.h3;

    return {
      ...MarkdownComponents,
      h1: ({ children, ...props }) => {
        const id = generateHeadingId(children);
        if (originalH1) {
          // Wrap original component with id
          return <div id={id}>{originalH1({ children, ...props })}</div>;
        }
        return <h1 id={id} className="text-4xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-gray-200" {...props}>{children}</h1>;
      },
      h2: ({ children, ...props }) => {
        const id = generateHeadingId(children);
        if (originalH2) {
          return <div id={id}>{originalH2({ children, ...props })}</div>;
        }
        return <h2 id={id} className="text-2xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2" {...props}>{children}</h2>;
      },
      h3: ({ children, ...props }) => {
        const id = generateHeadingId(children);
        if (originalH3) {
          return <div id={id}>{originalH3({ children, ...props })}</div>;
        }
        return <h3 id={id} className="text-xl font-semibold text-gray-800 mt-6 mb-3" {...props}>{children}</h3>;
      }
    };
  }, [MarkdownComponents]);

  const handleSave = () => {
    onUpdate(editingNote);
    setEditingNote(null);
    setEditMode('preview');
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  const scrollToSection = (headingId) => {
    if (!contentRef.current) return;
    
    // Find the heading element with this id
    const headingElement = contentRef.current.querySelector(`#${headingId}`);
    if (headingElement) {
      headingElement.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'start',
        inline: 'nearest' 
      });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={() => {
        onClose();
        setEditingNote(null);
        setEditMode('preview');
      }}
    >
      <motion.div
        initial={{ scale: 0.98, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        className="bg-white border border-gray-300 w-full h-[90vh] flex"
        style={{ maxWidth: '1400px' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Left Sidebar - TOC & Metadata */}
        <div className="w-80 border-r border-gray-200 flex flex-col bg-white overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h3 className="font-semibold text-gray-900 text-sm mb-2">{note.title}</h3>
            <div className="flex items-center gap-2 text-xs">
              <span className="px-2 py-0.5 bg-gray-100 text-gray-700 font-medium">{note.subject}</span>
              <span className="text-gray-400">v{note.version || 1}</span>
            </div>
            {note.summary && (
              <p className="mt-3 text-xs text-gray-600 leading-relaxed">{note.summary}</p>
            )}
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
            {/* Table of Contents */}
            {tableOfContents.length > 0 && (
              <div className="border-b border-gray-100 pb-6">
                <button
                  onClick={() => toggleSection('toc')}
                  className="flex items-center justify-between w-full text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3"
                >
                  <span className="flex items-center gap-2">
                    <List className="w-3.5 h-3.5" />
                    Contents
                  </span>
                  {expandedSections.toc ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {expandedSections.toc && (
                  <AnimatedList
                    items={tableOfContents.map((item, i) => ({ ...item, uniqueId: `toc-${i}` }))}
                    className="space-y-0.5"
                    delay={0.03}
                    duration={0.25}
                    renderItem={(item) => (
                      <button
                        onClick={() => scrollToSection(item.id)}
                        className="block w-full text-left text-xs text-gray-600 hover:text-gray-900 px-2 py-1.5 transition-colors"
                        style={{ paddingLeft: `${(item.level - 1) * 12 + 8}px` }}
                      >
                        <span className="flex items-center gap-2">
                          <span className={`w-1 h-1 ${
                            item.level === 1 ? 'bg-gray-900' : 
                            item.level === 2 ? 'bg-gray-600' : 
                            'bg-gray-400'
                          }`}></span>
                          <span>{item.text}</span>
                        </span>
                      </button>
                    )}
                  />
                )}
              </div>
            )}

            {/* Highlights */}
            {note.highlights && note.highlights.length > 0 && (
              <div className="border-b border-gray-100 pb-6">
                <button
                  onClick={() => toggleSection('highlights')}
                  className="flex items-center justify-between w-full text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5" />
                    Highlights
                  </span>
                  {expandedSections.highlights ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {expandedSections.highlights && (
                  <AnimatedList
                    items={note.highlights.map((highlight, i) => ({ text: highlight, id: `highlight-${i}` }))}
                    className="space-y-2"
                    delay={0.04}
                    duration={0.3}
                    renderItem={(item) => (
                      <div className="text-xs text-gray-600 leading-relaxed flex items-start gap-2 hover:text-gray-900 transition-colors">
                        <span className="w-1 h-1 bg-gray-400 mt-1.5 flex-shrink-0"></span>
                        <span>{item.text}</span>
                      </div>
                    )}
                  />
                )}
              </div>
            )}

            {/* Sources */}
            {note.sources && note.sources.length > 0 && (
              <div className="border-b border-gray-100 pb-6">
                <button
                  onClick={() => toggleSection('sources')}
                  className="flex items-center justify-between w-full text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-3.5 h-3.5" />
                    Sources
                  </span>
                  {expandedSections.sources ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                </button>
                {expandedSections.sources && (
                  <AnimatedList
                    items={note.sources.map((src, i) => ({ ...src, id: `source-${i}` }))}
                    className="space-y-2"
                    delay={0.05}
                    duration={0.35}
                    renderItem={(src) => (
                      <div className="text-xs py-2 border-l-2 border-gray-200 pl-3 hover:border-gray-900 transition-colors">
                        <p className="font-medium text-gray-800 mb-1">
                          {src.title || 'Untitled'}
                        </p>
                        <span className="text-gray-500">p.{src.pages?.join(', ')}</span>
                      </div>
                    )}
                  />
                )}
              </div>
            )}

            {/* Tags */}
            {note.tags && note.tags.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-gray-900 uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Tag className="w-3.5 h-3.5" />
                  Tags
                </h4>
                <AnimatedList
                  items={note.tags.map((tag, i) => ({ text: tag, id: `tag-${i}` }))}
                  className="flex flex-wrap gap-2"
                  itemClassName=""
                  delay={0.03}
                  duration={0.25}
                  renderItem={(item) => (
                    <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs hover:bg-gray-900 hover:text-white transition-colors cursor-default">
                      {item.text}
                    </span>
                  )}
                />
              </div>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-white">
            <div className="flex items-center gap-2">
              {editingNote ? (
                <>
                  <button
                    onClick={() => setEditMode('edit')}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      editMode === 'edit' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Edit2 className="w-3 h-3 inline mr-1" />
                    Edit
                  </button>
                  <button
                    onClick={() => setEditMode('preview')}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      editMode === 'preview' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <Eye className="w-3 h-3 inline mr-1" />
                    Preview
                  </button>
                  <button
                    onClick={() => setEditMode('split')}
                    className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                      editMode === 'split' ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <FileText className="w-3 h-3 inline mr-1" />
                    Split
                  </button>
                </>
              ) : (
                <span className="text-sm text-gray-500">Last updated: {new Date(note.updatedAt).toLocaleString()}</span>
              )}
            </div>
            
            <div className="flex items-center gap-2">
              {editingNote ? (
                <>
                  <button
                    onClick={() => setEditingNote(null)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                  <button
                    onClick={handleSave}
                    className="flex items-center gap-2 px-4 py-2 bg-gray-900 text-white hover:bg-black transition-colors text-sm font-medium"
                  >
                    <Save className="w-4 h-4" />
                    Save
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => setEditingNote({ ...note })}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    title="Edit"
                  >
                    <Edit2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDownload(note)}
                    className="p-2 hover:bg-gray-100 transition-colors"
                    title="Download"
                  >
                    <Download className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => onDelete(note._id)}
                    className="p-2 hover:bg-red-50 hover:text-red-600 transition-colors"
                    title="Delete"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-hidden">
            {editingNote ? (
              <div className="h-full flex">
              {/* Edit View */}
              {(editMode === 'edit' || editMode === 'split') && (
                <div className={`${editMode === 'split' ? 'w-1/2 border-r border-gray-200' : 'w-full'} overflow-y-auto p-6`}>
                  <textarea
                    value={editingNote.content}
                    onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                    className="w-full h-full min-h-[500px] p-6 bg-white border border-gray-200 focus:border-gray-900 outline-none font-mono text-sm leading-relaxed resize-none"
                    placeholder="Write your markdown here..."
                  />
                </div>
              )}
              
              {/* Preview View */}
              {(editMode === 'preview' || editMode === 'split') && (
                <div ref={editMode === 'preview' || editMode === 'split' ? contentRef : null} className={`${editMode === 'split' ? 'w-1/2' : 'w-full'} overflow-y-auto p-8 bg-white`}>
                  <div className="prose prose-lg max-w-none">
                    <ReactMarkdown remarkPlugins={[remarkGfm]} components={enhancedMarkdownComponents}>
                      {editingNote.content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
              </div>
            ) : (
              <div ref={contentRef} className="h-full overflow-y-auto p-8 bg-gradient-to-br from-gray-50 to-white">
                <div className="max-w-4xl mx-auto prose prose-lg">
                  <ReactMarkdown remarkPlugins={[remarkGfm]} components={enhancedMarkdownComponents}>
                    {note.content}
                  </ReactMarkdown>
                </div>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default NoteDetailView;

