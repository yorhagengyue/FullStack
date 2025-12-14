import StudyNote from '../models/StudyNote.js';
import notesIntelligence from '../ai/services/NotesIntelligenceService.js';

const normalizeSources = (rawSources = []) => {
  if (!Array.isArray(rawSources)) return [];
  const seen = new Map();
  for (const src of rawSources) {
    if (!src) continue;
    const docId = src.docId || src._id;
    if (!docId) continue;
    const key = docId.toString();
    const pages = Array.isArray(src.pages)
      ? Array.from(new Set(src.pages.map(Number).filter(Number.isFinite)))
      : [];
    if (seen.has(key)) {
      const existing = seen.get(key);
      const mergedPages = Array.from(new Set([...(existing.pages || []), ...pages])).sort((a, b) => a - b);
      seen.set(key, { ...existing, pages: mergedPages });
    } else {
      seen.set(key, {
        docId,
        title: src.title,
        pages: pages.sort((a, b) => a - b)
      });
    }
  }
  return Array.from(seen.values());
};

// @desc    Get all study notes for current user
// @route   GET /api/study-notes
// @access  Private
export const getStudyNotes = async (req, res) => {
  try {
    const { subject, subjectId, tags, search, sourceDocId } = req.query;
    const query = { userId: req.user._id };

    if (subject) {
      query.subject = subject;
    }

    if (subjectId) {
      query.subjectId = subjectId;
    }

    if (tags) {
      query.tags = { $in: tags.split(',') };
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { content: { $regex: search, $options: 'i' } }
      ];
    }

    if (sourceDocId) {
      query['sources.docId'] = sourceDocId;
    }

    const notes = await StudyNote.find(query)
      .sort({ createdAt: -1 });
      // Include content for preview in NoteSelector

    res.json(notes);
  } catch (error) {
    console.error('Error fetching study notes:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get a single study note
// @route   GET /api/study-notes/:id
// @access  Private
export const getStudyNote = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await StudyNote.findOne({ _id: id, userId: req.user._id });

    if (!note) {
      return res.status(404).json({ message: 'Study note not found' });
    }

    res.json(note);
  } catch (error) {
    console.error('Error fetching study note:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Create a new study note
// @route   POST /api/study-notes
// @access  Private
const generateSummary = (content) => {
  if (!content) return '';
  // Extract first 3-5 sentences or first 200 chars
  const sentences = content.replace(/[#*`]/g, '').split(/[.!?]\s+/).filter(s => s.trim().length > 20);
  const summary = sentences.slice(0, 3).join('. ');
  return summary.length > 300 ? summary.substring(0, 300) + '...' : summary + (summary ? '.' : '');
};

const extractHighlights = (content) => {
  if (!content) return [];
  const highlights = [];
  // Extract markdown headers (##, ###)
  const headers = content.match(/^#{2,3}\s+(.+)$/gm);
  if (headers) {
    highlights.push(...headers.map(h => h.replace(/^#+\s+/, '')).slice(0, 3));
  }
  // Extract bold text
  const boldTexts = content.match(/\*\*(.+?)\*\*/g);
  if (boldTexts && highlights.length < 3) {
    highlights.push(...boldTexts.map(b => b.replace(/\*\*/g, '')).slice(0, 3 - highlights.length));
  }
  return highlights.slice(0, 5);
};

export const createStudyNote = async (req, res) => {
  try {
    const { title, subject, subjectId, content, summary, highlights, tags, conversationId, metadata, sources } = req.body;

    if (!title || !subject || !content) {
      return res.status(400).json({ message: 'Title, subject, and content are required' });
    }

    const note = await StudyNote.create({
      userId: req.user._id,
      title: title.trim(),
      subject: subject.trim(),
      subjectId: subjectId?.trim(),
      content,
      summary: summary || generateSummary(content),
      highlights: highlights || extractHighlights(content),
      tags: tags || [],
      conversationId,
      metadata: metadata || {},
      sources: normalizeSources(sources),
      version: 1
    });

    res.status(201).json(note);
  } catch (error) {
    console.error('Error creating study note:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Update a study note
// @route   PUT /api/study-notes/:id
// @access  Private
export const updateStudyNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subject, subjectId, content, summary, highlights, tags, metadata, sources } = req.body;

    const note = await StudyNote.findOne({ _id: id, userId: req.user._id });

    if (!note) {
      return res.status(404).json({ message: 'Study note not found' });
    }

    if (title !== undefined) note.title = title.trim();
    if (subject !== undefined) note.subject = subject.trim();
    if (subjectId !== undefined) note.subjectId = subjectId?.trim();
    if (content !== undefined) {
      note.content = content;
      // Auto-regenerate summary/highlights if not provided
      if (summary === undefined) note.summary = generateSummary(content);
      if (highlights === undefined) note.highlights = extractHighlights(content);
    }
    if (summary !== undefined) note.summary = summary;
    if (highlights !== undefined) note.highlights = highlights;
    if (tags !== undefined) note.tags = tags;
    if (metadata !== undefined) note.metadata = { ...note.metadata, ...metadata };
    if (sources !== undefined) note.sources = normalizeSources(sources);
    
    // Increment version
    note.version = (note.version || 1) + 1;
    note.metadata.lastSyncedAt = new Date();

    await note.save();

    res.json(note);
  } catch (error) {
    console.error('Error updating study note:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Delete a study note
// @route   DELETE /api/study-notes/:id
// @access  Private
export const deleteStudyNote = async (req, res) => {
  try {
    const { id } = req.params;

    const note = await StudyNote.findOneAndDelete({ _id: id, userId: req.user._id });

    if (!note) {
      return res.status(404).json({ message: 'Study note not found' });
    }

    res.json({ message: 'Study note deleted successfully' });
  } catch (error) {
    console.error('Error deleting study note:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Append content & sources to a study note
// @route   POST /api/study-notes/:id/append
// @access  Private
export const appendStudyNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { contentAppend, sources, section } = req.body;

    if (!contentAppend && !sources) {
      return res.status(400).json({ message: 'Nothing to append' });
    }

    const note = await StudyNote.findOne({ _id: id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ message: 'Study note not found' });
    }

    if (contentAppend) {
      // If section is specified, try to insert at that section
      if (section) {
        const sectionRegex = new RegExp(`^#{1,3}\\s+${section}`, 'm');
        const match = note.content.match(sectionRegex);
        if (match) {
          const insertIndex = match.index + match[0].length;
          note.content = note.content.slice(0, insertIndex) + '\n\n' + contentAppend + '\n' + note.content.slice(insertIndex);
        } else {
          // Section not found, append at end with new section
          note.content = `${note.content}\n\n## ${section}\n\n${contentAppend}`;
        }
      } else {
        // No section specified, append at end
        note.content = `${note.content}\n\n${contentAppend}`;
      }
      
      // Regenerate summary and highlights
      note.summary = generateSummary(note.content);
      note.highlights = extractHighlights(note.content);
    }

    if (sources) {
      const merged = normalizeSources([...(note.sources || []), ...normalizeSources(sources)]);
      note.sources = merged;
    }

    // Increment version
    note.version = (note.version || 1) + 1;
    note.metadata.lastSyncedAt = new Date();

    await note.save();

    res.json(note);
  } catch (error) {
    console.error('Error appending study note:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all subjects with note count
// @route   GET /api/study-notes/subjects/list
// @access  Private
export const getSubjects = async (req, res) => {
  try {
    const subjects = await StudyNote.aggregate([
      { $match: { userId: req.user._id } },
      { $group: { _id: '$subject', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json(subjects.map(s => ({ subject: s._id, count: s.count })));
  } catch (error) {
    console.error('Error fetching subjects:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// @desc    Get all tags
// @route   GET /api/study-notes/tags/list
// @access  Private
export const getTags = async (req, res) => {
  try {
    const tags = await StudyNote.aggregate([
      { $match: { userId: req.user._id } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    res.json(tags.map(t => ({ tag: t._id, count: t.count })));
  } catch (error) {
    console.error('Error fetching tags:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// ============================================================================
// AI-Powered Note Intelligence Endpoints
// ============================================================================

// @desc    Restructure existing note with AI
// @route   POST /api/study-notes/:id/restructure
// @access  Private
export const restructureNote = async (req, res) => {
  try {
    const { id } = req.params;
    const { intensity = 'medium' } = req.body;

    console.log('[StudyNoteController] Restructuring note:', { id, intensity });

    // Validate intensity
    if (!['light', 'medium', 'deep'].includes(intensity)) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid intensity. Must be: light, medium, or deep' 
      });
    }

    // Find note
    const note = await StudyNote.findOne({ _id: id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ 
        success: false,
        message: 'Study note not found' 
      });
    }

    // Check if original messages exist
    if (!note.originalMessages || note.originalMessages.length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'Cannot restructure: original conversation messages not found. This note may have been created before the intelligence feature was added.' 
      });
    }

    // Restructure with AI
    const restructured = await notesIntelligence.restructureConversation(
      note.originalMessages,
      { intensity, subject: note.subject }
    );

    // Update note
    note.content = restructured.content;
    note.summary = restructured.summary;
    note.highlights = restructured.highlights;
    note.tags = [...new Set([...note.tags, ...restructured.tags])].slice(0, 20);
    note.restructured = restructured.restructured;
    note.metadata = {
      ...note.metadata,
      ...restructured.metadata,
      isRestructured: true,
      restructureIntensity: intensity
    };
    note.version = (note.version || 1) + 1;

    await note.save();

    console.log('[StudyNoteController] Note restructured successfully:', { 
      id, 
      intensity,
      conceptCount: restructured.restructured.mainConcepts.length 
    });

    res.json({
      success: true,
      message: 'Note restructured successfully',
      note
    });
  } catch (error) {
    console.error('[StudyNoteController] Restructure error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to restructure note', 
      error: error.message 
    });
  }
};

// @desc    Create new note directly from conversation with AI restructuring
// @route   POST /api/study-notes/create-restructured
// @access  Private
export const createRestructuredNote = async (req, res) => {
  console.log('[StudyNoteController] ===== CREATE RESTRUCTURED NOTE REQUEST =====');
  console.log('[StudyNoteController] Request body keys:', Object.keys(req.body));
  
  try {
    const { messages, subject, intensity = 'medium', conversationId, sources } = req.body;

    console.log('[StudyNoteController] Creating restructured note...', { 
      messageCount: messages?.length,
      intensity,
      subject 
    });

    // Validate input
    if (!messages || messages.length < 2) {
      return res.status(400).json({ 
        success: false,
        message: 'At least 2 messages required' 
      });
    }

    if (!subject) {
      return res.status(400).json({ 
        success: false,
        message: 'Subject is required' 
      });
    }

    // Restructure with AI
    const restructured = await notesIntelligence.restructureConversation(
      messages,
      { intensity, subject }
    );

    // Create note
    const note = await StudyNote.create({
      userId: req.user._id,
      title: restructured.title,
      subject: restructured.subject,
      subjectId: restructured.subject,
      content: restructured.content,
      summary: restructured.summary,
      highlights: restructured.highlights,
      tags: restructured.tags,
      conversationId,
      sources: normalizeSources(sources),
      restructured: restructured.restructured,
      originalMessages: restructured.originalMessages,
      metadata: restructured.metadata,
      version: 1
    });

    console.log('[StudyNoteController] Restructured note created:', { 
      id: note._id,
      conceptCount: note.restructured.mainConcepts.length 
    });

    res.status(201).json({
      success: true,
      message: 'Restructured note created successfully',
      note
    });
  } catch (error) {
    console.error('[StudyNoteController] ===== CREATE RESTRUCTURED NOTE ERROR =====');
    console.error('[StudyNoteController] Error:', error.message);
    console.error('[StudyNoteController] Stack:', error.stack);
    
    return res.status(500).json({ 
      success: false,
      message: 'Failed to create restructured note', 
      error: error.message 
    });
  }
};

// @desc    Compare original conversation with restructured version
// @route   GET /api/study-notes/:id/compare
// @access  Private
export const compareNoteVersions = async (req, res) => {
  try {
    const { id } = req.params;

    console.log('[StudyNoteController] Comparing note versions:', { id });

    const note = await StudyNote.findOne({ _id: id, userId: req.user._id });
    if (!note) {
      return res.status(404).json({ 
        success: false,
        message: 'Study note not found' 
      });
    }

    if (!note.originalMessages || note.originalMessages.length === 0) {
      return res.status(400).json({ 
        success: false,
        message: 'No original conversation available for comparison' 
      });
    }

    const comparison = notesIntelligence.compareVersions(
      note.originalMessages,
      note
    );

    res.json({
      success: true,
      comparison,
      note: {
        _id: note._id,
        title: note.title,
        isRestructured: note.metadata?.isRestructured || false,
        restructureIntensity: note.restructured?.intensity
      }
    });
  } catch (error) {
    console.error('[StudyNoteController] Compare versions error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to compare versions', 
      error: error.message 
    });
  }
};

// @desc    Get restructure intensity options
// @route   GET /api/study-notes/restructure-options
// @access  Private
export const getRestructureOptions = async (req, res) => {
  try {
    res.json({
      success: true,
      options: {
        intensities: [
          {
            value: 'light',
            label: 'Light',
            description: 'Quick summary with basic structure',
            estimatedTime: '10-15 seconds',
            features: [
              'Brief definitions',
              'One example per concept',
              'Key takeaways',
              'Concise format'
            ]
          },
          {
            value: 'medium',
            label: 'Medium',
            description: 'Full concept analysis with knowledge graph',
            estimatedTime: '20-30 seconds',
            features: [
              'Detailed explanations',
              'Multiple examples',
              'Common pitfalls',
              'Related concepts',
              'Structured sections'
            ],
            recommended: true
          },
          {
            value: 'deep',
            label: 'Deep',
            description: 'Complete restructuring with supplemental content',
            estimatedTime: '40-60 seconds',
            features: [
              'Comprehensive background',
              'Technical deep dive',
              'Best practices',
              'Multiple use cases',
              'Practice exercises',
              'Further reading',
              'Complete knowledge graph'
            ]
          }
        ]
      }
    });
  } catch (error) {
    console.error('[StudyNoteController] Get options error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to get options', 
      error: error.message 
    });
  }
};

