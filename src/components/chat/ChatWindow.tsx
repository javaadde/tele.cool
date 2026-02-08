"use client";

import { useEffect, useState, useRef } from "react";
import { useChatStore } from "@/store/useChatStore";
import { useDownloadStore } from "@/store/useDownloadStore";
import { cn } from "@/lib/utils";
import { Phone, Video, Search, MoreVertical, Send, Paperclip, Download, Loader2 } from "lucide-react";
import { motion } from "framer-motion";

export const ChatWindow = () => {
  const { activeChatId, chats, session } = useChatStore();
  const { addTask, defaultDestination } = useDownloadStore();
  const [messages, setMessages] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const activeChat = chats.find(c => c.id === activeChatId);

  useEffect(() => {
    if (!activeChatId || !session) return;

    const fetchMessages = async () => {
      setLoading(true);
      setError(null);
      try {
        const response = await fetch("/api/messages", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session, chatId: activeChatId }),
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.error || "Failed to fetch messages");
        setMessages(data.messages.reverse()); // Show newest at bottom
      } catch (err: any) {
        console.error("Fetch messages error:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [activeChatId, session]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!activeChatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-tg-chat-bg text-tg-text-secondary">
        <div className="text-center px-4 py-2 rounded-full bg-tg-sidebar/30">
          Select a chat to start messaging
        </div>
      </div>
    );
  }

  const handleDownload = async (fileName: string, size?: number, messageId?: string) => {
    const taskId = Math.random().toString(36).substr(2, 9);
    
    // 1. UI Feedback
    addTask({
      id: taskId,
      name: fileName || "Telegram_File_" + Date.now().toString().slice(-4) + ".pdf",
      size: size || Math.floor(Math.random() * 50 * 1024 * 1024) + 1024 * 1024,
      progress: 0,
      status: 'pending',
      speed: 0
    });

    // 2. Real Download Trigger
    if (messageId && session && activeChatId) {
      fetch("/api/download", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          session,
          messageId,
          chatId: activeChatId,
          fileName: fileName,
          targetPath: defaultDestination
        })
      })
      .then(res => res.json())
      .then(data => {
        if (data.success) {
           console.log("Real download finished successfully");
           // We don't necessarily update status here since simulation might have finished,
           // but we can ensure it's marked as done if it hasn't already.
           useDownloadStore.getState().updateStatus(taskId, 'completed');
        } else {
           console.error("Real download failed:", data.error);
           useDownloadStore.getState().updateStatus(taskId, 'error');
        }
      })
      .catch(err => {
        console.error("Background download network error:", err);
        useDownloadStore.getState().updateStatus(taskId, 'error');
      });
    }
  };

  const formatTime = (ts: number) => {
    return new Date(ts * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className="flex-1 flex flex-col h-full relative" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}>
      {/* Header */}
      <div className="h-16 border-b border-tg-border bg-tg-chat-bg/80 backdrop-blur-md px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-tg-blue/20 flex items-center justify-center text-tg-blue font-bold">
            {activeChat?.avatar ? (
                <img src={activeChat.avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
                activeChat?.name?.[0] || '?'
            )}
          </div>
          <div>
            <h3 className="font-medium text-sm text-tg-text">{activeChat?.name || "Active Chat"}</h3>
            <span className="text-[11px] text-tg-blue">online</span>
          </div>
        </div>
        
        <div className="flex items-center gap-4 text-tg-text-secondary">
          <Search size={20} className="hover:text-tg-blue cursor-pointer" />
          <Phone size={20} className="hover:text-tg-blue cursor-pointer" />
          <Video size={20} className="hover:text-tg-blue cursor-pointer" />
          <MoreVertical size={20} className="hover:text-tg-blue cursor-pointer" />
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
        {loading ? (
             <div className="flex-1 flex items-center justify-center">
                <Loader2 className="animate-spin text-tg-blue" />
             </div>
        ) : error ? (
            <div className="flex-1 flex items-center justify-center text-red-500 text-sm">
                {error}
            </div>
        ) : messages.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-tg-text-secondary text-sm">
                No messages yet.
            </div>
        ) : (
            messages.map((msg) => (
                <div 
                    key={msg.id} 
                    className={cn(
                        "max-w-[75%] flex flex-col",
                        msg.isOutgoing ? "self-end" : "self-start"
                    )}
                >
                    <div className={cn(
                        "p-3 rounded-2xl shadow-sm",
                        msg.isOutgoing ? "bg-tg-outgoing rounded-tr-none text-white" : "bg-tg-incoming rounded-tl-none text-tg-text"
                    )}>
                        {msg.hasMedia && msg.fileName && (
                            <div className="mb-2 p-2 bg-black/10 rounded-xl flex items-center justify-between gap-4 group relative">
                                <div className="flex items-center gap-3">
                                    <div className="bg-tg-blue/20 p-2 rounded-lg text-tg-blue">
                                        <Paperclip size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-xs font-medium truncate max-w-[150px]">{msg.fileName}</span>
                                        <span className="text-[10px] opacity-60">{(msg.fileSize / 1024 / 1024).toFixed(1)} MB</span>
                                    </div>
                                </div>
                                <button 
                                    onClick={() => handleDownload(msg.fileName, msg.fileSize, msg.id)}
                                    className="p-2 hover:bg-tg-blue/20 rounded-full transition-colors"
                                >
                                    <Download size={18} className={msg.isOutgoing ? "text-white" : "text-tg-blue"} />
                                </button>
                            </div>
                        )}
                        <p className="text-sm whitespace-pre-wrap break-words">{msg.text}</p>
                        <span className={cn(
                            "block text-[10px] text-right mt-1",
                            msg.isOutgoing ? "text-white/60" : "text-tg-text-secondary/60"
                        )}>
                            {formatTime(msg.timestamp)}
                        </span>
                    </div>
                </div>
            ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-transparent z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3 bg-tg-sidebar/80 backdrop-blur-md border border-tg-border rounded-2xl p-2 pl-4 shadow-xl">
          <Paperclip size={22} className="text-tg-text-secondary hover:text-tg-blue cursor-pointer" />
          <input 
            type="text" 
            placeholder="Write a message..."
            className="flex-1 bg-transparent text-sm text-tg-text focus:outline-none"
          />
          <button className="bg-tg-blue p-2 rounded-xl text-white hover:bg-tg-blue-hover transition-colors shadow-md">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
