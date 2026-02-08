"use client";

import { useChatStore, UserProf } from "@/store/useChatStore";
import { useDownloadStore } from "@/store/useDownloadStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Shield, Lock, Bell, Download, Trash2, User, LogOut } from "lucide-react";
import { useEffect, useState } from "react";

export const SettingsPanel = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { isPrivateMode, togglePrivateMode, user, session, setAuthenticated, logout } = useChatStore();
  const { defaultDestination } = useDownloadStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchMe = async () => {
      if (!isOpen || !session) return;
      
      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/me", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ session }),
        });
        
        const data = await response.json();
        if (response.ok && data.user) {
          setAuthenticated(data.user, session);
        }
      } catch (error) {
        console.error("Failed to fetch user details:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMe();
  }, [isOpen, session, setAuthenticated]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-[60]"
          />
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.95, opacity: 0 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] bg-tg-sidebar border border-tg-border rounded-3xl z-[70] overflow-hidden shadow-2xl"
          >
            <div className="p-6 border-b border-tg-border flex items-center justify-between">
              <h2 className="text-xl font-bold">Settings</h2>
              <button onClick={onClose} className="p-2 hover:bg-tg-chat-bg rounded-xl transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="max-h-[70vh] overflow-y-auto p-6 flex flex-col gap-8">
              <section className="flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-tg-blue">Account</h3>
                <div className="flex items-center gap-4 p-4 bg-tg-chat-bg rounded-2xl border border-tg-border">
                  <div className="w-16 h-16 bg-tg-blue rounded-full flex items-center justify-center text-white text-2xl font-bold uppercase overflow-hidden">
                    {user?.firstName ? user.firstName[0] : (user?.phone ? '?' : 'ME')}
                  </div>
                  <div className="flex-1">
                    <p className="font-bold">{user?.firstName || 'User'}{user?.lastName ? ` ${user.lastName}` : ''}</p>
                    <p className="text-sm text-tg-text-secondary">{user?.phone || 'No phone number'}</p>
                    {user?.username && <p className="text-xs text-tg-blue">@{user.username}</p>}
                  </div>
                  <button 
                    onClick={() => logout()}
                    className="p-2 text-tg-text-secondary hover:text-red-500 transition-colors"
                  >
                     <LogOut size={20} />
                  </button>
                </div>
              </section>

              {/* Privacy Section */}
              <section className="flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-tg-blue">Privacy & Security</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between p-4 bg-tg-chat-bg rounded-2xl border border-tg-border">
                    <div className="flex items-center gap-3">
                      <Lock size={20} className="text-tg-text-secondary" />
                      <span className="text-sm">Two-Step Verification</span>
                    </div>
                    <span className="text-xs text-tg-blue font-bold">ON</span>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-tg-chat-bg rounded-2xl border border-tg-border">
                    <div className="flex items-center gap-3">
                      <Shield size={20} className="text-tg-text-secondary" />
                      <span className="text-sm">Hidden Chat Vault</span>
                    </div>
                    <button 
                      onClick={() => togglePrivateMode()}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase ${isPrivateMode ? 'bg-tg-blue text-white' : 'bg-tg-text-secondary/20 text-tg-text-secondary'}`}
                    >
                      {isPrivateMode ? 'Unlock Active' : 'Locked'}
                    </button>
                  </div>
                </div>
              </section>

              {/* Data Section */}
              <section className="flex flex-col gap-4">
                <h3 className="text-xs font-bold uppercase tracking-widest text-tg-blue">Downloads & Storage</h3>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center justify-between p-4 bg-tg-chat-bg rounded-2xl border border-tg-border">
                    <div className="flex items-center gap-3">
                      <Download size={20} className="text-tg-text-secondary" />
                      <span className="text-sm">Default Download Folder</span>
                    </div>
                    <input 
                      type="text"
                      className="text-xs text-tg-blue bg-transparent border-none text-right focus:outline-none focus:underline cursor-pointer w-48"
                      value={defaultDestination}
                      onChange={(e) => {
                        useDownloadStore.setState({ defaultDestination: e.target.value });
                      }}
                    />
                  </div>
                  
                  <div 
                    onClick={() => {
                      if(confirm("Are you sure? This will log out all accounts and clear all local data.")) {
                        useChatStore.getState().clearAll();
                      }
                    }}
                    className="flex items-center justify-between p-4 bg-red-500/10 rounded-2xl border border-red-500/20 group cursor-pointer hover:bg-red-500/20 transition-colors"
                  >
                    <div className="flex items-center gap-3 text-red-500">
                      <Trash2 size={20} />
                      <span className="text-sm font-bold">Clear All Data & Logout</span>
                    </div>
                    <span className="text-[10px] text-red-400 font-bold uppercase">Dangerous</span>
                  </div>
                </div>
              </section>
            </div>

            <div className="p-6 bg-tg-chat-bg/50 text-center">
              <p className="text-[10px] text-tg-text-secondary uppercase tracking-[0.2em]">TeleCool v1.0.4 - Web Edition</p>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
