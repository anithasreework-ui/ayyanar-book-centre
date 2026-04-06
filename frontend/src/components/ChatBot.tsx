import { useState, useRef, useEffect } from 'react';
import { chatWithBot } from '../services/api';

interface Message {
  sender: 'user' | 'bot';
  text: string;
}

const ChatBot = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'bot',
      text: '👋 Hi! I am Ayyanar Book Centre Assistant. How can I help you?'
    }
  ]);
  const [input, setInput] = useState('');
  const [language, setLanguage] = useState('english');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await chatWithBot(input, language);
      const botMsg: Message = {
        sender: 'bot',
        text: res.data.reply
      };
      setMessages((prev) => [...prev, botMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { sender: 'bot', text: 'Sorry, please try again!' }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      {/* Chat Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 bg-blue-800 text-white 
                   w-14 h-14 rounded-full text-2xl shadow-lg 
                   hover:bg-blue-700 z-50"
      >
        💬
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 w-80 bg-white 
                        rounded-2xl shadow-2xl z-50 flex flex-col 
                        border border-gray-200 overflow-hidden">

          {/* Header */}
          <div className="bg-blue-800 text-white p-3 flex 
                          justify-between items-center">
            <div>
              <p className="font-bold text-sm">📚 Ayyanar Assistant</p>
              <p className="text-xs opacity-75">Online • Powered by Llama AI</p>
            </div>

            {/* Language Selector */}
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="text-black text-xs rounded px-1 py-0.5"
            >
              <option value="english">English</option>
              <option value="tamil">தமிழ்</option>
              <option value="tanglish">Tanglish</option>
            </select>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 
                          max-h-64 bg-gray-50">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${
                  msg.sender === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-2xl text-sm ${
                    msg.sender === 'user'
                      ? 'bg-blue-800 text-white rounded-br-none'
                      : 'bg-white text-gray-800 shadow rounded-bl-none border'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="bg-white px-4 py-2 rounded-2xl 
                                text-gray-400 text-sm shadow border">
                  Typing...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="p-3 border-t flex gap-2 bg-white">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Type your message..."
              className="flex-1 border rounded-lg px-3 py-1 
                         text-sm focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={loading}
              className="bg-blue-800 text-white px-3 py-1 
                         rounded-lg text-sm hover:bg-blue-700 
                         disabled:bg-gray-300"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default ChatBot;