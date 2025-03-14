'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { connectSocket, disconnectSocket } from '../lib/socket';
import MessageList from './MessageList';
import MessageInput from './MessageInput';

type Message = {
  sender: string;
  content: string;
  timestamp: Date;
};

export default function ChatRoom() {
  const [username, setUsername] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    const storedUsername = sessionStorage.getItem('username');
    
    if (!storedUsername) {
      router.push('/');
      return;
    }
    
    setUsername(storedUsername);
    
    const socket = connectSocket();
    socket.emit('join', { username: storedUsername });
    
    socket.on('previousMessages', (previousMessages: Message[]) => {
      setMessages(previousMessages);
    });
    
    socket.on('newMessage', (message: Message) => {
      setMessages((prev) => [...prev, message]);
    });
    
    socket.on('userJoined', (user: { username: string }) => {
      setOnlineUsers((prev) => [...prev, user.username]);
    });
    
    socket.on('userLeft', (user: { username: string }) => {
      setOnlineUsers((prev) => prev.filter((u) => u !== user.username));
    });
    
    return () => {
      disconnectSocket();
    };
  }, [router]);

  const handleSendMessage = (content: string) => {
    const socket = connectSocket();
    
    const message: Message = {
      sender: username,
      content,
      timestamp: new Date(),
    };
    
    socket.emit('sendMessage', message);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 transition-all duration-300">
      <header className="bg-gradient-to-r from-blue-500 to-blue-600 dark:from-blue-700 dark:to-blue-800 text-white p-4 shadow-lg transition-all duration-300">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold animate-bounce">ChatHub</h1>
          <div className="text-sm">
            Logged in as: <span className="font-semibold">{username}</span>
          </div>
        </div>
        {onlineUsers.length > 0 && (
          <div className="mt-2 max-w-4xl mx-auto text-xs">
            Online Users: {onlineUsers.join(', ')}
          </div>
        )}
      </header>
      
      <div className="flex-1 max-w-4xl mx-auto flex flex-col">
        <MessageList messages={messages} currentUser={username} />
        <MessageInput onSendMessage={handleSendMessage} />
      </div>
    </div>
  );
}
