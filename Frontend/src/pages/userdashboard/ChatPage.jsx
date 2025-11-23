import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../context/AuthContext';
import chatService from '../../utils/chatService';
import { Send, Search, MoreVertical, Phone, Video, Paperclip, Smile, CheckCheck, MessageCircle, Settings, Bell, Users, Archive, Star, Shield, Zap, Crown } from 'lucide-react';

const ChatPage = () => {
  const { user } = useAuth();
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState(new Set());
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const fileInputRef = useRef(null);

  const userType = (user?.role === 'lawyer' || user?.registration_id || window.location.pathname.includes('lawyer')) ? 'lawyer' : 'user';

  useEffect(() => {
    if (!user) return;

    console.log('🚀 Chat initialized for user:', user.id, 'as type:', userType);
    
    chatService.disconnect();
    
    const socketInstance = chatService.connect({ 
      userId: user.id, 
      userType: userType 
    });
    setSocket(socketInstance);

    socketInstance.on('connect', () => {
      setIsConnected(true);
      console.log('✅ Socket connected!');
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    loadConversations();

    // Check if user came from lawyer profile with a specific chat partner
    const chatPartner = localStorage.getItem('chatPartner');
    const pendingChat = localStorage.getItem('pendingChat');
    
    if (chatPartner) {
      const partner = JSON.parse(chatPartner);
      console.log('🎯 Auto-selecting conversation from chatPartner:', partner);
      setSelectedConversation({
        partner_id: partner.partner_id,
        partner_type: partner.partner_type,
        partner_name: partner.partner_name,
        last_message: null,
        unread_count: 0
      });
      localStorage.removeItem('chatPartner'); // Clear after use
    } else if (pendingChat) {
      const partner = JSON.parse(pendingChat);
      console.log('🎯 Auto-selecting conversation from pendingChat:', partner);
      setSelectedConversation({
        partner_id: partner.partner_id,
        partner_type: partner.partner_type,
        partner_name: partner.partner_name,
        last_message: null,
        unread_count: 0
      });
      localStorage.removeItem('pendingChat'); // Clear after use
    }

    return () => {
      chatService.removeAllListeners();
      chatService.disconnect();
    };
  }, [user?.id, userType]);

  const loadConversations = async () => {
    try {
      const conversations = await chatService.getConversations();
      setConversations(Array.isArray(conversations) ? conversations : []);
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    }
  };

  const loadMessages = async () => {
    if (!selectedConversation) return;
    
    try {
      const messages = await chatService.getMessages(
        selectedConversation.partner_id,
        selectedConversation.partner_type
      );
      setMessages(messages || []);
      
      // Mark as read
      await chatService.markAsRead(
        selectedConversation.partner_id,
        selectedConversation.partner_type
      );
      loadConversations();
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  useEffect(() => {
    if (selectedConversation) {
      loadMessages();
    }
  }, [selectedConversation]);

  // Socket listeners
  useEffect(() => {
    if (!socket) return;

    chatService.onMessageReceived((message) => {
      console.log('📨 Received message:', message);
      
      const isForCurrentUser = message.receiver_id === user.id && message.receiver_type === userType;
      
      if (isForCurrentUser) {
        if (selectedConversation && 
            message.sender_id === selectedConversation.partner_id && 
            message.sender_type === selectedConversation.partner_type) {
          setMessages(prev => [...prev, message]);
        }
        loadConversations();
      }
    });

    chatService.onMessageSent((message) => {
      console.log('✅ Message sent:', message);
      loadConversations();
    });

    chatService.onUserStatus(({ userId, status }) => {
      setOnlineUsers(prev => {
        const updated = new Set(prev);
        if (status === 'online') {
          updated.add(userId);
        } else {
          updated.delete(userId);
        }
        return updated;
      });
    });

    chatService.onTyping((data) => {
      if (selectedConversation && data.sender_id === selectedConversation.partner_id) {
        setIsTyping(data.isTyping);
      }
    });

    chatService.onRefreshConversations(() => {
      loadConversations();
    });

    return () => {
      chatService.removeAllListeners();
    };
  }, [socket, selectedConversation, user.id, userType]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !selectedConversation || !socket) return;

    let messageData = {
      sender_id: user.id,
      sender_type: userType,
      receiver_id: selectedConversation.partner_id,
      receiver_type: selectedConversation.partner_type,
      content: newMessage.trim() || 'File attachment',
      message_type: selectedFile ? 'file' : 'text'
    };

    // Handle file upload
    if (selectedFile) {
      setUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', selectedFile);
        formData.append('sender_id', user.id);
        formData.append('sender_type', userType);
        formData.append('receiver_id', selectedConversation.partner_id);
        formData.append('receiver_type', selectedConversation.partner_type);
        
        const response = await fetch('http://localhost:5001/api/chat/upload', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });
        
        const result = await response.json();
        messageData.file_url = result.file_url;
        messageData.file_name = selectedFile.name;
        messageData.file_size = selectedFile.size;
        messageData.content = `📎 ${selectedFile.name}`;
      } catch (error) {
        console.error('File upload failed:', error);
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    // Add message locally for instant feedback
    const tempMessage = {
      id: Date.now(),
      ...messageData,
      created_at: new Date().toISOString()
    };
    setMessages(prev => [...prev, tempMessage]);
    // No auto scroll
    
    chatService.sendMessage(messageData);
    setNewMessage('');
    setSelectedFile(null);
    stopTyping();
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const removeSelectedFile = () => {
    setSelectedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleTyping = (e) => {
    setNewMessage(e.target.value);
    
    if (!socket || !selectedConversation) return;

    chatService.sendTyping(user.id, selectedConversation.partner_id);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      stopTyping();
    }, 2000);
  };

  const stopTyping = () => {
    if (socket && selectedConversation) {
      chatService.stopTyping(user.id, selectedConversation.partner_id);
    }
  };

  const scrollToBottom = () => {
    setTimeout(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 100);
  };

  const scrollToBottomInstant = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'instant' });
  };

  const isUserOnline = (partnerId) => {
    return onlineUsers.has(partnerId);
  };

  const filteredConversations = (conversations || []).filter(conv =>
    conv.partner_name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-screen bg-gray-50 overflow-hidden">
      {/* Conversations Sidebar */}
      <div className="w-1/3 bg-white border-r border-gray-200 shadow-lg flex flex-col">

        
        {/* Header */}
        <div className="bg-gray-800 text-white p-6 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-white/30 to-white/10 rounded-2xl flex items-center justify-center backdrop-blur-sm border border-white/20 shadow-lg">
                  <span className="text-xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">{user?.name?.charAt(0) || 'U'}</span>
                </div>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-400 rounded-full border-2 border-white shadow-sm animate-pulse"></div>
              </div>
              <div>
                <h2 className="text-xl font-bold text-white">Legal Chat</h2>
                <p className="text-gray-200 text-sm">{userType === 'lawyer' ? 'Attorney Portal' : 'Client Portal'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <button className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110">
                <Settings className="w-5 h-5" />
              </button>
              <button className="p-2 hover:bg-white/10 rounded-xl transition-all duration-300 hover:scale-110">
                <Bell className="w-5 h-5" />
              </button>
            </div>
          </div>
          
          {/* Enhanced Search */}
          <div className="relative group">
            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-white/10 rounded-2xl blur-sm group-hover:blur-none transition-all duration-300"></div>
            <div className="relative flex items-center">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white/70 group-hover:text-white transition-colors" size={20} />
              <input
                type="text"
                placeholder="Search conversations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-white/60 focus:outline-none focus:bg-white/20 focus:border-white/40 transition-all duration-300 backdrop-blur-sm"
              />
            </div>
          </div>
        </div>

        {/* Conversations List */}
        <div className="relative z-10 flex-1 overflow-y-auto custom-scrollbar">
          {filteredConversations.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-500 p-8">
              <div className="relative mb-6">
                <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-purple-100 rounded-3xl flex items-center justify-center shadow-xl">
                  <MessageCircle className="w-10 h-10 text-blue-500" />
                </div>
                <div className="absolute -top-2 -right-2 w-8 h-8 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              </div>
              <h3 className="text-lg font-semibold text-gray-700 mb-2">No conversations yet</h3>
              <p className="text-center text-sm text-gray-500 mb-4">Start connecting with {userType === 'lawyer' ? 'clients' : 'legal professionals'}</p>
              <div className="px-4 py-2 bg-gradient-to-r from-blue-500 to-purple-600 text-white rounded-full text-sm font-medium shadow-lg">
                ✨ Professional Legal Chat
              </div>
            </div>
          ) : (
            <div className="p-2">
              {filteredConversations.map((conv, index) => (
                <div
                  key={`${conv.partner_id}-${conv.partner_type}`}
                  onClick={() => setSelectedConversation(conv)}
                  className={`group relative p-4 mb-2 rounded-2xl cursor-pointer transition-all duration-300 hover:scale-[1.02] hover:shadow-lg ${
                    selectedConversation?.partner_id === conv.partner_id 
                      ? 'bg-gradient-to-r from-blue-500/10 to-purple-500/10 border-2 border-blue-200 shadow-lg' 
                      : 'bg-white/60 hover:bg-white/80 border border-white/40'
                  }`}
                >
                  {/* Conversation Item */}
                  <div className="flex items-center space-x-4">
                    <div className="relative">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg ${
                        selectedConversation?.partner_id === conv.partner_id
                          ? 'bg-gradient-to-br from-blue-500 to-purple-600'
                          : 'bg-gradient-to-br from-indigo-500 to-purple-600'
                      }`}>
                        {conv.partner_name?.charAt(0) || 'U'}
                      </div>
                      {isUserOnline(conv.partner_id) && (
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-3 border-white rounded-full shadow-sm animate-pulse">
                          <div className="w-full h-full bg-green-500 rounded-full animate-ping"></div>
                        </div>
                      )}
                      {userType === 'lawyer' && (
                        <div className="absolute -top-1 -left-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                          <Crown className="w-3 h-3 text-white" />
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-bold text-gray-800 truncate group-hover:text-blue-600 transition-colors">
                          {conv.partner_name}
                        </h3>
                        <div className="flex items-center space-x-2">
                          {conv.last_message_time && (
                            <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full">
                              {new Date(conv.last_message_time).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                            </span>
                          )}
                          {conv.unread_count > 0 && (
                            <div className="relative">
                              <span className="bg-gradient-to-r from-red-500 to-pink-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center font-bold shadow-lg animate-bounce">
                                {conv.unread_count}
                              </span>
                              <div className="absolute inset-0 bg-red-400 rounded-full animate-ping opacity-75"></div>
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600 truncate flex-1 mr-2">
                          {conv.last_message || (
                            <span className="italic text-gray-400 flex items-center">
                              <MessageCircle className="w-3 h-3 mr-1" />
                              Start conversation
                            </span>
                          )}
                        </p>
                        <div className="flex items-center space-x-1">
                          {isUserOnline(conv.partner_id) && (
                            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          )}
                          <Star className="w-3 h-3 text-yellow-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Chat Area */}
      <div className="flex-1 flex flex-col bg-white">
        {selectedConversation ? (
          <>
            {/* Chat Header */}
            <div className="bg-white border-b border-gray-200 p-6 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="relative group">
                    <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-xl group-hover:scale-110 transition-transform duration-300">
                      {selectedConversation.partner_name?.charAt(0) || 'U'}
                    </div>
                    {isUserOnline(selectedConversation.partner_id) && (
                      <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-400 border-3 border-white rounded-full shadow-lg">
                        <div className="w-full h-full bg-green-500 rounded-full animate-ping"></div>
                      </div>
                    )}
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-full flex items-center justify-center shadow-lg">
                      <Shield className="w-3 h-3 text-white" />
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="text-xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent">
                      {selectedConversation.partner_name}
                    </h3>
                    <div className="flex items-center space-x-2">
                      {isUserOnline(selectedConversation.partner_id) ? (
                        <div className="flex items-center space-x-2">
                          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                          <span className="text-sm font-medium text-green-600">Online now</span>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">Last seen recently</span>
                      )}
                      <div className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">
                        {selectedConversation.partner_type === 'lawyer' ? '⚖️ Attorney' : '👤 Client'}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <button className="p-3 hover:bg-blue-50 rounded-2xl transition-all duration-300 hover:scale-110 group">
                    <Video size={22} className="text-blue-600 group-hover:text-blue-700" />
                  </button>
                  <button className="p-3 hover:bg-green-50 rounded-2xl transition-all duration-300 hover:scale-110 group">
                    <Phone size={22} className="text-green-600 group-hover:text-green-700" />
                  </button>
                  <button className="p-3 hover:bg-gray-50 rounded-2xl transition-all duration-300 hover:scale-110 group">
                    <MoreVertical size={22} className="text-gray-600 group-hover:text-gray-700" />
                  </button>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-6 bg-gray-50 custom-scrollbar">
              {messages.map((message, index) => {
                const isMine = message.sender_id === user.id && message.sender_type === userType;
                const showAvatar = index === 0 || messages[index - 1]?.sender_id !== message.sender_id;
                
                return (
                  <div
                    key={message.id}
                    className={`mb-4 flex items-end space-x-3 group ${isMine ? 'justify-end flex-row-reverse space-x-reverse' : 'justify-start'}`}
                  >
                    {/* Avatar */}
                    {showAvatar && (
                      <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-600 font-semibold text-sm">
                        {isMine ? user?.name?.charAt(0) : selectedConversation.partner_name?.charAt(0)}
                      </div>
                    )}
                    
                    {/* Message Bubble */}
                    <div className={`relative max-w-xs lg:max-w-md ${showAvatar ? '' : isMine ? 'mr-13' : 'ml-13'}`}>
                      <div className="px-4 py-2">
                        {message.message_type === 'file' ? (
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Paperclip className={`w-4 h-4 ${
                                isMine ? 'text-gray-600' : 'text-gray-600'
                              }`} />
                              <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${
                                  isMine ? 'text-gray-900' : 'text-gray-900'
                                }`}>
                                  {message.file_name || 'File attachment'}
                                </p>
                                {message.file_size && (
                                  <p className={`text-xs ${
                                    isMine ? 'text-gray-600' : 'text-gray-500'
                                  }`}>
                                    {(message.file_size / 1024).toFixed(1)} KB
                                  </p>
                                )}
                              </div>
                              {message.file_url && (
                                <a 
                                  href={`http://localhost:5001${message.file_url}`} 
                                  download={message.file_name}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-blue-500 hover:text-blue-600"
                                >
                                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                </a>
                              )}
                            </div>
                            {message.content !== `📎 ${message.file_name}` && (
                              <p className="text-sm">{message.content}</p>
                            )}
                          </div>
                        ) : (
                          <p className="text-sm">{message.content}</p>
                        )}
                        
                        {/* Message Footer */}
                        <div className={`flex items-center justify-end mt-1 space-x-1`}>
                          <span className={`text-xs ${
                            isMine ? 'text-gray-600' : 'text-gray-500'
                          }`}>
                            {new Date(message.created_at).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </span>
                          {isMine && (
                            <div className="flex items-center">
                              {message.read_status === 1 ? (
                                <CheckCheck size={14} className="text-blue-500" title="Read" />
                              ) : (
                                <CheckCheck size={14} className="text-gray-500" title="Delivered" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      

                    </div>
                  </div>
                );
              })}
              {isTyping && (
                <div className="flex justify-start mb-4 items-end space-x-3">
                  <div className="w-10 h-10 rounded-2xl flex items-center justify-center text-gray-600 font-semibold text-sm">
                    {selectedConversation.partner_name?.charAt(0)}
                  </div>
                  <div className="px-6 py-4">
                    <div className="flex space-x-2 items-center">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">typing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Message Input */}
            <div className="bg-white border-t border-gray-200 p-6 shadow-sm">
              {/* File Preview */}
              {selectedFile && (
                <div className="mb-4 p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Paperclip className="w-5 h-5 text-gray-600" />
                      <div>
                        <p className="font-medium text-gray-800">{selectedFile.name}</p>
                        <p className="text-sm text-gray-500">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                      </div>
                    </div>
                    <button 
                      type="button" 
                      onClick={removeSelectedFile}
                      className="p-2 text-red-500"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
              
              <form onSubmit={sendMessage} className="flex items-end space-x-4">
                {/* Attachment Button */}
                <div className="relative">
                  <input 
                    ref={fileInputRef}
                    type="file" 
                    onChange={handleFileSelect}
                    className="hidden"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif"
                  />
                  <button 
                    type="button" 
                    onClick={() => fileInputRef.current?.click()}
                    disabled={uploading}
                    className="p-3 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-2xl transition-all duration-300 hover:scale-110 group disabled:opacity-50"
                  >
                    <Paperclip size={22} className="group-hover:rotate-12 transition-transform" />
                  </button>
                </div>
                
                {/* Message Input Container */}
                <div className="flex-1 relative">
                  <div className="bg-white/90 backdrop-blur-sm rounded-3xl border-2 border-gray-200 focus-within:border-blue-400 transition-all duration-300 shadow-lg hover:shadow-xl">
                    <div className="flex items-center px-6 py-4">
                      <input
                        type="text"
                        value={newMessage}
                        onChange={handleTyping}
                        placeholder="Type your message..."
                        className="flex-1 outline-none text-gray-800 placeholder-gray-500 bg-transparent font-medium"
                      />
                      <button 
                        type="button" 
                        className="p-2 text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 rounded-2xl transition-all duration-300 hover:scale-110"
                      >
                        <Smile size={20} />
                      </button>
                    </div>
                  </div>
                  
                  {/* Quick Actions */}
                  <div className="absolute right-4 -top-12 flex space-x-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110">
                      <Video size={16} className="text-blue-500" />
                    </button>
                    <button className="p-2 bg-white rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110">
                      <Phone size={16} className="text-green-500" />
                    </button>
                  </div>
                </div>
                
                {/* Send Button */}
                <button
                  type="submit"
                  disabled={(!newMessage.trim() && !selectedFile) || uploading}
                  className={`relative p-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl ${
                    (newMessage.trim() || selectedFile) && !uploading
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:scale-110 hover:rotate-12' 
                      : 'bg-gray-200 text-gray-400 scale-95 cursor-not-allowed'
                  }`}
                >
                  {uploading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <Send size={20} className={(newMessage.trim() || selectedFile) ? 'animate-pulse' : ''} />
                  )}
                  {(newMessage.trim() || selectedFile) && !uploading && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-purple-500 rounded-2xl animate-ping opacity-25"></div>
                  )}
                </button>
              </form>
              
              {/* Connection Status */}
              <div className="flex items-center justify-center mt-4">
                <div className={`flex items-center space-x-2 px-4 py-2 rounded-full text-xs font-medium shadow-lg backdrop-blur-sm ${
                  isConnected 
                    ? 'text-green-700 bg-green-100/80 border border-green-200' 
                    : 'text-red-700 bg-red-100/80 border border-red-200'
                }`}>
                  <div className={`w-2 h-2 rounded-full ${
                    isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500 animate-bounce'
                  }`}></div>
                  <span>{isConnected ? 'Secure Connection Active' : 'Reconnecting...'}</span>
                  {isConnected && <Shield size={12} />}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center bg-gradient-to-br from-blue-50/50 to-purple-50/30">
            <div className="text-center max-w-md mx-auto p-8">
              {/* Animated Logo */}
              <div className="relative mb-8">
                <div className="w-40 h-40 bg-gradient-to-br from-white to-blue-50 rounded-3xl flex items-center justify-center mx-auto shadow-2xl">
                  <div className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl animate-pulse">
                    <MessageCircle className="w-12 h-12 text-white" />
                  </div>
                </div>
                
                {/* Floating Elements */}
                <div className="absolute -top-4 -right-4 w-12 h-12 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg animate-bounce">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-4 -left-4 w-10 h-10 bg-gradient-to-r from-green-400 to-emerald-500 rounded-2xl flex items-center justify-center shadow-lg animate-pulse">
                  <Shield className="w-5 h-5 text-white" />
                </div>
                <div className="absolute top-1/2 -left-8 w-8 h-8 bg-gradient-to-r from-pink-400 to-rose-500 rounded-full flex items-center justify-center shadow-lg animate-ping">
                  <Zap className="w-4 h-4 text-white" />
                </div>
              </div>
              
              {/* Welcome Text */}
              <div className="space-y-4">
                <h3 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Legal City Chat
                </h3>
                <p className="text-lg text-gray-600 font-medium">
                  Professional Legal Communication Platform
                </p>
                <p className="text-gray-500">
                  Select a conversation to start secure messaging
                </p>
              </div>
              
              {/* Features */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg">
                  <Shield className="w-6 h-6 text-blue-500 mx-auto mb-2" />
                  <p className="text-xs font-medium text-gray-700">Secure & Encrypted</p>
                </div>
                <div className="p-4 bg-white/60 backdrop-blur-sm rounded-2xl border border-white/40 shadow-lg">
                  <Zap className="w-6 h-6 text-purple-500 mx-auto mb-2" />
                  <p className="text-xs font-medium text-gray-700">Real-time Messaging</p>
                </div>
              </div>
              
              {/* Status Badge */}
              <div className="mt-6 inline-flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-100 to-emerald-100 rounded-full border border-green-200">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-sm font-medium text-green-700">System Online</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// Add custom scrollbar styles
const styles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 6px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: rgba(0,0,0,0.1);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: linear-gradient(45deg, #3b82f6, #8b5cf6);
    border-radius: 10px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(45deg, #2563eb, #7c3aed);
  }
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.innerText = styles;
  document.head.appendChild(styleSheet);
}

export default ChatPage;