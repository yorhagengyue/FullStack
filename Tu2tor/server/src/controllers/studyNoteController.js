import StudyNote from '../models/StudyNote.js';

// @desc    Get all study notes for current user
// @route   GET /api/study-notes
// @access  Private
export const getStudyNotes = async (req, res) => {
  try {
    const { subject, tags, search } = req.query;
    const query = { userId: req.user._id };

    if (subject) {
      query.subject = subject;
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
export const createStudyNote = async (req, res) => {
  try {
    const { title, subject, content, tags, conversationId, metadata } = req.body;

    if (!title || !subject || !content) {
      return res.status(400).json({ message: 'Title, subject, and content are required' });
    }

    const note = await StudyNote.create({
      userId: req.user._id,
      title: title.trim(),
      subject: subject.trim(),
      content,
      tags: tags || [],
      conversationId,
      metadata: metadata || {}
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
    const { title, subject, content, tags, metadata } = req.body;

    const note = await StudyNote.findOne({ _id: id, userId: req.user._id });

    if (!note) {
      return res.status(404).json({ message: 'Study note not found' });
    }

    if (title !== undefined) note.title = title.trim();
    if (subject !== undefined) note.subject = subject.trim();
    if (content !== undefined) note.content = content;
    if (tags !== undefined) note.tags = tags;
    if (metadata !== undefined) note.metadata = { ...note.metadata, ...metadata };

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

