"use client";

import { useDownloadStore } from "@/store/useDownloadStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { motion } from "framer-motion";
import { Download, Search, Filter, Trash2, Pause, Play, Rocket, Shield, HardDrive, Settings } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { SettingsPanel } from "@/components/layout/SettingsPanel";

export default function DownloadsPage() {
  const { tasks, globalSpeedLimit, setSpeedLimit } = useDownloadStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const filteredTasks = tasks.filter(task => 
    task.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <main className="flex h-screen w-screen overflow-hidden bg-tg-chat-bg">
      <Sidebar onOpenSettings={() => setIsSettingsOpen(true)} />
      
      <div className="flex-1 flex flex-col h-full">
        {/* Header */}
        <header className="h-20 border-b border-tg-border bg-tg-sidebar/30 backdrop-blur-md px-8 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-4">
             <div className="w-12 h-12 bg-tg-blue/10 rounded-2xl flex items-center justify-center text-tg-blue">
                <Download size={24} />
             </div>
             <div>
                <h1 className="text-xl font-bold">Download Center</h1>
                <p className="text-xs text-tg-text-secondary">Manage and optimize your media transfers</p>
             </div>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-tg-text-secondary" size={16} />
                <input 
                  type="text" 
                  placeholder="Search downloads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 bg-tg-chat-bg border border-tg-border rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-tg-blue transition-colors"
                />
             </div>
             <button className="p-2.5 bg-tg-chat-bg border border-tg-border rounded-xl text-tg-text-secondary hover:text-tg-blue hover:border-tg-blue transition-colors">
                <Filter size={18} />
             </button>
             <button className="p-2.5 bg-tg-chat-bg border border-tg-border rounded-xl text-tg-text-secondary hover:text-red-500 hover:border-red-500 transition-colors">
                <Trash2 size={18} />
             </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 flex gap-8 p-8 overflow-hidden">
          {/* Main List */}
          <div className="flex-1 flex flex-col gap-4 overflow-y-auto pr-2">
            <h2 className="text-sm font-bold uppercase tracking-widest text-tg-blue ml-2">Active & Recent</h2>
            
            {filteredTasks.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-4">
                  <HardDrive size={64} />
                  <p className="text-lg font-medium">No files found</p>
               </div>
            ) : (
              filteredTasks.map((task) => (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  key={task.id} 
                  className="bg-tg-sidebar border border-tg-border rounded-3xl p-6 flex items-center gap-6 group hover:border-tg-blue/30 transition-colors"
                >
                  <div className="w-16 h-16 bg-tg-chat-bg rounded-2xl border border-tg-border flex items-center justify-center text-tg-blue shrink-0">
                     <Download size={28} />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold truncate pr-4">{task.name}</h3>
                       <div className="flex gap-2">
                          <button className="p-2 hover:bg-tg-chat-bg rounded-lg text-tg-text-secondary hover:text-tg-blue transition-colors">
                             {task.status === 'downloading' ? <Pause size={18} /> : <Play size={18} />}
                          </button>
                          <button className="p-2 hover:bg-tg-chat-bg rounded-lg text-tg-text-secondary hover:text-red-500 transition-colors">
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </div>

                    <div className="w-full h-2 bg-tg-chat-bg rounded-full overflow-hidden mb-2">
                       <motion.div 
                          className="h-full bg-tg-blue"
                          initial={{ width: 0 }}
                          animate={{ width: `${task.progress}%` }}
                       />
                    </div>

                    <div className="flex justify-between text-xs text-tg-text-secondary">
                        <div className="flex items-center gap-4">
                           <span>{task.progress}% complete</span>
                           <span>{formatSize(task.size)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-tg-blue font-mono">
                           <Rocket size={12} /> 12.4 MB/s
                        </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Sidebar Controls */}
          <aside className="w-80 flex flex-col gap-6">
             <div className="bg-tg-sidebar border border-tg-border rounded-[32px] p-6 flex flex-col gap-6">
                <h3 className="text-sm font-bold flex items-center gap-2">
                   <Settings size={18} className="text-tg-blue" />
                   Download Speed Boost
                </h3>
                
                <div className="flex flex-col gap-3">
                   {[
                     { label: 'Standard (Limited)', value: 1024 * 1024 * 2 },
                     { label: 'TeleCool Pro (10MB/s)', value: 1024 * 1024 * 10 },
                     { label: 'Ultimate Boost (Max)', value: null },
                   ].map((option) => (
                      <button
                        key={String(option.value)}
                        onClick={() => setSpeedLimit(option.value)}
                        className={cn(
                          "w-full p-4 rounded-2xl border text-left transition-all relative group overflow-hidden",
                          globalSpeedLimit === option.value 
                            ? "bg-tg-blue border-tg-blue text-white"
                            : "bg-tg-chat-bg border-tg-border text-tg-text-secondary hover:border-tg-blue/50"
                        )}
                      >
                         <p className="text-xs font-bold uppercase tracking-widest">{option.label}</p>
                         <p className="text-[10px] opacity-70 mt-1">High-priority packet routing enabled</p>
                         {globalSpeedLimit === option.value && (
                           <div className="absolute right-4 top-1/2 -translate-y-1/2">
                              <Rocket size={14} className="animate-bounce" />
                           </div>
                         )}
                      </button>
                   ))}
                </div>

                <div className="p-4 bg-tg-blue/10 rounded-2xl flex items-center gap-3">
                   <Shield size={20} className="text-tg-blue" />
                   <div className="text-[10px] text-tg-text-secondary">
                      Your downloads are encrypted using **TeleCool AES-256** stealth tunnels.
                   </div>
                </div>
             </div>

             <div className="bg-gradient-to-br from-tg-blue to-blue-600 rounded-[32px] p-6 text-white overflow-hidden relative group">
                <div className="relative z-10">
                   <h3 className="font-bold flex items-center gap-2">
                      <Rocket size={20} />
                      Cloud Storage
                   </h3>
                   <p className="text-xs mt-2 opacity-80">Synchronize your downloads across all account instances.</p>
                   <button className="mt-6 w-full py-3 bg-white text-tg-blue rounded-xl text-xs font-bold hover:bg-white/90 transition-colors">
                      Upgrade to Pro
                   </button>
                </div>
                <div className="absolute top-[-20px] right-[-20px] text-white/10 group-hover:scale-110 transition-transform duration-500">
                   <HardDrive size={120} />
                </div>
             </div>
          </aside>
        </div>
      </div>

      <SettingsPanel
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </main>
  );
}
