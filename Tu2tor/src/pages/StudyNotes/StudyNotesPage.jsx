import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen,
  Search,
  Filter,
  Download,
  Trash2,
  Edit2,
  Eye,
  X,
  Calendar,
  Tag,
  FileText,
  Code,
  Image as ImageIcon,
  Loader2,
  ChevronDown,
  Save,
  Check
} from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { studyNotesAPI } from '../../services/api';
import TopBar from '../../components/layout/TopBar';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Toast from '../../components/ui/Toast';

const StudyNotesPage = () => {
  const [notes, setNotes] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [tags, setTags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [selectedTags, setSelectedTags] = useState([]);
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'
  const [selectedNote, setSelectedNote] = useState(null);
  const [showNoteModal, setShowNoteModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [showFilterPanel, setShowFilterPanel] = useState(false);
  const [editMode, setEditMode] = useState('preview'); // 'edit' or 'preview' or 'split'
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, noteId: null });
  const [toast, setToast] = useState({ isOpen: false, message: '', type: 'success' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [notesData, subjectsData, tagsData] = await Promise.all([
        studyNotesAPI.getStudyNotes(),
        studyNotesAPI.getSubjects(),
        studyNotesAPI.getTags()
      ]);
      setNotes(notesData);
      setSubjects(subjectsData);
      setTags(tagsData);
    } catch (error) {
      console.error('Error fetching study notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    setLoading(true);
    try {
      const params = {};
      if (searchQuery) params.search = searchQuery;
      if (selectedSubject) params.subject = selectedSubject;
      if (selectedTags.length > 0) params.tags = selectedTags.join(',');
      
      const data = await studyNotesAPI.getStudyNotes(params);
      setNotes(data);
    } catch (error) {
      console.error('Error searching notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewNote = async (noteId) => {
    try {
      const note = await studyNotesAPI.getStudyNote(noteId);
      setSelectedNote(note);
      setShowNoteModal(true);
    } catch (error) {
      console.error('Error fetching note:', error);
    }
  };

  const handleDeleteNote = (noteId) => {
    setConfirmDialog({ isOpen: true, noteId });
  };

  const confirmDelete = async () => {
    const noteId = confirmDialog.noteId;
    try {
      await studyNotesAPI.deleteStudyNote(noteId);
      setNotes(notes.filter(n => n._id !== noteId));
      if (selectedNote?._id === noteId) {
        setShowNoteModal(false);
        setSelectedNote(null);
      }
      setToast({ isOpen: true, message: 'Note deleted successfully!', type: 'success' });
    } catch (error) {
      console.error('Error deleting note:', error);
      setToast({ isOpen: true, message: 'Failed to delete note', type: 'error' });
    }
  };

  const handleDownloadNote = (note) => {
    const blob = new Blob([note.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleUpdateNote = async () => {
    if (!editingNote) return;
    
    try {
      const updated = await studyNotesAPI.updateStudyNote(editingNote._id, {
        title: editingNote.title,
        subject: editingNote.subject,
        content: editingNote.content,
        tags: editingNote.tags
      });
      
      setNotes(notes.map(n => n._id === updated._id ? updated : n));
      setSelectedNote(updated);
      setEditingNote(null);
      setEditMode('preview');
      setToast({ isOpen: true, message: 'Note updated successfully!', type: 'success' });
    } catch (error) {
      console.error('Error updating note:', error);
      setToast({ isOpen: true, message: 'Failed to update note', type: 'error' });
    }
  };

  const toggleTag = (tag) => {
    setSelectedTags(prev => 
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const clearFilters = () => {
    setSearchQuery('');
    setSelectedSubject('');
    setSelectedTags([]);
    fetchData();
  };

  const MarkdownComponents = {
    code({ node, inline, className, children, ...props }) {
      const match = /language-(\w+)/.exec(className || '');
      const codeString = String(children).replace(/\n$/, '');
      const [copied, setCopied] = React.useState(false);

      const handleCopy = () => {
        navigator.clipboard.writeText(codeString);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      };

      return !inline && match ? (
        <div className="relative group my-6 rounded-2xl overflow-hidden border border-gray-200 shadow-sm hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between bg-gradient-to-r from-gray-900 to-gray-800 text-gray-300 px-4 py-3 text-xs">
            <div className="flex items-center gap-2">
              <Code className="w-4 h-4" />
              <span className="font-mono uppercase font-semibold">{match[1]}</span>
            </div>
            <button
              onClick={handleCopy}
              className="flex items-center gap-1 px-2 py-1 hover:bg-white/10 rounded transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3 h-3" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Download className="w-3 h-3" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
          <pre className="bg-[#0d1117] text-gray-300 p-6 overflow-x-auto m-0">
            <code className="text-sm font-mono leading-relaxed">{codeString}</code>
          </pre>
        </div>
      ) : (
        <code className="bg-pink-50 text-pink-600 px-2 py-0.5 rounded-md text-sm font-mono border border-pink-100" {...props}>
          {children}
        </code>
      );
    },
    h1: ({ children }) => (
      <h1 className="text-4xl font-bold text-gray-900 mb-6 pb-4 border-b-2 border-gray-200">{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className="text-2xl font-bold text-gray-900 mt-8 mb-4 flex items-center gap-2">
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-xl font-semibold text-gray-800 mt-6 mb-3">{children}</h3>
    ),
    p: ({ children }) => (
      <p className="text-gray-700 leading-relaxed mb-4">{children}</p>
    ),
    ul: ({ children }) => (
      <ul className="space-y-2 my-4 ml-6">{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className="space-y-2 my-4 ml-6 list-decimal">{children}</ol>
    ),
    li: ({ children }) => (
      <li className="text-gray-700 leading-relaxed pl-2">{children}</li>
    ),
    blockquote: ({ children }) => (
      <blockquote className="border-l-4 border-blue-500 bg-blue-50 pl-4 py-3 my-4 italic text-gray-700">
        {children}
      </blockquote>
    ),
    a: ({ href, children }) => (
      <a href={href} className="text-blue-600 hover:text-blue-700 underline" target="_blank" rel="noopener noreferrer">
        {children}
      </a>
    ),
    hr: () => (
      <hr className="my-8 border-t-2 border-gray-200" />
    ),
    strong: ({ children }) => (
      <strong className="font-bold text-gray-900">{children}</strong>
    ),
    em: ({ children }) => (
      <em className="italic text-gray-700">{children}</em>
    ),
  };

  return (
    <div className="min-h-full bg-[#F2F5F9] font-sans">
      <div className="w-full bg-white rounded-[28px] shadow-xl shadow-gray-200/50 p-6 md:p-8">
        
        <TopBar />

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Study Notes</h1>
              <p className="text-gray-500">Your saved learning materials and conversations</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowFilterPanel(!showFilterPanel)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                  showFilterPanel ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                <Filter className="w-4 h-4" />
                Filters
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search notes..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
              />
            </div>
            <button
              onClick={handleSearch}
              className="px-6 py-3 bg-gray-900 text-white rounded-xl font-medium hover:bg-gray-800 transition-all"
            >
              Search
            </button>
          </div>

          {/* Filter Panel */}
          <AnimatePresence>
            {showFilterPanel && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="mt-4 p-4 bg-gray-50 rounded-xl border border-gray-200">
                  <div className="grid md:grid-cols-2 gap-4">
                    {/* Subject Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Subject</label>
                      <select
                        value={selectedSubject}
                        onChange={(e) => setSelectedSubject(e.target.value)}
                        className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                      >
                        <option value="">All Subjects</option>
                        {subjects.map(s => (
                          <option key={s.subject} value={s.subject}>
                            {s.subject} ({s.count})
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Tags Filter */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">Tags</label>
                      <div className="flex flex-wrap gap-2 max-h-32 overflow-y-auto">
                        {tags.slice(0, 20).map(t => (
                          <button
                            key={t.tag}
                            onClick={() => toggleTag(t.tag)}
                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${
                              selectedTags.includes(t.tag)
                                ? 'bg-blue-600 text-white'
                                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                            }`}
                          >
                            {t.tag}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-4">
                    <button
                      onClick={clearFilters}
                      className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-all"
                    >
                      Clear Filters
                    </button>
                    <button
                      onClick={handleSearch}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700 transition-all"
                    >
                      Apply Filters
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats */}
          <div className="flex items-center gap-4 mt-4">
            <div className="text-sm text-gray-500">
              <span className="font-semibold text-gray-900">{notes.length}</span> notes found
            </div>
            {selectedSubject && (
              <div className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">
                {selectedSubject}
              </div>
            )}
            {selectedTags.map(tag => (
              <div key={tag} className="flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium">
                {tag}
                <button onClick={() => toggleTag(tag)} className="hover:bg-purple-200 rounded-full p-0.5">
                  <X className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Notes Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
          </div>
        ) : notes.length === 0 ? (
          <div className="text-center py-20">
            <BookOpen className="w-16 h-16 mx-auto mb-4 text-gray-300" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notes found</h3>
            <p className="text-gray-500">Start a conversation in AI Chat to create your first study note!</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {notes.map((note) => (
              <motion.div
                key={note._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-xl hover:border-blue-200 transition-all cursor-pointer group"
                onClick={() => handleViewNote(note._id)}
              >
                {/* Card Header */}
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-4 border-b border-gray-100">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="p-2 bg-blue-500 rounded-lg">
                      <BookOpen className="w-4 h-4 text-white" />
                    </div>
                    <span className="px-3 py-1 bg-white text-blue-700 rounded-full text-xs font-semibold shadow-sm">
                      {note.subject}
                    </span>
                  </div>
                  <h3 className="font-bold text-gray-900 text-base line-clamp-2 group-hover:text-blue-600 transition-colors leading-snug">
                    {note.title}
                  </h3>
                </div>

                {/* Card Body */}
                <div className="p-4">
                  {/* Summary Preview (if available) */}
                  {note.summary && (
                    <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                      <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed italic">
                        "{note.summary}"
                      </p>
                    </div>
                  )}

                  {/* Tags */}
                  {note.tags && note.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {note.tags.slice(0, 4).map((tag, i) => (
                        <span key={i} className="px-2 py-1 bg-gray-100 text-gray-600 rounded-md text-xs font-medium">
                          #{tag}
                        </span>
                      ))}
                      {note.tags.length > 4 && (
                        <span className="px-2 py-1 text-gray-400 text-xs font-medium">
                          +{note.tags.length - 4} more
                        </span>
                      )}
                    </div>
                  )}

                  {/* Metadata */}
                  <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                    <div className="flex items-center gap-3 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Date(note.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                      </div>
                      {note.metadata?.questionCount > 0 && (
                        <div className="flex items-center gap-1">
                          <FileText className="w-3 h-3" />
                          {note.metadata.questionCount} Q&A
                        </div>
                      )}
                      {note.metadata?.codeBlocks > 0 && (
                        <div className="flex items-center gap-1">
                          <Code className="w-3 h-3 text-green-600" />
                          {note.metadata.codeBlocks}
                        </div>
                      )}
                    </div>
                    
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDownloadNote(note);
                        }}
                        className="p-1.5 hover:bg-green-50 hover:text-green-600 rounded-lg transition-colors"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteNote(note._id);
                        }}
                        className="p-1.5 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                        title="Delete"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}

        {/* Confirm Dialog */}
        <ConfirmDialog
          isOpen={confirmDialog.isOpen}
          onClose={() => setConfirmDialog({ isOpen: false, noteId: null })}
          onConfirm={confirmDelete}
          title="Delete Note"
          message="Are you sure you want to delete this study note? This action cannot be undone."
          confirmText="Delete"
          cancelText="Cancel"
          type="danger"
        />

        {/* Toast Notification */}
        <Toast
          isOpen={toast.isOpen}
          onClose={() => setToast({ ...toast, isOpen: false })}
          message={toast.message}
          type={toast.type}
        />

        {/* Note View Modal */}
        <AnimatePresence>
          {showNoteModal && selectedNote && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
              onClick={() => {
                setShowNoteModal(false);
                setEditingNote(null);
                setEditMode('preview');
              }}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.95, opacity: 0 }}
                className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                {/* Modal Header */}
                <div className="flex items-center justify-between p-6 border-b border-gray-200">
                  <div className="flex-1">
                    {editingNote ? (
                      <input
                        type="text"
                        value={editingNote.title}
                        onChange={(e) => setEditingNote({ ...editingNote, title: e.target.value })}
                        className="text-xl font-bold text-gray-900 w-full border-b-2 border-blue-500 focus:outline-none"
                      />
                    ) : (
                      <h2 className="text-xl font-bold text-gray-900">{selectedNote.title}</h2>
                    )}
                    <div className="flex items-center gap-3 mt-2">
                      <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-xs font-medium">
                        {editingNote ? (
                          <input
                            type="text"
                            value={editingNote.subject}
                            onChange={(e) => setEditingNote({ ...editingNote, subject: e.target.value })}
                            className="bg-transparent focus:outline-none w-32"
                          />
                        ) : (
                          selectedNote.subject
                        )}
                      </span>
                      <span className="text-xs text-gray-500">
                        {new Date(selectedNote.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {editingNote ? (
                      <>
                        <button
                          onClick={() => setEditingNote(null)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleUpdateNote}
                          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          <Save className="w-4 h-4" />
                          Save
                        </button>
                      </>
                    ) : (
                      <>
                        <button
                          onClick={() => setEditingNote({ ...selectedNote })}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDownloadNote(selectedNote)}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                          title="Download"
                        >
                          <Download className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            handleDeleteNote(selectedNote._id);
                          }}
                          className="p-2 hover:bg-red-50 hover:text-red-600 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => {
                            setShowNoteModal(false);
                            setEditingNote(null);
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <X className="w-5 h-5" />
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Edit Mode Toggle */}
                {editingNote && (
                  <div className="flex items-center gap-2 px-6 py-3 bg-gray-50 border-b border-gray-200">
                    <button
                      onClick={() => setEditMode('edit')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        editMode === 'edit' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Edit2 className="w-4 h-4 inline mr-2" />
                      Edit
                    </button>
                    <button
                      onClick={() => setEditMode('preview')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        editMode === 'preview' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <Eye className="w-4 h-4 inline mr-2" />
                      Preview
                    </button>
                    <button
                      onClick={() => setEditMode('split')}
                      className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                        editMode === 'split' ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 hover:bg-gray-100'
                      }`}
                    >
                      <FileText className="w-4 h-4 inline mr-2" />
                      Split
                    </button>
                  </div>
                )}

                {/* Modal Content */}
                <div className="flex-1 overflow-hidden">
                  {editingNote ? (
                    <div className="h-full flex">
                      {/* Edit View */}
                      {(editMode === 'edit' || editMode === 'split') && (
                        <div className={`${editMode === 'split' ? 'w-1/2 border-r border-gray-200' : 'w-full'} overflow-y-auto p-6`}>
                          <textarea
                            value={editingNote.content}
                            onChange={(e) => setEditingNote({ ...editingNote, content: e.target.value })}
                            className="w-full h-full min-h-[500px] p-4 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none font-mono text-sm leading-relaxed resize-none"
                            placeholder="Write your markdown here..."
                          />
                        </div>
                      )}
                      
                      {/* Preview View */}
                      {(editMode === 'preview' || editMode === 'split') && (
                        <div className={`${editMode === 'split' ? 'w-1/2' : 'w-full'} overflow-y-auto p-6 bg-white`}>
                          <div className="prose prose-lg max-w-none">
                            <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                              {editingNote.content}
                            </ReactMarkdown>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="h-full overflow-y-auto p-8 bg-gradient-to-br from-gray-50 to-white">
                      <div className="max-w-4xl mx-auto prose prose-lg">
                        <ReactMarkdown remarkPlugins={[remarkGfm]} components={MarkdownComponents}>
                          {selectedNote.content}
                        </ReactMarkdown>
                      </div>
                    </div>
                  )}
                </div>

                {/* Modal Footer */}
                {selectedNote.tags && selectedNote.tags.length > 0 && !editingNote && (
                  <div className="p-6 border-t border-gray-200 bg-gray-50">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Tag className="w-4 h-4 text-gray-500" />
                      {selectedNote.tags.map((tag, i) => (
                        <span key={i} className="px-3 py-1 bg-white border border-gray-200 text-gray-600 rounded-full text-xs">
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default StudyNotesPage;

