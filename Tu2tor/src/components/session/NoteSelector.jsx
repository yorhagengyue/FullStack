import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Search, FileText, Calendar, Tag, Loader2, Plus } from 'lucide-react';
import { studyNotesAPI } from '../../services/api';

const NoteSelector = ({ onClose, onSelect }) => {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');

  useEffect(() => {
    loadNotes();
  }, []);

  const loadNotes = async () => {
    setLoading(true);
    try {
      const response = await studyNotesAPI.getStudyNotes();
      console.log('Study notes response:', response);
      console.log('Is array?', Array.isArray(response));
      console.log('Response type:', typeof response);
      
      // Backend returns array directly, not wrapped in { notes: [] }
      const notesArray = Array.isArray(response) ? response : (response.notes || []);
      console.log('Notes array:', notesArray);
      setNotes(notesArray);
    } catch (error) {
      console.error('Error loading notes:', error);
      setNotes([]);
    } finally {
      setLoading(false);
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSubject = !selectedSubject || note.subject === selectedSubject;
    return matchesSearch && matchesSubject;
  });

  const subjects = [...new Set(notes.map(note => note.subject))];

  const handleCreateNew = () => {
    onSelect({
      title: 'New Collaborative Note',
      content: '# New Collaborative Note\n\nStart writing here...',
      subject: 'General',
      isNew: true
    });
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[80vh] flex flex-col"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-700">
            <div>
              <h2 className="text-2xl font-bold text-white">Select a Note</h2>
              <p className="text-gray-400 text-sm mt-1">Choose a study note to collaborate on</p>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-700 rounded-lg transition-colors text-gray-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Search and Filter */}
          <div className="p-4 border-b border-gray-700 space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search notes..."
                className="w-full pl-10 pr-4 py-2 bg-gray-700 text-white rounded-lg border border-gray-600 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 outline-none"
              />
            </div>

            <div className="flex items-center gap-2 overflow-x-auto">
              <button
                onClick={() => setSelectedSubject('')}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                  !selectedSubject ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                All Subjects
              </button>
              {subjects.map(subject => (
                <button
                  key={subject}
                  onClick={() => setSelectedSubject(subject)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${
                    selectedSubject === subject ? 'bg-purple-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {subject}
                </button>
              ))}
            </div>
          </div>

          {/* Notes List */}
          <div className="flex-1 overflow-y-auto p-4">
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="w-8 h-8 text-purple-500 animate-spin" />
              </div>
            ) : (
              <>
                {/* Create New Button */}
                <button
                  onClick={handleCreateNew}
                  className="w-full mb-4 p-4 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 rounded-xl transition-all flex items-center justify-center gap-2 text-white font-semibold"
                >
                  <Plus className="w-5 h-5" />
                  Create New Collaborative Note
                </button>

                {filteredNotes.length === 0 ? (
                  <div className="text-center py-12">
                    <FileText className="w-16 h-16 mx-auto text-gray-600 mb-4" />
                    <p className="text-gray-400">No notes found</p>
                  </div>
                ) : (
                  <div className="grid md:grid-cols-2 gap-4">
                    {filteredNotes.map((note) => (
                      <motion.button
                        key={note._id}
                        onClick={() => onSelect(note)}
                        className="bg-gray-700 hover:bg-gray-600 rounded-xl p-4 text-left transition-all border border-gray-600 hover:border-purple-500"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-white line-clamp-1 flex-1">
                            {note.title}
                          </h3>
                          <FileText className="w-4 h-4 text-purple-400 flex-shrink-0 ml-2" />
                        </div>

                        <div className="flex items-center gap-2 mb-2">
                          <span className="px-2 py-0.5 bg-purple-900/30 text-purple-400 rounded text-xs font-medium">
                            {note.subject}
                          </span>
                        </div>

                        {note.summary && (
                          <p className="text-gray-400 text-sm line-clamp-2 mb-2">
                            {note.summary}
                          </p>
                        )}

                        {note.tags && note.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-2">
                            {note.tags.slice(0, 3).map((tag, i) => (
                              <span key={i} className="px-2 py-0.5 bg-gray-800 text-gray-400 rounded text-xs">
                                #{tag}
                              </span>
                            ))}
                            {note.tags.length > 3 && (
                              <span className="px-2 py-0.5 text-gray-500 text-xs">
                                +{note.tags.length - 3}
                              </span>
                            )}
                          </div>
                        )}

                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Calendar className="w-3 h-3" />
                          {new Date(note.createdAt).toLocaleDateString()}
                        </div>
                      </motion.button>
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default NoteSelector;

