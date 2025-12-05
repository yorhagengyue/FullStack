import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  getStudyNotes,
  getStudyNote,
  createStudyNote,
  updateStudyNote,
  deleteStudyNote,
  getSubjects,
  getTags
} from '../controllers/studyNoteController.js';

const router = express.Router();

// All routes are protected
router.use(protect);

// GET /api/study-notes/subjects/list - Get all subjects
router.get('/subjects/list', getSubjects);

// GET /api/study-notes/tags/list - Get all tags
router.get('/tags/list', getTags);

// GET /api/study-notes - Get all study notes
router.get('/', getStudyNotes);

// GET /api/study-notes/:id - Get a single study note
router.get('/:id', getStudyNote);

// POST /api/study-notes - Create a new study note
router.post('/', createStudyNote);

// PUT /api/study-notes/:id - Update a study note
router.put('/:id', updateStudyNote);

// DELETE /api/study-notes/:id - Delete a study note
router.delete('/:id', deleteStudyNote);

export default router;

