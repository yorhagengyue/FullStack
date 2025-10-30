import express from 'express';
import {
  getTutors,
  getTutorById,
  createTutor,
  updateTutor,
  getTutorByUserId
} from '../controllers/tutorController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getTutors);
router.get('/:id', getTutorById);
router.get('/user/:userId', getTutorByUserId);

// Protected routes (require authentication)
router.post('/', protect, createTutor);
router.put('/:id', protect, updateTutor);

export default router;
