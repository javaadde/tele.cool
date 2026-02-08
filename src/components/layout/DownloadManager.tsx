"use client";

import { useDownloadStore } from "@/store/useDownloadStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Pause, Play, CheckCircle2, Rocket, Settings, Save } from "lucide-react";
import { cn } from "@/lib/utils";

export const DownloadManager = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { tasks, completedTasks, clearCompleted, removeTask, defaultDestination } = useDownloadStore();

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleSaveAs = (task: any) => {
     const link = document.createElement('a');
     link.href = `/api/download/file?name=${encodeURIComponent(task.name)}&path=${encodeURIComponent(defaultDestination)}`;
     link.download = task.name;
     document.body.appendChild(link);
     link.click();
     document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 z-40"
          />
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-96 bg-tg-sidebar border-l border-tg-border z-50 flex flex-col shadow-2xl"
          >
            <div className="p-4 border-b border-tg-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Download size={20} className="text-tg-blue" />
                <h2 className="font-bold">Download Manager</h2>
              </div>
              <button 
                onClick={onClose}
                className="p-1 hover:bg-tg-chat-bg rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-6">
              {/* Active Section */}
              <section className="flex flex-col gap-3">
                 <h3 className="text-[10px] font-bold uppercase tracking-widest text-tg-blue flex items-center justify-between">
                    Active Transfers
                    <span className="bg-tg-blue/10 px-2 py-0.5 rounded-full">{tasks.length}</span>
                 </h3>
                 {tasks.length === 0 ? (
                   <div className="py-8 flex flex-col items-center justify-center text-tg-text-secondary gap-3 opacity-30 bg-tg-chat-bg/30 rounded-2xl border border-dashed border-tg-border">
                      <Download size={32} />
                      <p className="text-[10px] font-bold uppercase">No active files</p>
                   </div>
                 ) : (
                   tasks.map((task) => (
                     <div key={task.id} className="bg-tg-chat-bg border border-tg-border rounded-xl p-3 flex flex-col gap-3 group hover:border-tg-blue/50 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-tg-blue/10 rounded-lg text-tg-blue">
                             <Download size={18} className={task.status === 'downloading' ? 'animate-bounce' : ''} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold truncate">{task.name}</p>
                            <p className="text-[9px] text-tg-text-secondary font-medium">
                              {formatSize(task.size)} • <span className="capitalize">{task.status}</span>
                            </p>
                          </div>
                          <div className="flex gap-1">
                             <button className="p-1.5 hover:bg-tg-sidebar rounded-lg text-tg-text-secondary hover:text-tg-blue transition-colors">
                                {task.status === 'downloading' ? <Pause size={14} /> : <Play size={14} />}
                             </button>
                             <button 
                                onClick={() => removeTask(task.id)}
                                className="p-1.5 hover:bg-tg-sidebar rounded-lg text-tg-text-secondary hover:text-red-500 transition-colors"
                             >
                                <X size={14} />
                             </button>
                          </div>
                        </div>

                        <div className="w-full h-1 bg-tg-sidebar rounded-full overflow-hidden">
                          <motion.div 
                            initial={{ width: 0 }}
                            animate={{ width: `${task.progress}%` }}
                            className="h-full bg-tg-blue"
                          />
                        </div>

                        <div className="flex justify-between items-center text-[9px] text-tg-text-secondary font-mono">
                          <span>{Math.round(task.progress)}%</span>
                          <span className="flex items-center gap-1 text-tg-blue">
                             <Rocket size={8} className="animate-pulse" /> {task.speed ? formatSize(task.speed) : '0 B'}/s
                          </span>
                        </div>
                     </div>
                   ))
                 )}
              </section>

              {/* Finished Section */}
              <section className="flex flex-col gap-3">
                 <h3 className="text-[10px] font-bold uppercase tracking-widest text-green-500 flex items-center justify-between">
                    Finished Downloads
                    {completedTasks.length > 0 && (
                       <button onClick={clearCompleted} className="hover:text-red-500 transition-colors">Clear</button>
                    )}
                 </h3>
                 {completedTasks.length === 0 ? (
                   <div className="py-8 flex flex-col items-center justify-center text-tg-text-secondary gap-3 opacity-30 bg-tg-chat-bg/30 rounded-2xl border border-dashed border-tg-border">
                      <CheckCircle2 size={32} />
                      <p className="text-[10px] font-bold uppercase">No history</p>
                   </div>
                 ) : (
                   completedTasks.map((task) => (
                      <div key={task.id} className="bg-tg-chat-bg/50 border border-tg-border rounded-xl p-3 flex items-center gap-3 group hover:border-tg-blue/30 transition-colors">
                         <div className="w-8 h-8 bg-green-500/10 rounded-lg flex items-center justify-center text-green-500 shrink-0">
                            <CheckCircle2 size={16} />
                         </div>
                         <div className="flex-1 min-w-0">
                            <p className="text-[11px] font-bold truncate">{task.name}</p>
                            <p className="text-[9px] text-tg-text-secondary">{formatSize(task.size)} • Completed</p>
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
                      </div>
                   ))
                 )}
              </section>
            </div>

            <div className="p-4 border-t border-tg-border bg-tg-chat-bg/50 mt-auto">
                <div className="flex items-center justify-between text-[9px] text-tg-text-secondary mb-2 px-1">
                   <span className="font-bold uppercase tracking-widest">Storage Path</span>
                   <Settings size={10} />
                </div>
                <div className="p-3 bg-tg-sidebar border border-tg-border rounded-xl text-[10px] font-mono text-tg-blue overflow-hidden truncate">
                   {defaultDestination}
                </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
