import { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { useAI } from '../../context/AIContext';
import { 
  MessageSquare, Send, Search, MoreVertical, Paperclip, Smile, 
  ArrowLeft, UserPlus, X, Trash2, Calendar, Clock, FileText, Image as ImageIcon
} from 'lucide-react';
import { AIService } from '../../ai/services/AIService';

const MessagesPage = () => {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const { 
    sendMessage, getConversation, markConversationAsRead, 
    fetchMessages, fetchContacts, fetchAllUsers, deleteConversation 
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

  // Handle responsive view
  useEffect(() => {
    const handleResize = () => setIsMobileView(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Fetch contacts from API (users we've messaged with)
  useEffect(() => {
    const loadContacts = async () => {
      setIsLoadingContacts(true);
      try {
        const apiContacts = await fetchContacts();
        setContacts(apiContacts);
      } catch (err) {
        console.error('Failed to load contacts:', err);
      } finally {
        setIsLoadingContacts(false);
      }
    };

    if (currentUserId) {
      loadContacts();
    }
  }, [currentUserId, fetchContacts]);

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
      const existingContact = contacts.find(c => c.id === contactId);

      if (existingContact) {
        handleSelectChat(existingContact);
      } else {
        // Create a temporary contact for new chat
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

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Filter users for new chat (exclude already existing contacts)
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
    
    // Add to contacts list
    setContacts(prev => [newContact, ...prev]);
    setSelectedChat(newContact);
    setShowNewChatModal(false);
    setNewChatSearch('');
  };

  // Get conversation for selected chat
  const conversation = selectedChat ? getConversation(currentUserId, selectedChat.id) : [];

  // Fetch messages when selecting a chat
  useEffect(() => {
    if (selectedChat?.id) {
      fetchMessages(selectedChat.id);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedChat?.id]); // Only re-fetch when contact changes

  // Auto-scroll to bottom when conversation changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Mark messages as read when opening a conversation
  const handleSelectChat = (contact) => {
    setSelectedChat(contact);
    markConversationAsRead(currentUserId, contact.id);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if ((!messageInput.trim() && !pendingAttachment) || !selectedChat) return;

    const toSend = [];

    // Prepare text message
    if (messageInput.trim()) {
      toSend.push({
        senderId: currentUserId,
        receiverId: selectedChat.id,
        content: messageInput.trim()
      });
    }

    // Prepare attachment message
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

    // Clear UI immediately
    setMessageInput('');
    setPendingAttachment(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }

    // Send all messages
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
    if (!selectedChat) return;
    const success = await deleteConversation(selectedChat.id);
    if (success) {
      setContacts(prev => prev.filter(c => c.id !== selectedChat.id));
      setSelectedChat(null);
      setShowChatMenu(false);
    }
  };

  // Unified file processing logic
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

  // Handle file upload from button
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    processFile(file);
    e.target.value = ''; // Reset input
  };

  // Handle paste event (images)
  const handlePaste = (e) => {
    const items = e.clipboardData?.items;
    if (items) {
      for (const item of items) {
        if (item.type.startsWith('image/')) {
          e.preventDefault(); // Prevent pasting the binary string/filename
          const file = item.getAsFile();
          processFile(file);
          return; // Process one file at a time
        }
      }
    }
  };

  // Handle file drop
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

  // AI Booking Suggestion Component
  useEffect(() => {
    if (!conversation.length || isAnalyzing) return;
    
    const lastMsg = conversation[conversation.length - 1];
    // Only analyze if last message is from the other person (to suggest booking to current user)
    const isFromOther = (lastMsg.senderId?._id || lastMsg.senderId) !== currentUserId;
    
    if (isFromOther) {
      const detectIntent = async () => {
        setIsAnalyzing(true);
        try {
          // Simple direct simulation for now
          if (lastMsg.content.toLowerCase().match(/(book|schedule|meet|time|tomorrow|monday|tuesday|class)/)) {
             setBookingSuggestion({
               type: 'booking',
               time: 'Tomorrow at 10:00 AM', // Mock for demo
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

  // AI Booking Suggestion Component
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
                  state: { 
                    tutorId: selectedChat.id, 
                    prefillTime: suggestion.time 
                  } 
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

  // Format timestamp
  const formatTime = (timestamp) => {
    if (!timestamp) return '';
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-screen bg-[#F2F5F9] p-4 md:p-6 flex items-center justify-center font-sans overflow-hidden">
      <div className="w-full max-w-[1600px] bg-white rounded-[32px] shadow-2xl shadow-gray-200/50 h-[calc(100vh-60px)] overflow-hidden flex gap-0 md:gap-6 relative">
        
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
                      ? 'bg-gray-900 text-white shadow-lg shadow-gray-900/20 scale-[1.02]' 
                      : 'hover:bg-gray-50 text-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    <div className="relative">
                      <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold shadow-sm ${
                        selectedChat?.id === contact.id 
                          ? 'bg-gray-800 text-white' 
                          : 'bg-white border border-gray-100 text-gray-900'
                      }`}>
                        {contact.avatar}
                      </div>
                      {contact.online && (
                        <span className="absolute bottom-0.5 right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className={`font-bold truncate text-[15px] ${selectedChat?.id === contact.id ? 'text-white' : 'text-gray-900'}`}>
                          {contact.name}
                        </h3>
                        {contact.unread > 0 && (
                          <span className="bg-indigo-500 text-white text-[10px] rounded-full px-2 py-0.5 font-bold shadow-sm shadow-indigo-500/30">
                            {contact.unread}
                          </span>
                        )}
                      </div>
                      <p className={`text-sm truncate font-medium ${selectedChat?.id === contact.id ? 'text-gray-400' : 'text-gray-500'}`}>
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
              <div className="h-20 px-6 bg-white border-b border-gray-100 flex items-center justify-between flex-shrink-0 z-20">
                <div className="flex items-center gap-4">
                  {isMobileView && (
                    <button onClick={() => setSelectedChat(null)} className="p-2 hover:bg-gray-100 rounded-full -ml-2">
                      <ArrowLeft className="w-5 h-5 text-gray-600" />
                    </button>
                  )}
                  <div className="relative">
                    <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
                      {selectedChat.avatar}
                    </div>
                    {selectedChat.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full shadow-sm"></span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-lg leading-tight">{selectedChat.name}</h3>
                    <p className="text-xs text-green-600 font-bold flex items-center gap-1">
                      {selectedChat.online ? 'Active Now' : 'Offline'}
                    </p>
                  </div>
                </div>
                
                {/* Chat Actions */}
                <div className="relative">
                  <button 
                    onClick={() => setShowChatMenu(!showChatMenu)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <MoreVertical className="w-5 h-5 text-gray-500" />
                  </button>
                  
                  {/* Dropdown Menu */}
                  {showChatMenu && (
                    <>
                      <div 
                        className="fixed inset-0 z-30" 
                        onClick={() => setShowChatMenu(false)}
                      ></div>
                      <div className="absolute right-0 top-12 w-48 bg-white rounded-xl shadow-xl border border-gray-100 z-40 py-1 animate-fadeIn">
                        <button 
                          onClick={handleDeleteChat}
                          className="w-full px-4 py-3 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2 font-medium"
                        >
                          <Trash2 className="w-4 h-4" />
                          Delete Conversation
                        </button>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Messages Stream */}
              <div 
                className="flex-1 p-6 overflow-y-auto scroll-smooth" 
                ref={chatContainerRef}
              >
                <div className="max-w-3xl mx-auto space-y-6">
                  {conversation.length > 0 ? (
                    <>
                      {conversation.map((message, i) => {
                        const senderId = message.senderId?._id || message.senderId;
                        const isSent = String(senderId) === String(currentUserId);
                        const showTime = i === conversation.length - 1 || 
                          (conversation[i+1]?.senderId?._id || conversation[i+1]?.senderId) !== senderId;
                        
                        // Check if message is an image
                        const isImage = message.content.startsWith('[IMAGE]');
                        const displayContent = isImage ? message.content.replace('[IMAGE] ', '') : message.content;
                        
                        return (
                          <div key={message._id || message.messageId || i} className={`flex ${isSent ? 'justify-end' : 'justify-start'} group`}>
                            <div className={`max-w-[85%] ${isSent ? 'order-2' : 'order-1'}`}>
                              <div className={`
                                relative px-5 py-3.5 text-[15px] leading-relaxed shadow-sm transition-all
                                ${isSent 
                                  ? 'bg-gray-900 text-white rounded-[20px] rounded-br-none hover:bg-black' 
                                  : 'bg-white text-gray-800 border border-gray-100 rounded-[20px] rounded-bl-none hover:shadow-md'
                                }
                              `}>
                                {isImage ? (
                                  <img src={displayContent} alt="Shared" className="max-w-full rounded-lg my-1" />
                                ) : (
                                  displayContent
                                )}
                              </div>
                              {showTime && (
                                <p className={`text-[11px] font-medium text-gray-400 mt-2 ${isSent ? 'text-right pr-1' : 'text-left pl-1'}`}>
                                  {formatTime(message.createdAt || message.timestamp)}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      
                      {/* AI Suggestion */}
                      {bookingSuggestion && (
                        <BookingSuggestionCard suggestion={bookingSuggestion} />
                      )}
                      
                      <div ref={messagesEndRef} />
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center pt-20 opacity-60">
                      <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mb-6 shadow-sm border border-gray-100">
                        <MessageSquare className="w-10 h-10 text-indigo-300" />
                      </div>
                      <h3 className="text-lg font-bold text-gray-900 mb-2">No messages yet</h3>
                      <p className="text-gray-500 text-sm">Start the conversation!</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Input Area */}
              <div className="bg-white border-t border-gray-100 flex-shrink-0">
                {/* Attachment Preview */}
                {pendingAttachment && (
                  <div className="px-6 pt-4 pb-2 animate-fadeIn">
                    <div className="relative inline-block group">
                      {pendingAttachment.type === 'image' ? (
                        <img 
                          src={pendingAttachment.preview} 
                          alt="Preview" 
                          className="h-32 w-auto rounded-xl border border-gray-200 shadow-sm object-cover"
                        />
                      ) : (
                        <div className="h-24 w-32 bg-gray-50 rounded-xl border border-gray-200 flex flex-col items-center justify-center p-2">
                          <FileText className="w-8 h-8 text-indigo-500 mb-2" />
                          <span className="text-xs text-gray-500 text-center break-all line-clamp-2 font-medium">
                            {pendingAttachment.file.name}
                          </span>
                        </div>
                      )}
                      <button
                        onClick={() => {
                          setPendingAttachment(null);
                          if (fileInputRef.current) fileInputRef.current.value = '';
                        }}
                        className="absolute -top-2 -right-2 p-1 bg-black text-white rounded-full shadow-md hover:bg-gray-800 transition-all hover:scale-110"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                <div className="p-6 pt-2 max-w-3xl mx-auto">
                  <form 
                    onSubmit={handleSendMessage} 
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    className="flex items-end gap-3 bg-gray-50 p-2 rounded-[28px] border border-gray-200 focus-within:border-indigo-500/30 focus-within:ring-4 focus-within:ring-indigo-500/10 focus-within:bg-white transition-all shadow-sm"
                  >
                    <div className="flex items-center pb-1 pl-1">
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        onChange={handleFileUpload}
                        accept="image/*,application/pdf"
                      />
                      <button 
                        type="button" 
                        onClick={() => fileInputRef.current?.click()}
                        className={`p-2 rounded-full transition-colors ${pendingAttachment ? 'text-indigo-600 bg-indigo-50' : 'text-gray-400 hover:text-indigo-600 hover:bg-indigo-50'}`}
                        title="Attach File"
                      >
                        <Paperclip className="w-5 h-5" />
                      </button>
                      <button type="button" className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-full transition-colors">
                        <Smile className="w-5 h-5" />
                      </button>
                    </div>
                    
                    <textarea
                      ref={textareaRef}
                      value={messageInput}
                      onChange={(e) => setMessageInput(e.target.value)}
                      onPaste={handlePaste}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          handleSendMessage(e);
                        }
                      }}
                      placeholder="Type a message, paste an image, or drag & drop files..."
                      className="flex-1 bg-transparent border-none outline-none text-sm px-2 py-3 text-gray-700 placeholder-gray-400 resize-none max-h-32 min-h-[44px]"
                      rows="1"
                    />
                    
                    <button
                      type="submit"
                      disabled={!messageInput.trim() && !pendingAttachment}
                      className="p-3 bg-gray-900 text-white rounded-full hover:bg-black transition-all hover:scale-105 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 shadow-md shadow-gray-900/20 mb-0.5 mr-0.5"
                    >
                      <Send className="w-4 h-4 ml-0.5" />
                    </button>
                  </form>
                </div>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-center p-8">
              <div className="max-w-sm animate-fadeInUp">
                <div className="w-24 h-24 bg-gradient-to-tr from-indigo-50 to-blue-50 rounded-[32px] flex items-center justify-center mx-auto mb-8 shadow-inner rotate-3">
                   <MessageSquare className="w-10 h-10 text-indigo-500 -rotate-3" />
                </div>
                <h3 className="text-2xl font-extrabold text-gray-900 mb-3 tracking-tight">Your Messages</h3>
                <p className="text-gray-500 leading-relaxed mb-8 font-medium">
                  Select a contact from the sidebar to view your conversation or start a new one with a tutor.
                </p>
                <button
                  onClick={() => setShowNewChatModal(true)}
                  className="px-8 py-3 bg-gray-900 text-white rounded-full hover:bg-black transition-all shadow-lg shadow-gray-900/20 hover:-translate-y-1 inline-flex items-center gap-2 font-bold text-sm"
                >
                  <UserPlus className="w-4 h-4" />
                  Start New Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* New Chat Modal */}
      {showNewChatModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-md max-h-[80vh] overflow-hidden animate-scaleIn">
            {/* Modal Header */}
            <div className="p-6 border-b border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-gray-900">Start New Chat</h3>
                <button
                  onClick={() => {
                    setShowNewChatModal(false);
                    setNewChatSearch('');
                  }}
                  className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                >
                  <X className="w-5 h-5 text-gray-500" />
                </button>
              </div>
              <div className="relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-indigo-500" />
                <input
                  type="text"
                  value={newChatSearch}
                  onChange={(e) => setNewChatSearch(e.target.value)}
                  placeholder="Search users..."
                  className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-100 focus:bg-white focus:border-indigo-500/30 focus:ring-4 focus:ring-indigo-500/10 rounded-xl outline-none text-sm font-medium transition-all"
                  autoFocus
                />
              </div>
            </div>

            {/* Users List */}
            <div className="overflow-y-auto max-h-[50vh] p-4 custom-scrollbar">
              {filteredNewChatUsers.length > 0 ? (
                <div className="space-y-2">
                  {filteredNewChatUsers.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => handleStartNewChat(u)}
                      className="w-full p-3 rounded-2xl hover:bg-gray-50 transition-colors text-left flex items-center gap-4 border border-transparent hover:border-gray-100 group"
                    >
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200 group-hover:scale-105 transition-transform">
                        {u.avatar}
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-bold text-gray-900 truncate">{u.name}</h4>
                        <p className="text-xs text-gray-500 truncate font-medium">{u.email}</p>
                      </div>
                      {u.role && (
                        <span className={`text-[10px] px-2.5 py-1 rounded-full font-bold uppercase tracking-wide ${
                          u.role === 'tutor' ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'
                        }`}>
                          {u.role}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                    <Search className="w-5 h-5 text-gray-300" />
                  </div>
                  <p className="text-gray-400 text-sm font-medium">
                    {newChatSearch ? 'No users found' : 'Type to search for users'}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MessagesPage;