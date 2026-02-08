"use client";

import { useEffect, useMemo, useState } from "react";
import { useChatStore } from "@/store/useChatStore";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface UiChat {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  isHidden: boolean;
  avatar?: string;
}

const formatTime = (timestamp: number) => {
  if (!timestamp) return "";
  const date = new Date(timestamp * 1000);
  return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
};

export const ChatList = () => {
  const { 
    activeChatId, 
    setActiveChat, 
    isPrivateMode, 
    session, 
    setChats: setGlobalChats,
    hiddenChatIds,
    hideChat,
    unhideChat,
    privateModePassword,
    privateModePattern,
    setRevealTriggered
  } = useChatStore();
  const [chats, setChats] = useState<UiChat[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [contextMenu, setContextMenu] = useState<{ id: string; x: number; y: number } | null>(null);

  const fetchChats = async () => {
    if (!session) {
      console.log("ChatList: No session found, skipping fetch");
      setChats([]); // Clear chats if no session
      return;
    }
    setLoading(true);
    setError(null);
    try {
      console.log("ChatList: Fetching chats...");
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ session }),
      });
      const data = await response.json();
      console.log("ChatList: Received data:", data);
      
      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch chats");
      }
      const uiChats: UiChat[] = (data.chats || []).map((chat: any) => ({
        id: chat.id,
        name: chat.name,
        lastMessage: chat.lastMessage || "",
        time: formatTime(chat.timestamp),
        unread: chat.unreadCount || 0,
        isHidden: chat.isHidden || false,
        avatar: chat.avatar,
      }));
      setChats(uiChats);
      setGlobalChats(uiChats.map(c => ({
        id: c.id,
        name: c.name,
        unreadCount: c.unread,
        isHidden: c.isHidden,
        timestamp: 0, // We don't have the raw timestamp here easily, but it's fine for now
        avatar: c.avatar,
        messages: []
      })));
    } catch (err: any) {
      console.error("ChatList error:", err);
      setError(err.message || "Failed to load chats");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();
  }, [session]);

  const filteredChats = useMemo(
    () => chats.filter((chat) => !hiddenChatIds.includes(chat.id) || isPrivateMode),
    [chats, hiddenChatIds, isPrivateMode]
  );

  return (
    <div className="w-80 h-full border-r border-tg-border flex flex-col relative" onClick={() => setContextMenu(null)}>
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
              onContextMenu={(e) => {
                 e.preventDefault();
                 setContextMenu({ id: chat.id, x: e.clientX, y: e.clientY });
              }}
              className={cn(
                "w-full p-3 flex items-center gap-3 hover:bg-tg-sidebar/30 transition-colors relative group",
                activeChatId === chat.id && "bg-tg-blue/10"
              )}
            >
              <div className="w-12 h-12 rounded-full bg-tg-blue/20 flex items-center justify-center text-tg-blue shrink-0 overflow-hidden relative border border-transparent group-hover:border-tg-blue/30 transition-all">
                {chat.avatar ? (
                  <img src={chat.avatar} alt={chat.name} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-lg font-semibold">{chat.name[0]}</span>
                )}
                {hiddenChatIds.includes(chat.id) && isPrivateMode && (
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
        
        {contextMenu && (
            <div 
                className="fixed z-[60] bg-tg-sidebar border border-tg-border rounded-xl shadow-2xl py-1 w-40 animate-in fade-in zoom-in duration-200"
                style={{ top: contextMenu.y, left: contextMenu.x }}
            >
                {hiddenChatIds.includes(contextMenu.id) ? (
                   <button 
                      onClick={() => {
                          unhideChat(contextMenu.id);
                          setContextMenu(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-tg-blue hover:text-white transition-colors flex items-center gap-2"
                   >
                      Unhide Chat
                   </button>
                ) : (
                   <button 
                      onClick={() => {
                          if (!privateModePassword && !privateModePattern) {
                             setRevealTriggered(true);
                          }
                          hideChat(contextMenu.id);
                          setContextMenu(null);
                      }}
                      className="w-full text-left px-4 py-2 text-sm hover:bg-tg-blue hover:text-white transition-colors flex items-center gap-2"
                   >
                      Hide Chat
                   </button>
                )}
            </div>
        )}

        {!session && (
          <div className="p-6 text-center text-sm text-tg-text-secondary">
            Connect an account to load chats.
          </div>
        )}

        {!loading && !error && session && filteredChats.length === 0 && (
          <div className="p-6 text-center text-sm text-tg-text-secondary">
            No chats found.
          </div>
        )}

        {loading && (
          <div className="p-6 text-center text-sm text-tg-text-secondary">
            Loading chats...
          </div>
        )}

        {error && (
          <div className="p-6 text-center">
            <p className="text-sm text-red-500 mb-2">{error}</p>
            <button 
              onClick={fetchChats}
              className="text-xs text-tg-blue hover:underline font-medium"
            >
              Try again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
