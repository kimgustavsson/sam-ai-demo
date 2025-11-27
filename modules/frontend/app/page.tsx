'use client'; // Add use client directive since we are using state

import React, { useState, useRef, useEffect } from 'react';
import { Home, User, Paperclip, FileText, Mic, Send } from 'lucide-react';

export default function MainChatScreen() {
  const [messages, setMessages] = useState<{role: string, content: string}[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage = { role: 'user', content: input };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: [...messages, userMessage] }),
      });

      if (!response.ok) throw new Error('Failed to fetch');

      const data = await response.json();
      setMessages(prev => [...prev, data]);
    } catch (error) {
      console.error('Error:', error);
      // Optionally handle error in UI
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
        handleSend();
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-gray-900">
      {/* Top Bar */}
      <header className="flex justify-between items-center p-4 sm:p-6 sticky top-0 bg-white z-10">
        <button 
          aria-label="More options"
          className="p-3 hover:bg-gray-100 rounded-full transition-colors"
        >
          <Home className="w-6 h-6 text-gray-700" />
        </button>
        <button 
          aria-label="Profile"
          className="p-3 hover:bg-gray-100 rounded-full transition-colors"
        >
          <User className="w-6 h-6 text-gray-700" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col items-center px-4 sm:px-6 overflow-y-auto">
        {messages.length === 0 ? (
          <div className="w-full max-w-lg bg-gray-100 rounded-[2rem] p-8 flex flex-col items-center space-y-8 mt-10">
            
            {/* Greeting */}
            <h1 className="text-2xl sm:text-3xl font-semibold text-center leading-tight text-gray-800">
              Hi, Fatima how can i assist you today?
            </h1>

            {/* Action Buttons Container */}
            <div className="w-full grid grid-cols-2 gap-4">
              {/* Button 1: Common questions */}
              <button 
                className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow space-y-3 h-32 active:scale-95 duration-200"
                aria-label="View common questions"
              >
                <div className="p-3 bg-gray-50 rounded-full">
                  <Paperclip className="w-6 h-6 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Common questions</span>
              </button>

              {/* Button 2: Instruction Files */}
              <button 
                className="flex flex-col items-center justify-center bg-white p-6 rounded-2xl shadow-sm hover:shadow-md transition-shadow space-y-3 h-32 active:scale-95 duration-200"
                aria-label="View instruction files"
              >
                <div className="p-3 bg-gray-50 rounded-full">
                  <FileText className="w-6 h-6 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-700">Instruction Files</span>
              </button>
            </div>

          </div>
        ) : (
            <div className="w-full max-w-lg flex flex-col space-y-4 pb-4">
                {messages.map((msg, index) => (
                    <div key={index} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[80%] p-4 rounded-2xl ${msg.role === 'user' ? 'bg-purple-600 text-white rounded-br-none' : 'bg-gray-100 text-gray-800 rounded-bl-none'}`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isLoading && (
                     <div className="flex justify-start">
                        <div className="p-4 bg-gray-100 rounded-2xl rounded-bl-none text-gray-500 animate-pulse">
                            Thinking...
                        </div>
                     </div>
                )}
                <div ref={messagesEndRef} />
            </div>
        )}
      </main>

      {/* Bottom Input Bar */}
      <div className="p-4 pb-6 w-full max-w-lg mx-auto sticky bottom-0 bg-white">
        <div className="relative flex items-center bg-white rounded-full shadow-[0_4px_20px_rgba(0,0,0,0.08)] border border-gray-100 p-2 pl-6">
          
          <input
            type="text"
            placeholder="Ask me about anything"
            className="flex-1 bg-transparent outline-none text-gray-700 placeholder-gray-400 text-base"
            aria-label="Chat message input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          
          <div className="flex items-center space-x-2">
            <button 
              className="p-2 text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Use voice input"
            >
              <Mic className="w-5 h-5" />
            </button>
            
            <button 
              className="p-3 bg-purple-600 hover:bg-purple-700 text-white rounded-full transition-colors shadow-md active:bg-purple-800 disabled:opacity-50 disabled:cursor-not-allowed"
              aria-label="Send message"
              onClick={handleSend}
              disabled={isLoading || !input.trim()}
            >
              <Send className="w-5 h-5 fill-current translate-x-[-1px] translate-y-[1px]" />
            </button>
          </div>

        </div>
      </div>

    </div>
  );
}
