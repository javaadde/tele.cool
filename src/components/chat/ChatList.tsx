"use client";

import { useChatStore } from "@/store/useChatStore";
import { cn } from "@/lib/utils";
import { Search, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const MOCK_CHATS = [
  { id: '1', name: 'John Doe', lastMessage: 'See you there! 👋', time: '12:45 PM', unread: 2, isHidden: false },
  { id: '2', name: 'Dev Team', lastMessage: 'PR #102 merged', time: '11:20 AM', unread: 0, isHidden: false },
  { id: '3', name: 'Family Group', lastMessage: 'Dinner at 8?', time: 'Yesterday', unread: 0, isHidden: false },
  { id: '4', name: 'Crypto Alpha', lastMessage: 'Moon soon 🚀', time: '10:00 AM', unread: 5, isHidden: true },
  { id: '5', name: 'Private Ops', lastMessage: 'Deployment successful', time: '09:15 AM', unread: 0, isHidden: true },
];

export const ChatList = () => {
  const { activeChatId, setActiveChat, isPrivateMode } = useChatStore();

  const filteredChats = MOCK_CHATS.filter(chat => !chat.isHidden || isPrivateMode);

  return (
    <div className="w-80 h-full border-r border-tg-border flex flex-col">
      <div className="p-4 flex items-center gap-2">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-text-secondary" size={16} />
          <input 
            type="text" 
            placeholder="Search"
            className="w-full bg-tg-sidebar/50 border border-tg-border rounded-lg pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-tg-blue transition-colors"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <AnimatePresence initial={false}>
          {filteredChats.map((chat) => (
            <motion.button
              key={chat.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, scale: 0.9 }}
              onClick={() => setActiveChat(chat.id)}
              className={cn(
                "w-full p-3 flex items-center gap-3 hover:bg-tg-sidebar/30 transition-colors relative group",
                activeChatId === chat.id && "bg-tg-blue/10"
              )}
            >
              <div className="w-12 h-12 rounded-full bg-tg-blue/20 flex items-center justify-center text-tg-blue shrink-0 overflow-hidden relative">
                <span className="text-lg font-semibold">{chat.name[0]}</span>
                {chat.isHidden && isPrivateMode && (
                   <div className="absolute inset-0 bg-tg-blue/20 backdrop-blur-[1px] flex items-center justify-center">
                      <div className="w-1.5 h-1.5 rounded-full bg-tg-blue animate-pulse" />
                   </div>
                )}
              </div>

              <div className="flex-1 min-w-0 text-left">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium truncate text-tg-text">{chat.name}</h3>
                  <span className="text-[10px] text-tg-text-secondary">{chat.time}</span>
                </div>
                <div className="flex justify-between items-center">
                  <p className="text-sm text-tg-text-secondary truncate">{chat.lastMessage}</p>
                  {chat.unread > 0 && (
                    <span className="px-1.5 py-0.5 bg-tg-blue text-white text-[10px] rounded-full font-bold">
                      {chat.unread}
                    </span>
                  )}
                </div>
              </div>
              
              {activeChatId === chat.id && (
                <div className="absolute left-0 top-0 bottom-0 w-1 bg-tg-blue" />
              )}
            </motion.button>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
