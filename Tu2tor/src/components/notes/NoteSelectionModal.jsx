import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, FileText, Plus, BookOpen, Check, Loader2, Sparkles, Hash, List } from 'lucide-react';
import { studyNotesAPI } from '../../services/api';

const NoteSelectionModal = ({ isOpen, onClose, contentToSave, sourcesToSave, onSaveSuccess }) => {
  const [activeTab, setActiveTab] = useState('append'); // 'append' or 'new'
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNoteId, setSelectedNoteId] = useState(null);
  const [selectedSection, setSelectedSection] = useState('');
  const [saving, setSaving] = useState(false);

  // New Note State
  const [newNoteTitle, setNewNoteTitle] = useState('');
  const [newNoteSubject, setNewNoteSubject] = useState('');
  const [newNoteSummary, setNewNoteSummary] = useState('');
  const [newNoteHighlights, setNewNoteHighlights] = useState('');
  const [newNoteTags, setNewNoteTags] = useState('');

  // Auto-generate summary from content
  const autoSummary = useMemo(() => {
    if (!contentToSave) return '';
    const sentences = contentToSave.replace(/[#*`]/g, '').split(/[.!?]\s+/).filter(s => s.trim().length > 20);
    const summary = sentences.slice(0, 3).join('. ');
    return summary.length > 250 ? summary.substring(0, 250) + '...' : summary + (summary ? '.' : '');
  }, [contentToSave]);

  // Auto-extract highlights
  const autoHighlights = useMemo(() => {
    if (!contentToSave) return [];
    const highlights = [];
    const headers = contentToSave.match(/^#{2,3}\s+(.+)$/gm);
    if (headers) highlights.push(...headers.map(h => h.replace(/^#+\s+/, '')));
    const boldTexts = contentToSave.match(/\*\*(.+?)\*\*/g);
    if (boldTexts && highlights.length < 3) {
      highlights.push(...boldTexts.map(b => b.replace(/\*\*/g, '')));
    }
    return highlights.slice(0, 5);
  }, [contentToSave]);

  // Extract sections from selected note
  const availableSections = useMemo(() => {
    if (!selectedNoteId) return [];
    const note = notes.find(n => n._id === selectedNoteId);
    if (!note) return [];
    const sections = [];
    const matches = note.content.matchAll(/^#{1,3}\s+(.+)$/gm);
    for (const match of matches) {
      sections.push(match[1]);
    }
    return sections;
  }, [selectedNoteId, notes]);

  useEffect(() => {
    if (isOpen) {
      loadNotes();
      const date = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      setNewNoteTitle(`Study Note - ${date}`);
      setNewNoteSubject('General');
      setNewNoteSummary(autoSummary);
      setNewNoteHighlights(autoHighlights.join('\n'));
    }
  }, [isOpen, autoSummary]);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const response = await studyNotesAPI.getStudyNotes();
      const notesArray = Array.isArray(response) ? response : (response.notes || []);
      setNotes(notesArray);
    } catch (error) {
      console.error('Error loading notes:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (activeTab === 'append') {
        if (!selectedNoteId) return;
        await studyNotesAPI.appendStudyNote(selectedNoteId, {
          contentAppend: contentToSave,
          sources: sourcesToSave,
          section: selectedSection || undefined
        });
      } else {
        const highlightsArray = newNoteHighlights.split('\n').map(h => h.trim()).filter(Boolean);
        await studyNotesAPI.createStudyNote({
          title: newNoteTitle,
          subject: newNoteSubject,
          subjectId: newNoteSubject,
          content: contentToSave,
          summary: newNoteSummary || autoSummary,
          highlights: highlightsArray,
          tags: newNoteTags.split(',').map(t => t.trim()).filter(Boolean),
          sources: sourcesToSave
        });
      }
      onSaveSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving note:', error);
    } finally {
      setSaving(false);
    }
  };

  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    note.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] flex flex-col overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gradient-to-r from-gray-50 to-white">
            <div>
              <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                <FileText className="w-5 h-5 text-gray-600" />
                Save to Notes
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Structure your learning materials</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-gray-200 rounded-full transition-colors text-gray-500">
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex p-2 gap-2 bg-gray-50 border-b border-gray-100">
            <button
              onClick={() => setActiveTab('append')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'append' 
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Append to Existing
            </button>
            <button
              onClick={() => setActiveTab('new')}
              className={`flex-1 py-2 px-4 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'new' 
                  ? 'bg-white text-gray-900 shadow-sm border border-gray-200' 
                  : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
              }`}
            >
              Create New Note
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6 min-h-[350px]">
            {activeTab === 'append' ? (
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search your notes..."
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 transition-all"
                  />
                </div>

                {loading ? (
                  <div className="flex justify-center py-8">
                    <Loader2 className="w-6 h-6 text-gray-400 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {filteredNotes.length === 0 ? (
                      <div className="text-center py-8 text-gray-400">
                        <FileText className="w-12 h-12 mx-auto mb-2 opacity-20" />
                        <p>No notes found</p>
                      </div>
                    ) : (
                      filteredNotes.map(note => (
                        <div
                          key={note._id}
                          onClick={() => setSelectedNoteId(note._id)}
                          className={`p-3 rounded-xl border cursor-pointer transition-all ${
                            selectedNoteId === note._id
                              ? 'bg-gray-900 border-gray-900 text-white shadow-md'
                              : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm text-gray-700'
                          }`}
                        >
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <h3 className="font-semibold text-sm mb-1 line-clamp-1">{note.title}</h3>
                              <div className="flex items-center gap-2 text-xs">
                                <span className={selectedNoteId === note._id ? 'text-gray-400' : 'text-gray-500'}>
                                  {note.subject}
                                </span>
                                <span className={selectedNoteId === note._id ? 'text-gray-500' : 'text-gray-400'}>•</span>
                                <span className={selectedNoteId === note._id ? 'text-gray-500' : 'text-gray-400'}>
                                  v{note.version || 1}
                                </span>
                              </div>
                            </div>
                            {selectedNoteId === note._id && (
                              <div className="bg-white/20 p-1 rounded-full">
                                <Check className="w-3 h-3 text-white" />
                              </div>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Section Selector */}
                {selectedNoteId && availableSections.length > 0 && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                      <List className="w-4 h-4" />
                      Insert into Section (optional)
                    </label>
                    <select
                      value={selectedSection}
                      onChange={(e) => setSelectedSection(e.target.value)}
                      className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400"
                    >
                      <option value="">Append to end</option>
                      {availableSections.map((section, i) => (
                        <option key={i} value={section}>{section}</option>
                      ))}
                      <option value="__new__">Create new section...</option>
                    </select>
                    {selectedSection === '__new__' && (
                      <input
                        type="text"
                        placeholder="New section name..."
                        onChange={(e) => setSelectedSection(e.target.value)}
                        className="w-full mt-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5"
                      />
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
                  <input
                    type="text"
                    value={newNoteTitle}
                    onChange={(e) => setNewNoteTitle(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400"
                    placeholder="e.g. Machine Learning Fundamentals"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Subject *</label>
                    <input
                      type="text"
                      value={newNoteSubject}
                      onChange={(e) => setNewNoteSubject(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400"
                      placeholder="e.g. Computer Science"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                      <Hash className="w-3 h-3" />
                      Tags
                    </label>
                    <input
                      type="text"
                      value={newNoteTags}
                      onChange={(e) => setNewNoteTags(e.target.value)}
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400"
                      placeholder="ai, ml, theory"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                    <Sparkles className="w-3 h-3" />
                    Summary (auto-generated, editable)
                  </label>
                  <textarea
                    value={newNoteSummary}
                    onChange={(e) => setNewNoteSummary(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 text-sm"
                    placeholder="3-5 sentence summary..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Key Highlights (one per line)</label>
                  <textarea
                    value={newNoteHighlights}
                    onChange={(e) => setNewNoteHighlights(e.target.value)}
                    rows={3}
                    className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-black/5 focus:border-gray-400 text-sm"
                    placeholder="Key point 1&#10;Key point 2&#10;Key point 3"
                  />
                </div>
              </div>
            )}

            {/* Content Preview */}
            <div className="mt-6 pt-6 border-t border-gray-100">
              <p className="text-xs font-semibold text-gray-500 mb-2 uppercase tracking-wider">Content to Save</p>
              <div className="bg-gray-50 rounded-xl p-4 text-sm text-gray-600 max-h-32 overflow-y-auto border border-gray-200">
                <p className="whitespace-pre-wrap line-clamp-4">{contentToSave}</p>
                {sourcesToSave && sourcesToSave.length > 0 && (
                  <div className="mt-2 pt-2 border-t border-gray-200 flex flex-wrap gap-2">
                    {sourcesToSave.map((src, i) => (
                      <span key={i} className="inline-flex items-center gap-1 px-2 py-0.5 bg-white border border-gray-200 rounded text-xs text-gray-500">
                        <BookOpen className="w-3 h-3" />
                        {src.title || 'Doc'} p.{src.pages?.join(', ')}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-200 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving || (activeTab === 'append' && !selectedNoteId) || (activeTab === 'new' && !newNoteTitle)}
              className="px-6 py-2 bg-gray-900 text-white font-medium rounded-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
              {activeTab === 'append' ? 'Append' : 'Create Note'}
            </button>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NoteSelectionModal;
