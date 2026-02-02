"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { ChatList } from "@/components/chat/ChatList";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { PrivateUnlockModal } from "@/components/chat/PrivateUnlockModal";
import { DownloadManager } from "@/components/layout/DownloadManager";
import { SettingsPanel } from "@/components/layout/SettingsPanel";
import { useDownloadStore } from "@/store/useDownloadStore";
import { useChatStore } from "@/store/useChatStore";
import { motion, AnimatePresence } from "framer-motion";
import { AlertCircle } from "lucide-react";

export default function Home() {
  const [isDownloadManagerOpen, setIsDownloadManagerOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { tasks } = useDownloadStore();
  const { isPrivateMode } = useChatStore();

  const activeDownloads = tasks.filter(t => t.status === 'downloading' || t.status === 'pending').length;

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-tg-chat-bg">
      <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
      <ChatList />
      <ChatWindow />

      {/* Floating Download Indicator */}
      {activeDownloads > 0 && (
        <motion.button
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          onClick={() => setIsDownloadManagerOpen(true)}
          className="fixed bottom-6 right-6 bg-tg-blue hover:bg-tg-blue-hover text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 z-30 group"
        >
          <div className="w-2 h-2 bg-white rounded-full animate-ping" />
          <span className="text-sm font-medium">{activeDownloads} Active Downloads</span>
        </motion.button>
      )}

      {/* Private Mode Banner */}
      <AnimatePresence>
        {isPrivateMode && (
          <motion.div
            initial={{ y: -50, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -50, opacity: 0 }}
            className="fixed top-4 left-1/2 -translate-x-1/2 bg-tg-blue/20 backdrop-blur-md border border-tg-blue/30 px-4 py-1.5 rounded-full flex items-center gap-2 z-20"
          >
            <AlertCircle size={14} className="text-tg-blue" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-tg-blue">Private Mode Active</span>
          </motion.div>
        )}
      </AnimatePresence>

      <DownloadManager 
        isOpen={isDownloadManagerOpen} 
        onClose={() => setIsDownloadManagerOpen(false)} 
      />

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
      
      <PrivateUnlockModal />
    </main>
  );
}
