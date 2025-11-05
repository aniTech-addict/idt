'use client';

import { useState, useEffect, useRef } from 'react';

const ChatInterface = ({ userId = "default_user" }) => {
  const [messages, setMessages] = useState([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();

    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setError(null);

    // Add user message to local state immediately
    const newUserMessage = {
      id: `temp_${Date.now()}`,
      role: 'user',
      content: userMessage,
      timestamp: new Date().toISOString(),
      userId: userId
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Get AI response
      const response = await chatWithResearcher(userMessage, userId);

      // Add assistant message to local state
      const assistantMessage = {
        id: `temp_assistant_${Date.now()}`,
        role: 'assistant',
        content: response,
        timestamp: new Date().toISOString(),
        userId: userId
      };

      setMessages(prev => [...prev, assistantMessage]);

      // Reload chat history to get updated data from file
      setTimeout(() => {
        loadChatHistory();
      }, 500);

    } catch (err) {
      console.error('Failed to get response:', err);
      setError('Failed to get response from research assistant');

      // Remove the temporary user message on error
      setMessages(prev => prev.filter(msg => msg.id !== newUserMessage.id));
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearHistory = async () => {
    if (window.confirm('Are you sure you want to clear all chat history?')) {
      setMessages([]);
      setError(null);
    }
  };

  const formatTimestamp = (timestamp) => {
    return new Date(timestamp).toLocaleString();
  };

  return (
    <div className="flex flex-col h-full max-h-screen bg-gray-50 border-2 border-gray-300">
      {/* Header */}
      <div className="bg-white border-b-2 border-gray-400 px-4 py-3 flex justify-between items-center">
        <h2 className="text-lg font-bold text-gray-800">Research Assistant Chat</h2>
        <button
          onClick={handleClearHistory}
          className="px-3 py-1 text-sm font-semibold text-red-600 hover:text-red-800 hover:bg-red-50 border border-red-300 rounded transition-colors"
          disabled={messages.length === 0}
        >
          Clear History
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 mt-4 border-2 border-red-200">
          <div className="flex">
            <div className="ml-3">
              <p className="text-sm font-semibold text-red-700">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="ml-auto pl-3"
            >
              <span className="text-red-500 hover:text-red-700 font-bold">×</span>
            </button>
          </div>
        </div>
      )}

      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 ? (
          <div className="text-center text-gray-500 mt-8">
            <div className="text-4xl mb-4">🧠</div>
            <p className="text-lg font-bold">Welcome to the Research Assistant!</p>
            <p className="text-sm mt-2 font-semibold">Ask me questions about research papers and I'll help you understand them.</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 border-2 ${
                  message.role === 'user'
                    ? 'bg-blue-600 text-white border-blue-700'
                    : 'bg-white border-gray-400 text-gray-800'
                }`}
              >
                <p className="text-sm font-semibold whitespace-pre-wrap">{message.content}</p>
                <p className={`text-xs mt-1 font-bold ${
                  message.role === 'user' ? 'text-blue-200' : 'text-gray-600'
                }`}>
                  {formatTimestamp(message.timestamp)}
                </p>
              </div>
            </div>
          ))
        )}

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-white border-2 border-gray-400 px-4 py-2">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-600 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-sm font-semibold text-gray-600">Research Assistant is thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="bg-white border-t-2 border-gray-400 px-4 py-4">
        <form onSubmit={handleSendMessage} className="flex space-x-2">
          <input
            type="text"
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder="Ask about research papers..."
            className="flex-1 px-3 py-2 border-2 border-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none font-semibold"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !inputMessage.trim()}
            className="px-4 py-2 bg-blue-600 text-white border-2 border-blue-700 font-bold hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatInterface;