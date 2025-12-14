import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getStudyNotes,
  getStudyNote,
  createStudyNote,
  updateStudyNote,
  deleteStudyNote,
  getSubjects,
  getTags,
  appendStudyNote,
  restructureNote,
  createRestructuredNote,
  compareNoteVersions,
  getRestructureOptions
} from '../controllers/studyNoteController.js';

const router = express.Router();

// Test endpoint (no auth needed)
router.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Study notes routes are working',
    timestamp: new Date().toISOString()
  });
});

// All routes below are protected
router.use(protect);

// GET /api/study-notes/subjects/list - Get all subjects
router.get('/subjects/list', getSubjects);

// GET /api/study-notes/tags/list - Get all tags
router.get('/tags/list', getTags);

// ============================================
// AI-Powered Note Intelligence Routes
// IMPORTANT: These must come BEFORE /:id routes
// ============================================

// GET /api/study-notes/restructure-options - Get restructure intensity options
router.get('/restructure-options', getRestructureOptions);

// POST /api/study-notes/create-restructured - Create note with AI restructuring
router.post('/create-restructured', createRestructuredNote);

// ============================================
// Standard CRUD Routes
// ============================================

// GET /api/study-notes - Get all study notes
router.get('/', getStudyNotes);

// GET /api/study-notes/:id - Get a single study note
router.get('/:id', getStudyNote);

// POST /api/study-notes - Create a new study note
router.post('/', createStudyNote);

// PUT /api/study-notes/:id - Update a study note
router.put('/:id', updateStudyNote);

// POST /api/study-notes/:id/append - Append content & sources
router.post('/:id/append', appendStudyNote);

// POST /api/study-notes/:id/restructure - Restructure existing note
router.post('/:id/restructure', restructureNote);

// GET /api/study-notes/:id/compare - Compare original vs restructured
router.get('/:id/compare', compareNoteVersions);

// DELETE /api/study-notes/:id - Delete a study note
router.delete('/:id', deleteStudyNote);

export default router;

