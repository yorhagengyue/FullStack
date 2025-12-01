import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useAI } from '../../context/AIContext';
import { 
  MessageSquare, Send, Search, MoreVertical, Paperclip, 
  ArrowLeft, UserPlus, X, Trash2, Calendar, Clock, 
  Image as ImageIcon, Bell, CheckCircle, AlertCircle,
  BookOpen, Star, CreditCard, Settings, Info
} from 'lucide-react';

// System contact ID (constant)
const SYSTEM_CONTACT_ID = 'system';

const MessagesPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    sendMessage, getConversation, markConversationAsRead, 
    fetchMessages, fetchContacts, fetchAllUsers, deleteConversation,
    notifications, fetchNotifications, markNotificationAsRead, markAllNotificationsAsRead
  } = useApp();
  const { generateResponse } = useAI();
  
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isMobileView, setIsMobileView] = useState(window.innerWidth < 768);
  const [contacts, setContacts] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [isLoadingContacts, setIsLoadingContacts] = useState(true);
  const [showNewChatModal, setShowNewChatModal] = useState(false);
  const [newChatSearch, setNewChatSearch] = useState('');
  const [showChatMenu, setShowChatMenu] = useState(false);
  const [bookingSuggestion, setBookingSuggestion] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [pendingAttachment, setPendingAttachment] = useState(null);
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const chatContainerRef = useRef(null);
  const textareaRef = useRef(null);
  
  // Get current user ID (handle both 'id' and 'userId' formats)
  const currentUserId = user?.id || user?.userId;

  // System contact object
  const systemContact = {
    id: SYSTEM_CONTACT_ID,
    name: 'System Notifications',
    avatar: '🔔',
    lastMessage: notifications.length > 0 
      ? notifications[0]?.title || 'No notifications'
      : 'No notifications',
    timestamp: notifications[0]?.createdAt || new Date().toISOString(),
    unread: notifications.filter(n => !n.read).length,
    online: true,
    isSystem: true
  };

  // Handle responsive view
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch contacts and notifications
  useEffect(() => {
    const loadData = async () => {
      setIsLoadingContacts(true);
      try {
        const [apiContacts] = await Promise.all([
          fetchContacts(),
          fetchNotifications()
        ]);
        setContacts(apiContacts);
      } catch (err) {
        console.error('Failed to load data:', err);
      } finally {
        setIsLoadingContacts(false);
      }
    };

    if (currentUserId) {
      loadData();
    }
  }, [currentUserId, fetchContacts, fetchNotifications]);

  // Fetch all users for new chat modal
  useEffect(() => {
    const loadAllUsers = async () => {
      try {
        const users = await fetchAllUsers();
        setAllUsers(users);
      } catch (err) {
        console.error('Failed to load users:', err);
      }
    };

    if (showNewChatModal) {
      loadAllUsers();
    }
  }, [showNewChatModal, fetchAllUsers]);

  // Handle auto-selection from navigation
  useEffect(() => {
    if (location.state?.selectedContactId) {
      const contactId = location.state.selectedContactId;
      
      if (contactId === SYSTEM_CONTACT_ID) {
        setSelectedChat(systemContact);
        return;
      }
      
      const existingContact = contacts.find(c => c.id === contactId);

      if (existingContact) {
        handleSelectChat(existingContact);
      } else {
        const newContact = {
          id: contactId,
          name: location.state?.contactName || 'User',
          lastMessage: 'Start a conversation...',
          timestamp: new Date().toISOString(),
          unread: 0,
          avatar: (location.state?.contactName || 'U').charAt(0).toUpperCase(),
          online: true 
        };
        setSelectedChat(newContact);
      }
    }
  }, [location.state, contacts]);

  // Combine system contact with user contacts
  const allContacts = [systemContact, ...contacts];

  const filteredContacts = allContacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter users for new chat (exclude already existing contacts and system)
  const filteredNewChatUsers = allUsers.filter(u => 
    u.name.toLowerCase().includes(newChatSearch.toLowerCase()) &&
    !contacts.some(c => c.id === u.id)
  );

  // Start a new chat with a user
  const handleStartNewChat = (selectedUser) => {
    const newContact = {
      id: selectedUser.id,
      name: selectedUser.name,
      avatar: selectedUser.avatar,
      lastMessage: 'Start a conversation...',
      timestamp: new Date().toISOString(),
      unread: 0,
      online: true
    };
    
    setContacts(prev => [newContact, ...prev]);
    setSelectedChat(newContact);
    setShowNewChatModal(false);
    setNewChatSearch('');
  };

  // Get conversation for selected chat (or notifications for system)
  const conversation = selectedChat?.isSystem 
    ? [] // System chat shows notifications, not messages
    : selectedChat 
      ? getConversation(currentUserId, selectedChat.id) 
      : [];

  // Fetch messages when selecting a chat
  useEffect(() => {
    if (selectedChat?.id && !selectedChat.isSystem) {
      fetchMessages(selectedChat.id);
    }
  }, [selectedChat?.id]);

  // Auto-scroll to bottom when conversation changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation, notifications]);

  // Mark messages/notifications as read when opening
  const handleSelectChat = (contact) => {
    setSelectedChat(contact);
    if (contact.isSystem) {
      // Mark all notifications as read when opening system chat
      markAllNotificationsAsRead();
    } else {
      markConversationAsRead(currentUserId, contact.id);
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    // Can't send messages to system
    if (selectedChat?.isSystem) return;
    
    if ((!messageInput.trim() && !pendingAttachment) || !selectedChat) return;

    const toSend = [];

    if (messageInput.trim()) {
      toSend.push({
        senderId: currentUserId,
        receiverId: selectedChat.id,
        content: messageInput.trim()
      });
    }

    if (pendingAttachment) {
      const content = pendingAttachment.type === 'image'
        ? `[IMAGE] ${pendingAttachment.preview}`
        : `[FILE] ${pendingAttachment.file.name}`;
        
      toSend.push({
        senderId: currentUserId,
        receiverId: selectedChat.id,
        content: content
      });
    }

    setMessageInput('');
    setPendingAttachment(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    try {
      for (const msg of toSend) {
        await sendMessage(msg);
      }
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Handle delete chat
  const handleDeleteChat = async () => {
    if (!selectedChat || selectedChat.isSystem) return;
    const success = await deleteConversation(selectedChat.id);
    if (success) {
      setContacts(prev => prev.filter(c => c.id !== selectedChat.id));
      setSelectedChat(null);
      setShowChatMenu(false);
    }
  };

  // File handling
  const processFile = (file) => {
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      setPendingAttachment({
        file,
        preview: e.target.result,
        type: file.type.startsWith('image/') ? 'image' : 'file'
      });
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    processFile(file);
    e.target.value = '';
  };

  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault();
          const file = item.getAsFile();
          processFile(file);
          return;
        }
      }
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer?.files[0];
    processFile(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${Math.min(textarea.scrollHeight, 150)}px`;
    }
  }, [messageInput]);

  // AI Booking Suggestion
  useEffect(() => {
    if (!conversation.length || isAnalyzing || selectedChat?.isSystem) return;
    
    const lastMsg = conversation[conversation.length - 1];
    const isFromOther = (lastMsg.senderId?._id || lastMsg.senderId) !== currentUserId;
    
    if (isFromOther) {
      const detectIntent = async () => {
        setIsAnalyzing(true);
        try {
          if (lastMsg.content.toLowerCase().match(/(book|schedule|meet|time|tomorrow|monday|tuesday|class)/)) {
             setBookingSuggestion({
               type: 'booking',
               time: 'Tomorrow at 10:00 AM',
               tutorName: selectedChat.name
             });
          } else {
            setBookingSuggestion(null);
          }
        } catch (e) {
          console.error(e);
        } finally {
          setIsAnalyzing(false);
        }
      };
      detectIntent();
    }
  }, [conversation.length]);

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    if (date.toDateString() === today.toDateString()) return 'Today';
    if (date.toDateString() === yesterday.toDateString()) return 'Yesterday';
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get notification icon based on type
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'booking': return <Calendar className="w-5 h-5 text-blue-500" />;
      case 'review': return <Star className="w-5 h-5 text-amber-500" />;
      case 'message': return <MessageSquare className="w-5 h-5 text-green-500" />;
      case 'reminder': return <AlertCircle className="w-5 h-5 text-orange-500" />;
      case 'system': return <Settings className="w-5 h-5 text-gray-500" />;
      default: return <Info className="w-5 h-5 text-indigo-500" />;
    }
  };

  // Notification Item Component
  const NotificationItem = ({ notification }) => {
    const handleClick = () => {
      if (!notification.read) {
        markNotificationAsRead(notification._id || notification.id);
      }
      
      // Navigate based on notification type
      if (notification.relatedId) {
        switch (notification.type) {
          case 'booking':
            navigate(`/app/session/${notification.relatedId}`);
            break;
          case 'review':
            navigate(`/app/reviews`);
            break;
          case 'message':
            navigate(`/app/messages`, { state: { selectedContactId: notification.relatedId } });
            break;
          default:
            break;
        }
      }
    };

    return (
      <div 
        onClick={handleClick}
        className={`p-4 rounded-2xl transition-all cursor-pointer ${
          notification.read 
            ? 'bg-white hover:bg-gray-50' 
            : 'bg-indigo-50 hover:bg-indigo-100 border-l-4 border-indigo-500'
        }`}
      >
        <div className="flex gap-4">
          <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${
            notification.read ? 'bg-gray-100' : 'bg-white shadow-sm'
          }`}>
            {getNotificationIcon(notification.type)}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h4 className={`font-semibold text-sm ${notification.read ? 'text-gray-700' : 'text-gray-900'}`}>
                {notification.title}
              </h4>
              <span className="text-xs text-gray-400 whitespace-nowrap">
                {formatDate(notification.createdAt)}
              </span>
            </div>
            <p className={`text-sm ${notification.read ? 'text-gray-500' : 'text-gray-700'}`}>
              {notification.message}
            </p>
          </div>
        </div>
      </div>
    );
  };

  // Booking Suggestion Card
  const BookingSuggestionCard = ({ suggestion }) => {
    if (!suggestion) return null;
    return (
      <div className="mx-auto max-w-md bg-gradient-to-r from-indigo-50 to-blue-50 p-4 rounded-2xl border border-indigo-100 shadow-sm mb-6 animate-fadeIn">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-white rounded-full shadow-sm">
            <Calendar className="w-5 h-5 text-indigo-600" />
          </div>
          <div className="flex-1">
            <h4 className="text-sm font-bold text-indigo-900 mb-1">Smart Suggestion</h4>
            <p className="text-xs text-indigo-700 mb-3">
              Based on your conversation, would you like to book a session?
            </p>
            <div className="bg-white p-3 rounded-xl border border-indigo-100 mb-3">
              <div className="flex items-center gap-2 text-sm text-gray-700 mb-1">
                <Clock className="w-4 h-4 text-gray-400" />
                <span className="font-medium">{suggestion.time}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-gray-700">
                <UserPlus className="w-4 h-4 text-gray-400" />
                <span>{suggestion.tutorName}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button 
                onClick={() => navigate('/app/bookings', { 
                  state: { tutorId: selectedChat.id, prefillTime: suggestion.time } 
                })}
                className="flex-1 bg-indigo-600 text-white text-xs font-bold py-2 rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Book Session
              </button>
              <button 
                onClick={() => setBookingSuggestion(null)}
                className="px-3 py-2 bg-white text-indigo-600 text-xs font-bold rounded-lg hover:bg-gray-50 border border-transparent hover:border-indigo-100 transition-colors"
              >
                Dismiss
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full bg-[#F2F5F9] font-sans overflow-hidden">
      <div className="w-full bg-white rounded-[28px] shadow-xl shadow-gray-200/50 h-[calc(100vh-80px)] overflow-hidden flex gap-0 md:gap-6 relative">
        
        {/* Contacts Sidebar */}
        <div className={`w-full md:w-80 lg:w-96 flex-shrink-0 flex flex-col bg-white z-10 transition-all duration-300 ${
          selectedChat && isMobileView ? 'hidden' : 'block'
        } border-r border-gray-50 md:border-none`}>
          
          {/* Sidebar Header */}
          <div className="p-6 pb-2">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">Messages</h2>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="p-2.5 bg-black text-white rounded-full hover:bg-gray-800 transition-all hover:scale-105 shadow-lg shadow-gray-200 active:scale-95"
                title="New Chat"
              >
                <UserPlus className="w-5 h-5" />
              </button>
            </div>
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500 transition-colors" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search contacts..."
                className="w-full pl-11 pr-4 py-3.5 bg-gray-50 border border-gray-100 focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 rounded-2xl outline-none text-sm font-medium transition-all"
              />
            </div>
          </div>

          {/* Contacts List */}
          <div className="flex-1 overflow-y-auto px-4 pb-4 custom-scrollbar space-y-1">
            {filteredContacts.length > 0 ? (
              filteredContacts.map((contact) => (
                <button
                  key={contact.id}
                  onClick={() => handleSelectChat(contact)}
                  className={`w-full p-3.5 rounded-2xl transition-all text-left group relative overflow-hidden ${
                    selectedChat?.id === contact.id 
                      ? contact.isSystem 
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200/50 scale-[1.02]'
                        : 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 scale-[1.02]' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${
                        contact.isSystem
                          ? selectedChat?.id === contact.id 
                            ? 'bg-white/20 text-white text-2xl' 
                            : 'bg-gradient-to-br from-indigo-100 to-purple-100 text-2xl'
                          : selectedChat?.id === contact.id 
                            ? 'bg-gray-800 text-white' 
                            : 'bg-white border border-gray-100 text-gray-900'
                      }`}>
                        {contact.avatar}
                      </div>
                      {contact.online && !contact.isSystem && (
                        <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className={`font-bold truncate text-[15px] ${
                          selectedChat?.id === contact.id ? 'text-white' : 'text-gray-900'
                        }`}>
                          {contact.name}
                        </h3>
                        {contact.unread > 0 && (
                          <span className={`text-white text-[10px] rounded-full px-2 py-0.5 font-bold shadow-sm ${
                            contact.isSystem ? 'bg-purple-500 shadow-purple-500/30' : 'bg-indigo-500 shadow-indigo-500/30'
                          }`}>
                            {contact.unread}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm truncate font-medium ${
                        selectedChat?.id === contact.id 
                          ? 'text-gray-300' 
                          : contact.isSystem 
                            ? 'text-indigo-600' 
                            : 'text-gray-500'
                      }`}>
                        {contact.lastMessage}
                      </p>
                    </div>
                  </div>
                </button>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center h-48 text-center">
                <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                  <MessageSquare className="w-6 h-6 text-gray-300" />
                </div>
                <p className="text-gray-400 text-sm font-medium">No conversations yet</p>
              </div>
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-gray-50/50 relative ${
          !selectedChat && isMobileView ? 'hidden' : 'flex'
        }`}>
          {selectedChat ? (
            <>
              {/* Chat Header */}
              <div className={`h-20 px-6 border-b border-gray-100 flex items-center justify-between flex-shrink-0 z-20 ${
                selectedChat.isSystem 
                  ? 'bg-gradient-to-r from-indigo-600 to-purple-600' 
                  : 'bg-white'
              }`}>
                <div className="flex items-center gap-4">
                  {isMobileView && (
                    <button 
                      onClick={() => setSelectedChat(null)} 
                      className={`p-2 rounded-full -ml-2 ${
                        selectedChat.isSystem ? 'hover:bg-white/10 text-white' : 'hover:bg-gray-100'
                      }`}
                    >
                      <ArrowLeft className={`w-5 h-5 ${selectedChat.isSystem ? 'text-white' : 'text-gray-600'}`} />
                    </button>
                  )}
                  <div className="relative">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold shadow-md ${
                      selectedChat.isSystem 
                        ? 'bg-white/20 text-white text-xl' 
                        : 'bg-indigo-600 text-white shadow-indigo-200'
                    }`}>
                      {selectedChat.avatar}
                    </div>
                  </div>
                  <div>
                    <h3 className={`font-bold text-lg leading-tight ${
                      selectedChat.isSystem ? 'text-white' : 'text-gray-900'
                    }`}>
                      {selectedChat.name}
                    </h3>
                    <p className={`text-xs font-bold flex items-center gap-1 ${
                      selectedChat.isSystem ? 'text-indigo-200' : 'text-green-600'
                    }`}>
                      {selectedChat.isSystem 
                        ? `${notifications.length} notifications` 
                        : selectedChat.online ? 'Active Now' : 'Offline'
                      }
                    </p>
                  </div>
                </div>
                
                {/* Chat Actions (not for system) */}
                {!selectedChat.isSystem && (
                  <div className="relative">
                    <button 
                      onClick={() => setShowChatMenu(!showChatMenu)}
                      className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <MoreVertical className="w-5 h-5 text-gray-500" />
                    </button>
                    
                    {showChatMenu && (
                      <>
                        <div className="fixed inset-0 z-30" onClick={() => setShowChatMenu(false)}></div>
                        <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-40 py-1 animate-fadeIn">
                          <button 
                            onClick={handleDeleteChat}
                            className="w-full px-4 py-2.5 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete Conversation
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}

                {/* Mark all as read button for system */}
                {selectedChat.isSystem && notifications.some(n => !n.read) && (
                  <button
                    onClick={() => markAllNotificationsAsRead()}
                    className="px-4 py-2 bg-white/20 hover:bg-white/30 text-white text-sm font-medium rounded-lg transition-colors flex items-center gap-2"
                  >
                    <CheckCircle className="w-4 h-4" />
                    Mark all read
                  </button>
                )}
              </div>

              {/* Messages / Notifications Area */}
              <div 
                ref={chatContainerRef}
                className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar"
              >
                {selectedChat.isSystem ? (
                  // System Notifications View
                  <>
                    {notifications.length > 0 ? (
                      <div className="space-y-3">
                        {notifications.map((notification) => (
                          <NotificationItem 
                            key={notification._id || notification.id} 
                            notification={notification} 
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                          <Bell className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No notifications</h3>
                        <p className="text-gray-500 max-w-sm">
                          You're all caught up! New notifications about bookings, messages, and reviews will appear here.
                        </p>
                      </div>
                    )}
                  </>
                ) : (
                  // Regular Chat View
                  <>
                    {bookingSuggestion && <BookingSuggestionCard suggestion={bookingSuggestion} />}
                    
                    {conversation.length > 0 ? (
                      conversation.map((msg, index) => {
                        const isOwn = (msg.senderId?._id || msg.senderId) === currentUserId;
                        const isImage = msg.content?.startsWith('[IMAGE]');
                        
                        return (
                          <div key={msg._id || msg.messageId || index} className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                            <div className={`max-w-[70%] ${isOwn ? 'order-2' : 'order-1'}`}>
                              <div className={`px-4 py-3 rounded-2xl ${
                                isOwn 
                                  ? 'bg-gray-900 text-white rounded-br-md' 
                                  : 'bg-white text-gray-800 rounded-bl-md shadow-sm border border-gray-100'
                              }`}>
                                {isImage ? (
                                  <img 
                                    src={msg.content.replace('[IMAGE] ', '')} 
                                    alt="Shared" 
                                    className="max-w-full rounded-lg"
                                  />
                                ) : (
                                  <p className="text-sm leading-relaxed">{msg.content}</p>
                                )}
                              </div>
                              <p className={`text-[10px] text-gray-400 mt-1 ${isOwn ? 'text-right' : 'text-left'}`}>
                                {formatTime(msg.createdAt || msg.timestamp)}
                              </p>
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="flex flex-col items-center justify-center h-full text-center py-20">
                        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                          <MessageSquare className="w-10 h-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2">Start a conversation</h3>
                        <p className="text-gray-500 max-w-sm">
                          Send a message to {selectedChat.name} to begin chatting.
                        </p>
                      </div>
                    )}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area (not for system) */}
              {!selectedChat.isSystem && (
                <>
                  {/* Attachment Preview */}
                  {pendingAttachment && (
                    <div className="px-6 pt-4 bg-white border-t border-gray-100">
                      <div className="relative inline-block">
                        {pendingAttachment.type === 'image' ? (
                          <img 
                            src={pendingAttachment.preview} 
                            alt="Preview" 
                            className="max-h-32 rounded-lg border border-gray-200"
                          />
                        ) : (
                          <div className="flex items-center gap-2 bg-gray-100 px-4 py-2 rounded-lg">
                            <Paperclip className="w-4 h-4 text-gray-500" />
                            <span className="text-sm text-gray-700">{pendingAttachment.file.name}</span>
                          </div>
                        )}
                        <button
                          onClick={() => setPendingAttachment(null)}
                          className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  )}

                  <div className="p-6 bg-white border-t border-gray-100">
                    <form
                      onSubmit={handleSendMessage}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      className="flex items-end gap-3 bg-gray-50 p-2 rounded-[28px] border border-gray-200 focus-within:border-indigo-500/30 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white transition-all shadow-sm"
                    >
                      <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        className="hidden"
                        accept="image/*,.pdf,.doc,.docx"
                      />
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="p-3 text-gray-400 hover:text-indigo-500 hover:bg-indigo-50 rounded-full transition-colors"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      
                      <textarea
                        ref={textareaRef}
                        value={messageInput}
                        onChange={(e) => setMessageInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && !e.shiftKey) {
                            e.preventDefault();
                            handleSendMessage(e);
                          }
                        }}
                        onPaste={handlePaste}
                        placeholder="Type a message..."
                        className="flex-1 bg-transparent border-none outline-none text-sm px-2 py-3 text-gray-700 placeholder-gray-400 resize-none max-h-32 min-h-[44px]"
                        rows="1"
                      />
                      
                      <button
                        type="submit"
                        disabled={!messageInput.trim() && !pendingAttachment}
                        className="p-3 bg-gray-900 text-white rounded-full hover:bg-gray-800 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-gray-200"
                      >
                        <Send className="w-5 h-5" />
                      </button>
                    </form>
                  </div>
                </>
              )}
            </>
          ) : (
            // No chat selected
            <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mb-6">
                <MessageSquare className="w-12 h-12 text-gray-300" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-2">Select a conversation</h3>
              <p className="text-gray-500 max-w-sm mb-6">
                Choose a contact from the list or start a new conversation.
              </p>
              <button
                onClick={() => setShowNewChatModal(true)}
                className="px-6 py-3 bg-gray-900 text-white rounded-full font-medium hover:bg-gray-800 transition-all flex items-center gap-2"
              >
                <UserPlus className="w-5 h-5" />
                New Chat
              </button>
            </div>
          )}
        </div>

        {/* New Chat Modal */}
        {showNewChatModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-sm">
            <div className="bg-white rounded-[28px] shadow-2xl w-full max-w-md overflow-hidden animate-fadeIn">
              <div className="p-6 border-b border-gray-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xl font-bold text-gray-900">New Conversation</h3>
                  <button
                    onClick={() => { setShowNewChatModal(false); setNewChatSearch(''); }}
                    className="p-2 hover:bg-gray-100 rounded-full"
                  >
                    <X className="w-5 h-5 text-gray-500" />
                  </button>
                </div>
                <div className="relative">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={newChatSearch}
                    onChange={(e) => setNewChatSearch(e.target.value)}
                    placeholder="Search users..."
                    className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 rounded-xl outline-none text-sm focus:ring-2 focus:ring-indigo-100"
                    autoFocus
                  />
                </div>
              </div>
              <div className="max-h-80 overflow-y-auto p-4 space-y-2">
                {filteredNewChatUsers.length > 0 ? (
                  filteredNewChatUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleStartNewChat(u)}
                      className="w-full p-3 rounded-xl hover:bg-gray-50 flex items-center gap-3 text-left transition-colors"
                    >
                      <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                        {u.avatar}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{u.name}</p>
                        <p className="text-xs text-gray-500">{u.role || 'User'}</p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-400">
                    {newChatSearch ? 'No users found' : 'Type to search users'}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
