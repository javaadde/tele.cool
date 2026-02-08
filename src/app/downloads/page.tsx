"use client";

import { useDownloadStore } from "@/store/useDownloadStore";
import { Sidebar } from "@/components/layout/Sidebar";
import { motion } from "framer-motion";
import { Download, Search, Filter, Trash2, Pause, Play, Rocket, Shield, HardDrive, Settings, CheckCircle2, FolderOpen, File as FileIcon, X, Save } from "lucide-react";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { SettingsPanel } from "@/components/layout/SettingsPanel";

export default function DownloadsPage() {
  const { tasks, completedTasks, removeTask, clearCompleted, defaultDestination } = useDownloadStore();
  const [searchQuery, setSearchQuery] = useState("");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSaveAs = (task: any) => {
    const link = document.createElement('a');
    link.href = `/api/download/file?name=${encodeURIComponent(task.name)}&path=${encodeURIComponent(defaultDestination)}`;
    link.download = task.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

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
            <h2 className="text-sm font-bold uppercase tracking-widest text-tg-blue ml-2 flex items-center justify-between">
               Active Transfers
               <span className="text-[10px] bg-tg-blue/10 px-2 py-0.5 rounded-full">{tasks.length}</span>
            </h2>
            
            {tasks.length === 0 ? (
               <div className="flex-1 flex flex-col items-center justify-center opacity-30 gap-4 py-20 bg-tg-sidebar/20 rounded-[40px] border border-dashed border-tg-border">
                  <HardDrive size={64} />
                  <p className="text-lg font-medium">No active transfers</p>
                  <p className="text-sm">Start a download from any chat to see it here</p>
               </div>
            ) : (
              tasks.map((task) => (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  key={task.id} 
                  className="bg-tg-sidebar border border-tg-border rounded-3xl p-6 flex items-center gap-6 group hover:border-tg-blue/30 transition-all shadow-lg hover:shadow-tg-blue/5"
                >
                  <div className="w-16 h-16 bg-tg-chat-bg rounded-2xl border border-tg-border flex items-center justify-center text-tg-blue shrink-0 relative">
                     <Download size={28} className={task.status === 'downloading' ? 'animate-bounce' : ''} />
                     {task.status === 'downloading' && (
                        <div className="absolute inset-0 bg-tg-blue/5 rounded-2xl animate-pulse" />
                     )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                       <h3 className="font-bold truncate pr-4 text-tg-text">{task.name}</h3>
                       <div className="flex gap-2">
                          <button 
                            className="p-2 hover:bg-tg-chat-bg rounded-xl text-tg-text-secondary hover:text-tg-blue transition-colors"
                            aria-label={task.status === 'downloading' ? 'Pause' : 'Resume'}
                          >
                             {task.status === 'downloading' ? <Pause size={18} /> : <Play size={18} />}
                          </button>
                          <button 
                            onClick={() => removeTask(task.id)}
                            className="p-2 hover:bg-tg-chat-bg rounded-xl text-tg-text-secondary hover:text-red-500 transition-colors"
                            aria-label="Delete"
                          >
                             <Trash2 size={18} />
                          </button>
                       </div>
                    </div>

                    <div className="w-full h-2 bg-tg-chat-bg rounded-full overflow-hidden mb-2 shadow-inner">
                       <motion.div 
                          className="h-full bg-tg-blue shadow-[0_0_10px_rgba(33,150,243,0.5)]"
                          initial={{ width: 0 }}
                          animate={{ width: `${task.progress}%` }}
                       />
                    </div>

                    <div className="flex justify-between text-[11px] text-tg-text-secondary font-medium">
                        <div className="flex items-center gap-4">
                           <span className="text-tg-blue">{Math.round(task.progress)}%</span>
                           <span>{formatSize(task.size)}</span>
                        </div>
                        <div className="flex items-center gap-1 text-tg-blue font-mono">
                           <Rocket size={12} className="animate-pulse" /> {task.speed ? formatSize(task.speed) : '0 B'}/s
                        </div>
                    </div>
                  </div>
                </motion.div>
              ))
            )}
          </div>

          {/* Sidebar - Finished Downloads */}
          <aside className="w-96 flex flex-col gap-6">
             <div className="flex-1 bg-tg-sidebar border border-tg-border rounded-[32px] overflow-hidden flex flex-col shadow-2xl">
                <div className="p-6 border-b border-tg-border flex items-center justify-between">
                   <h3 className="text-sm font-bold flex items-center gap-2">
                      <CheckCircle2 size={18} className="text-green-500" />
                      Finished Downloads
                   </h3>
                   {completedTasks.length > 0 && (
                      <button 
                        onClick={clearCompleted}
                        className="text-[10px] uppercase tracking-widest font-bold text-tg-text-secondary hover:text-red-500 transition-colors"
                      >
                         Clear All
                      </button>
                   )}
                </div>
                
                <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-2">
                   {completedTasks.length === 0 ? (
                      <div className="h-full flex flex-col items-center justify-center opacity-30 gap-4 p-8 text-center">
                         <FolderOpen size={40} />
                         <p className="text-xs font-bold uppercase tracking-widest">No history</p>
                         <p className="text-[10px]">Your completed downloads will appear here.</p>
                      </div>
                   ) : (
                      completedTasks.map((task) => (
                        <motion.div 
                          initial={{ opacity: 0, x: 20 }}
                          animate={{ opacity: 1, x: 0 }}
                          key={task.id}
                          className="p-3 rounded-2xl bg-tg-chat-bg/50 border border-tg-border group hover:border-tg-blue/30 transition-all flex items-center gap-3"
                        >
                           <div className="w-10 h-10 bg-green-500/10 rounded-xl flex items-center justify-center text-green-500">
                              <FileIcon size={20} />
                           </div>
                           <div className="flex-1 min-w-0">
                              <p className="text-xs font-bold truncate">{task.name}</p>
                              <p className="text-[10px] text-tg-text-secondary">{formatSize(task.size)} • Finished</p>
                           </div>
                           <div className="flex gap-1">
                              <button 
                                onClick={() => handleSaveAs(task)}
                                className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-tg-blue/10 hover:text-tg-blue rounded-lg transition-all"
                                title="Save As..."
                              >
                                 <Save size={14} />
                              </button>
                              <button 
                                onClick={() => removeTask(task.id)}
                                className="p-1.5 opacity-0 group-hover:opacity-100 hover:bg-red-500/10 hover:text-red-500 rounded-lg transition-all"
                              >
                                 <X size={14} />
                              </button>
                           </div>
                        </motion.div>
                      ))
                   )}
                </div>

                <div className="p-6 bg-tg-chat-bg border-t border-tg-border">
                   <div className="flex items-center justify-between text-[10px] text-tg-text-secondary mb-3">
                      <span className="font-bold uppercase">Storage Path</span>
                      <Settings size={12} />
                   </div>
                   <div className="p-3 bg-tg-sidebar border border-tg-border rounded-xl text-[11px] font-mono text-tg-blue break-all">
                      {defaultDestination}
                   </div>
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
