'use client';

import { useEffect, useRef } from 'react';

type Message = {
  sender: string;
  content: string;
  timestamp: Date;
};

type Props = {
  messages: Message[];
  currentUser: string;
};

export default function MessageList({ messages, currentUser }: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <div className="flex-1 overflow-y-auto p-4 bg-gray-100 dark:bg-gray-800 transition-all duration-300">
      <div className="flex flex-col space-y-4">
        {messages.map((message, index) => (
          <div key={index} className={`flex ${message.sender === currentUser ? 'justify-end' : 'justify-start'} transition-all duration-300`}>
            <div className={`max-w-xs md:max-w-md break-words px-4 py-2 rounded-xl shadow-lg transform transition-all duration-300 hover:scale-105 ${
              message.sender === currentUser 
                ? 'bg-blue-500 text-white rounded-bl-none'
                : 'bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-tr-none'
            }`}>
              {message.sender !== currentUser && (
                <div className="mb-1 text-xs font-semibold">
                  {message.sender}
                </div>
              )}
              <p>{message.content}</p>
              <div className="mt-1 text-xs text-gray-500 text-right">
                {new Date(message.timestamp).toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>
    </div>
  );
}
