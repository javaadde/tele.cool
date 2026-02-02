"use client";

import { useDownloadStore, DownloadTask } from "@/store/useDownloadStore";
import { motion, AnimatePresence } from "framer-motion";
import { X, Download, Pause, Play, CheckCircle2, ChevronDown, Rocket, Shield } from "lucide-react";
import { cn } from "@/lib/utils";

export const DownloadManager = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
  const { tasks, globalSpeedLimit, setSpeedLimit } = useDownloadStore();

  const formatSize = (bytes: number) => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
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

            {/* Throttling Controls */}
            <div className="p-4 border-b border-tg-border bg-tg-chat-bg/30">
              <div className="flex items-center justify-between mb-4">
                <span className="text-sm font-medium">Download Speed Control</span>
                <span className={cn(
                  "text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider",
                  globalSpeedLimit === null ? "bg-tg-blue text-white" : "bg-tg-text-secondary/20 text-tg-text-secondary"
                )}>
                  {globalSpeedLimit === null ? "Turbo Mode" : "Limited"}
                </span>
              </div>
              <div className="flex gap-2">
                {[null, 1024 * 1024 * 2, 1024 * 1024 * 10].map((limit) => (
                  <button
                    key={String(limit)}
                    onClick={() => setSpeedLimit(limit)}
                    className={cn(
                      "flex-1 text-[10px] py-2 rounded-lg border transition-all",
                      globalSpeedLimit === limit 
                        ? "bg-tg-blue border-tg-blue text-white" 
                        : "bg-transparent border-tg-border text-tg-text-secondary hover:border-tg-blue/50"
                    )}
                  >
                    {limit === null ? "Max Speed" : `${formatSize(limit)}/s`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
              {tasks.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-tg-text-secondary gap-3 opacity-50">
                   <Download size={48} />
                   <p className="text-sm">No active downloads</p>
                </div>
              ) : (
                tasks.map((task) => (
                  <div key={task.id} className="bg-tg-chat-bg border border-tg-border rounded-xl p-3 flex flex-col gap-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-tg-blue/10 rounded-lg text-tg-blue">
                         <Download size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{task.name}</p>
                        <p className="text-[10px] text-tg-text-secondary">
                          {formatSize(task.size)} • {task.status}
                        </p>
                      </div>
                      <button className="text-tg-text-secondary hover:text-tg-blue">
                         {task.status === 'downloading' ? <Pause size={18} /> : <Play size={18} />}
                      </button>
                    </div>

                    <div className="w-full h-1.5 bg-tg-sidebar rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: `${task.progress}%` }}
                        className="h-full bg-tg-blue"
                      />
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-tg-text-secondary">
                      <span>{task.progress}% complete</span>
                      <span className="flex items-center gap-1 font-mono text-tg-blue">
                         <Rocket size={10} /> 4.2 MB/s
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
            
            <div className="p-4 border-t border-tg-border bg-tg-chat-bg/50">
               <div className="flex items-center gap-3 p-3 bg-tg-blue rounded-xl text-white">
                  <Shield size={20} />
                  <div className="flex-1">
                     <p className="text-xs font-bold">Premium Traffic</p>
                     <p className="text-[10px] opacity-80">Encrypted transmission via TeleCool Pro</p>
                  </div>
                  <ChevronDown size={16} />
               </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
