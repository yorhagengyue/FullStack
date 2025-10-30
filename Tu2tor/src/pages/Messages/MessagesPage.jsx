import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { MessageSquare, Send, Search, MoreVertical, User, Paperclip, Smile } from 'lucide-react';

const MessagesPage = () => {
  const { user } = useAuth();
  const { tutors, bookings, sendMessage, getConversation, getUnreadCount, getLastMessage, markConversationAsRead } = useApp();
  const [selectedChat, setSelectedChat] = useState(null);
  const [messageInput, setMessageInput] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef(null);

  // Get unique contacts from bookings
  const userBookings = bookings.filter(
    b => b.studentId === user?.userId || b.tutorId === user?.userId
  );

  const contacts = userBookings.map(booking => {
    const isStudent = booking.studentId === user?.userId;
    const contactId = isStudent ? booking.tutorId : booking.studentId;
    const contact = isStudent ? tutors.find(t => t.userId === contactId) : { userId: contactId, username: booking.studentId };

    // Get real message data
    const lastMsg = getLastMessage(user?.userId, contactId);
    const unreadCount = getUnreadCount(user?.userId, contactId);

    return {
      id: contactId,
      name: contact?.username || contactId,
      lastMessage: lastMsg ? lastMsg.content : 'Start a conversation...',
      timestamp: lastMsg ? lastMsg.timestamp : booking.createdAt,
      unread: unreadCount,
      avatar: contact?.username?.charAt(0).toUpperCase() || 'U',
      online: Math.random() > 0.5
    };
  }).filter((contact, index, self) =>
    index === self.findIndex(c => c.id === contact.id)
  ).sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)); // Sort by most recent

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get conversation for selected chat
  const conversation = selectedChat ? getConversation(user?.userId, selectedChat.id) : [];

  // Auto-scroll to bottom when conversation changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversation]);

  // Mark messages as read when opening a conversation
  const handleSelectChat = (contact) => {
    setSelectedChat(contact);
    markConversationAsRead(user?.userId, contact.id);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (messageInput.trim() && selectedChat) {
      sendMessage({
        senderId: user?.userId,
        receiverId: selectedChat.id,
        content: messageInput.trim()
      });
      setMessageInput('');
    }
  };

  // Format timestamp
  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="h-[calc(100vh-8rem)] flex gap-6">
      {/* Contacts Sidebar */}
      <div className="w-80 flex-shrink-0 bg-white rounded-xl border border-gray-200 flex flex-col">
        {/* Header */}
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Messages</h2>

          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search contacts..."
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-sm"
            />
          </div>
        </div>

        {/* Contacts List */}
        <div className="flex-1 overflow-y-auto">
          {filteredContacts.length > 0 ? (
            filteredContacts.map((contact) => (
              <button
                key={contact.id}
                onClick={() => handleSelectChat(contact)}
                className={`w-full p-4 border-b border-gray-100 hover:bg-gray-50 transition-colors text-left ${
                  selectedChat?.id === contact.id ? 'bg-primary-50 border-l-4 border-l-primary-600' : ''
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className="relative">
                    <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                      {contact.avatar}
                    </div>
                    {contact.online && (
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <h3 className="font-semibold text-gray-900 truncate">{contact.name}</h3>
                      {contact.unread > 0 && (
                        <span className="bg-primary-600 text-white text-xs rounded-full px-2 py-0.5 font-bold">
                          {contact.unread}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-500 truncate">{contact.lastMessage}</p>
                  </div>
                </div>
              </button>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full p-8 text-center">
              <MessageSquare className="w-16 h-16 text-gray-300 mb-4" />
              <p className="text-gray-500">No contacts found</p>
              <p className="text-sm text-gray-400 mt-2">
                Book a session to start chatting with tutors
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 bg-white rounded-xl border border-gray-200 flex flex-col">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b border-gray-200 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold">
                    {selectedChat.avatar}
                  </div>
                  {selectedChat.online && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                  )}
                </div>
                <div>
                  <h3 className="font-bold text-gray-900">{selectedChat.name}</h3>
                  <p className="text-xs text-gray-500">
                    {selectedChat.online ? 'Online' : 'Offline'}
                  </p>
                </div>
              </div>
              <button className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                <MoreVertical className="w-5 h-5 text-gray-600" />
              </button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 p-6 overflow-y-auto bg-gray-50">
              {conversation.length > 0 ? (
                <div className="space-y-4">
                  {conversation.map((message) => {
                    const isSent = message.senderId === user?.userId;
                    return (
                      <div
                        key={message.messageId}
                        className={`flex ${isSent ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`max-w-[70%] ${isSent ? 'order-2' : 'order-1'}`}>
                          <div
                            className={`px-4 py-2 rounded-2xl ${
                              isSent
                                ? 'bg-primary-600 text-white'
                                : 'bg-white text-gray-900 border border-gray-200'
                            }`}
                          >
                            <p className="text-sm break-words">{message.content}</p>
                          </div>
                          <p className={`text-xs text-gray-500 mt-1 ${isSent ? 'text-right' : 'text-left'}`}>
                            {formatTime(message.timestamp)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full">
                  <div className="text-center max-w-md">
                    <MessageSquare className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Start a Conversation
                    </h3>
                    <p className="text-gray-500 text-sm mb-6">
                      Send a message to {selectedChat.name} to start your conversation. Discuss session details, ask questions, or share materials.
                    </p>
                    <div className="bg-white p-4 rounded-lg border border-gray-200 text-left">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>💡 Tips for messaging:</strong>
                      </p>
                      <ul className="text-xs text-gray-500 space-y-1">
                        <li>• Be clear about your learning goals</li>
                        <li>• Share any relevant materials beforehand</li>
                        <li>• Respect each other's time</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Message Input */}
            <div className="p-4 border-t border-gray-200 bg-white">
              <form onSubmit={handleSendMessage} className="flex items-end space-x-3">
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Paperclip className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  <Smile className="w-5 h-5" />
                </button>
                <textarea
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage(e);
                    }
                  }}
                  placeholder="Type your message..."
                  rows={1}
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
                />
                <button
                  type="submit"
                  disabled={!messageInput.trim()}
                  className="px-6 py-2 bg-primary-600 hover:bg-primary-700 text-white rounded-lg font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  <Send className="w-4 h-4 mr-2" />
                  Send
                </button>
              </form>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <MessageSquare className="w-24 h-24 text-gray-300 mx-auto mb-4" />
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                Select a conversation
              </h3>
              <p className="text-gray-500">
                Choose a contact from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;
