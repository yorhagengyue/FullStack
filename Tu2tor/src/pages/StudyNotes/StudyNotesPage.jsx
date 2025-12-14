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
import NoteDetailView from '../../components/notes/NoteDetailView';
import RestructuredNoteView from '../../components/notes/RestructuredNoteView';

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
  const [showFilterPanel, setShowFilterPanel] = useState(false);
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
    // Create frontmatter
    const frontmatter = [
      '---',
      `title: "${note.title}"`,
      `subject: "${note.subject}"`,
      note.subjectId ? `subjectId: "${note.subjectId}"` : '',
      `summary: "${note.summary || ''}"`,
      `version: ${note.version || 1}`,
      `created: ${new Date(note.createdAt).toISOString()}`,
      `updated: ${new Date(note.updatedAt).toISOString()}`,
      note.tags?.length ? `tags: [${note.tags.map(t => `"${t}"`).join(', ')}]` : '',
      note.highlights?.length ? `highlights:\n${note.highlights.map(h => `  - "${h}"`).join('\n')}` : '',
      note.sources?.length ? `sources:\n${note.sources.map(s => `  - title: "${s.title}"\n    pages: [${s.pages?.join(', ')}]`).join('\n')}` : '',
      '---',
      ''
    ].filter(Boolean).join('\n');

    const fullContent = frontmatter + '\n' + note.content;
    const blob = new Blob([fullContent], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${note.title.replace(/[^a-z0-9]/gi, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    setToast({ isOpen: true, message: 'Note exported successfully!', type: 'success' });
  };

  const handleUpdateNote = async (updatedNote) => {
    if (!updatedNote) return;
    
    try {
      const updated = await studyNotesAPI.updateStudyNote(updatedNote._id, {
        title: updatedNote.title,
        subject: updatedNote.subject,
        content: updatedNote.content,
        summary: updatedNote.summary,
        highlights: updatedNote.highlights,
        tags: updatedNote.tags
      });
      
      setNotes(notes.map(n => n._id === updated._id ? updated : n));
      setSelectedNote(updated);
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
                  {/* Summary */}
                  <div className="mb-3 p-3 bg-gray-50 rounded-lg border border-gray-100">
                    <p className="text-xs text-gray-600 line-clamp-3 leading-relaxed">
                      {note.summary || 'No summary available'}
                    </p>
                  </div>

                  {/* Sources Count */}
                  {note.sources && note.sources.length > 0 && (
                    <div className="mb-3 flex items-center gap-1.5 text-xs text-gray-500">
                      <BookOpen className="w-3 h-3 text-blue-500" />
                      <span>{note.sources.length} source{note.sources.length > 1 ? 's' : ''} referenced</span>
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
        {showNoteModal && selectedNote && (
          <>
            {/* Show RestructuredNoteView if note has restructured data */}
            {selectedNote.restructured?.enabled ? (
              <RestructuredNoteView
                note={selectedNote}
                onClose={() => {
                  setShowNoteModal(false);
                  setSelectedNote(null);
                }}
                onRestructure={async () => {
                  // Handle re-restructure
                  try {
                    await studyNotesAPI.restructureNote(selectedNote._id, 'medium');
                    const updated = await studyNotesAPI.getStudyNote(selectedNote._id);
                    setSelectedNote(updated);
                    setToast({ isOpen: true, message: 'Note re-restructured!', type: 'success' });
                  } catch (error) {
                    console.error('Re-restructure error:', error);
                    setToast({ isOpen: true, message: 'Re-restructure failed', type: 'error' });
                  }
                }}
                onDownload={() => handleDownloadNote(selectedNote)}
              />
            ) : (
              <NoteDetailView
                note={selectedNote}
                onClose={() => {
                  setShowNoteModal(false);
                  setSelectedNote(null);
                }}
                onUpdate={handleUpdateNote}
                onDelete={handleDeleteNote}
                onDownload={handleDownloadNote}
                MarkdownComponents={MarkdownComponents}
              />
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default StudyNotesPage;

