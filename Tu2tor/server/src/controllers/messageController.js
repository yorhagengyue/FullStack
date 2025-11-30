import Message from '../models/Message.js';
import User from '../models/User.js';

/**
 * @route   POST /api/messages
 * @desc    Send a message
 * @access  Private
 */
export const sendMessage = async (req, res) => {
  try {
    const { receiverId, content, attachments } = req.body;
    const senderId = req.user._id;

    const newMessage = new Message({
      senderId,
      receiverId,
      content,
      attachments
    });

    const savedMessage = await newMessage.save();

    // Return the populated message
    const populatedMessage = await Message.findById(savedMessage._id)
      .populate('senderId', 'username profilePicture')
      .populate('receiverId', 'username profilePicture');

    res.status(201).json(populatedMessage);
  } catch (error) {
    console.error('Error sending message:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * @route   GET /api/messages/:contactId
 * @desc    Get conversation with a specific contact
 * @access  Private
 */
export const getConversation = async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;

    const messages = await Message.find({
      $or: [
        { senderId: userId, receiverId: contactId },
        { senderId: contactId, receiverId: userId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('senderId', 'username profilePicture')
    .populate('receiverId', 'username profilePicture');

    res.json(messages);
  } catch (error) {
    console.error('Error getting conversation:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * @route   PUT /api/messages/read/:contactId
 * @desc    Mark conversation as read
 * @access  Private
 */
export const markAsRead = async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;

    await Message.updateMany(
      { senderId: contactId, receiverId: userId, isRead: false },
      { $set: { isRead: true } }
    );

    res.json({ success: true });
  } catch (error) {
    console.error('Error marking messages as read:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * @route   GET /api/messages/unread/count
 * @desc    Get total unread messages count
 * @access  Private
 */
export const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    const count = await Message.countDocuments({ 
      receiverId: userId, 
      isRead: false 
    });
    res.json({ count });
  } catch (error) {
    console.error('Error getting unread count:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * @route   GET /api/messages/contacts
 * @desc    Get all contacts the user has messaged with
 * @access  Private
 */
export const getContacts = async (req, res) => {
  try {
    const userId = req.user._id;

    // Find all unique users this user has messaged with
    const sentMessages = await Message.distinct('receiverId', { senderId: userId });
    const receivedMessages = await Message.distinct('senderId', { receiverId: userId });

    // Combine and deduplicate
    const contactIds = [...new Set([...sentMessages, ...receivedMessages].map(id => id.toString()))];

    // Get user details for each contact
    const contacts = await User.find({ _id: { $in: contactIds } })
      .select('_id username email profilePicture');

    // Get last message and unread count for each contact
    const contactsWithDetails = await Promise.all(contacts.map(async (contact) => {
      const lastMessage = await Message.findOne({
        $or: [
          { senderId: userId, receiverId: contact._id },
          { senderId: contact._id, receiverId: userId }
        ]
      }).sort({ createdAt: -1 });

      const unreadCount = await Message.countDocuments({
        senderId: contact._id,
        receiverId: userId,
        isRead: false
      });

      return {
        id: contact._id,
        name: contact.username,
        email: contact.email,
        avatar: contact.username?.charAt(0).toUpperCase() || 'U',
        lastMessage: lastMessage?.content || '',
        timestamp: lastMessage?.createdAt || null,
        unread: unreadCount
      };
    }));

    // Sort by most recent message
    contactsWithDetails.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    res.json(contactsWithDetails);
  } catch (error) {
    console.error('Error getting contacts:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * @route   GET /api/messages/users
 * @desc    Get all users (for starting new conversations)
 * @access  Private
 */
export const getAllUsers = async (req, res) => {
  try {
    const userId = req.user._id;

    // Get all users except current user
    const users = await User.find({ _id: { $ne: userId } })
      .select('_id username email profilePicture role')
      .sort({ username: 1 });

    const usersFormatted = users.map(user => ({
      id: user._id,
      name: user.username,
      email: user.email,
      avatar: user.username?.charAt(0).toUpperCase() || 'U',
      role: user.role
    }));

    res.json(usersFormatted);
  } catch (error) {
    console.error('Error getting users:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

/**
 * @route   DELETE /api/messages/:contactId
 * @desc    Delete conversation with a user
 * @access  Private
 */
export const deleteConversation = async (req, res) => {
  try {
    const { contactId } = req.params;
    const userId = req.user._id;

    await Message.deleteMany({
      $or: [
        { senderId: userId, receiverId: contactId },
        { senderId: contactId, receiverId: userId }
      ]
    });

    res.json({ success: true, message: 'Conversation deleted' });
  } catch (error) {
    console.error('Error deleting conversation:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

