"use client";

import { useChatStore } from "@/store/useChatStore";
import { useDownloadStore } from "@/store/useDownloadStore";
import { cn } from "@/lib/utils";
import { Phone, Video, Search, MoreVertical, Send, Paperclip, Download } from "lucide-react";
import { motion } from "framer-motion";

export const ChatWindow = () => {
  const { activeChatId } = useChatStore();
  const { addTask } = useDownloadStore();

  if (!activeChatId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-tg-chat-bg text-tg-text-secondary">
        <div className="text-center px-4 py-2 rounded-full bg-tg-sidebar/30">
          Select a chat to start messaging
        </div>
      </div>
    );
  }

  const handleDownload = (fileName: string) => {
    addTask({
      id: Math.random().toString(36).substr(2, 9),
      name: fileName,
      size: 1024 * 1024 * 50, // 50MB mock
      progress: 0,
      status: 'pending',
      speed: 0
    });
  };

  return (
    <div className="flex-1 flex flex-col h-full relative" style={{ backgroundImage: 'url("https://www.transparenttextures.com/patterns/cubes.png")' }}>
      {/* Header */}
      <div className="h-16 border-b border-tg-border bg-tg-chat-bg/80 backdrop-blur-md px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-tg-blue/20 flex items-center justify-center text-tg-blue">
            JD
          </div>
          <div>
            <h3 className="font-medium text-sm">Active Chat</h3>
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
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {/* Mock Incoming Message */}
        <div className="self-start max-w-[70%]">
          <div className="bg-tg-incoming p-3 rounded-2xl rounded-tl-none text-sm text-tg-text shadow-sm">
            Hey, have you checked the new architectural plans?
            <span className="block text-[10px] text-right mt-1 opacity-50">12:45 PM</span>
          </div>
        </div>

        {/* Mock Media Message */}
        <div className="self-start max-w-[70%]">
          <div className="bg-tg-incoming p-2 rounded-2xl rounded-tl-none shadow-sm flex flex-col gap-2">
            <div className="w-full h-48 bg-black/20 rounded-xl flex items-center justify-center relative group">
               <div className="text-tg-text-secondary text-sm flex flex-col items-center gap-2">
                  <Paperclip size={32} />
                  <span>architectural_final_v2.pdf</span>
                  <span className="text-xs opacity-50">12.5 MB</span>
               </div>
               <button 
                  onClick={() => handleDownload('architectural_final_v2.pdf')}
                  className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
               >
                  <div className="bg-tg-blue p-3 rounded-full text-white">
                    <Download size={24} />
                  </div>
               </button>
            </div>
            <span className="block text-[10px] text-right opacity-50">12:46 PM</span>
          </div>
        </div>

        {/* Mock Outgoing Message */}
        <div className="self-end max-w-[70%]">
          <div className="bg-tg-outgoing p-3 rounded-2xl rounded-tr-none text-sm text-white shadow-sm">
            Yeah, downloading them now! Looks solid.
            <span className="block text-[10px] text-right mt-1 opacity-70">12:47 PM</span>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="p-4 bg-transparent z-10">
        <div className="max-w-4xl mx-auto flex items-center gap-3 bg-tg-sidebar/80 backdrop-blur-md border border-tg-border rounded-2xl p-2 pl-4">
          <Paperclip size={22} className="text-tg-text-secondary hover:text-tg-blue cursor-pointer" />
          <input 
            type="text" 
            placeholder="Write a message..."
            className="flex-1 bg-transparent text-sm focus:outline-none"
          />
          <button className="bg-tg-blue p-2 rounded-xl text-white hover:bg-tg-blue-hover transition-colors">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
