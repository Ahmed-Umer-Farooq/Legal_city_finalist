import React from 'react';
import { useAuth } from '../../context/AuthContext';
import ChatPage from './ChatPage';

const Messages = () => {
  const { user } = useAuth();
  return <ChatPage key={`user-chat-${user?.id || 'no-user'}`} />;
};

export default Messages;