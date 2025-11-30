import express from 'express';
import { protect } from '../middleware/auth.js';
import { 
  sendMessage, 
  getConversation, 
  markAsRead, 
  getUnreadCount,
  getContacts,
  getAllUsers,
  deleteConversation
} from '../controllers/messageController.js';

const router = express.Router();

// Important: More specific routes must come before parameterized routes
router.get('/contacts', protect, getContacts);
router.get('/users', protect, getAllUsers);
router.get('/unread/count', protect, getUnreadCount);
router.post('/', protect, sendMessage);
router.get('/:contactId', protect, getConversation);
router.put('/read/:contactId', protect, markAsRead);
router.delete('/:contactId', protect, deleteConversation);

export default router;

