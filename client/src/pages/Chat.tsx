import { useLanguage } from "@/lib/i18n";
import { useRoute, Link } from "wouter";
import { ArrowLeft, Send, Phone, MoreVertical } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";

export default function Chat() {
  const { t } = useLanguage();
  const [, params] = useRoute("/chat/:id");
  const id = params?.id;
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi! Is the apartment still available?", sender: "me", time: "10:00" },
    { id: 2, text: "Yes, it is! When would you like to visit?", sender: "them", time: "10:05" },
  ]);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(scrollToBottom, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;

    setMessages([...messages, { id: Date.now(), text: inputText, sender: "me", time: "Now" }]);
    setInputText("");
    
    // Simulate reply
    setTimeout(() => {
      setMessages(prev => [...prev, { id: Date.now()+1, text: "Great! Let me know.", sender: "them", time: "Now" }]);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-100 flex items-center px-4 z-50">
        <Link href="/tenant/matches"> 
        {/* Note: In a real app we'd know if we came from tenant or landlord matches. For now, default back to one or use history.back */}
          <a className="p-2 -ml-2 text-gray-600 hover:text-gray-900" onClick={() => window.history.back()}>
            <ArrowLeft size={24} />
          </a>
        </Link>
        <div className="ml-2 flex items-center gap-3 flex-1">
          <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
            <img src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=100&q=80" className="w-full h-full object-cover" />
          </div>
          <div>
            <h3 className="font-bold text-gray-900 leading-tight">Marco Rossi</h3>
            <span className="text-xs text-green-500 font-medium">Online</span>
          </div>
        </div>
        <button className="p-2 text-gray-400 hover:text-primary">
          <Phone size={20} />
        </button>
        <button className="p-2 text-gray-400 hover:text-gray-600">
          <MoreVertical size={20} />
        </button>
      </header>

      {/* Messages */}
      <main className="flex-1 pt-20 pb-24 px-4 overflow-y-auto bg-gray-50">
        <div className="space-y-4">
          {messages.map((msg) => (
            <motion.div 
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
            >
              <div className={`max-w-[75%] px-4 py-3 rounded-2xl shadow-sm ${
                msg.sender === "me" 
                  ? "bg-primary text-white rounded-br-none" 
                  : "bg-white text-gray-800 rounded-bl-none border border-gray-100"
              }`}>
                <p className="text-sm leading-relaxed">{msg.text}</p>
                <span className={`text-[10px] block text-right mt-1 ${msg.sender === "me" ? "text-primary-foreground/70" : "text-gray-400"}`}>
                  {msg.time}
                </span>
              </div>
            </motion.div>
          ))}
          <div ref={messagesEndRef} />
        </div>
      </main>

      {/* Input */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-100 z-50 pb-8">
        <form onSubmit={handleSend} className="flex gap-2 max-w-md mx-auto">
          <input 
            type="text" 
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Type a message..." 
            className="flex-1 bg-gray-100 rounded-full px-5 py-3 focus:bg-white focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
          />
          <button 
            type="submit"
            disabled={!inputText.trim()}
            className="w-12 h-12 rounded-full bg-primary text-white flex items-center justify-center shadow-lg shadow-primary/20 disabled:opacity-50 disabled:shadow-none transition-all hover:scale-105 active:scale-95"
          >
            <Send size={20} className={inputText.trim() ? "ml-0.5" : ""} />
          </button>
        </form>
      </div>
    </div>
  );
}
