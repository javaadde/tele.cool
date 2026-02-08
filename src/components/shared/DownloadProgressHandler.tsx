"use client";

import { useEffect } from "react";
import { useDownloadStore } from "@/store/useDownloadStore";

/**
 * Global component to handle download progress simulation across the app.
 * This ensures progress bars update in real-time on any page.
 */
export const DownloadProgressHandler = () => {
  const { tasks } = useDownloadStore();

  useEffect(() => {
    // Check if there are any active tasks to simulate
    const hasActiveTasks = tasks.some(t => t.status === 'downloading' || t.status === 'pending');
    if (!hasActiveTasks) return;

    const interval = setInterval(() => {
      tasks.forEach(task => {
        if (task.status === 'downloading' || task.status === 'pending') {
          if (task.status === 'pending') {
            useDownloadStore.getState().updateStatus(task.id, 'downloading');
          }
          
          if (task.progress < 100) {
            // Realistic progress: slower as it gets closer to 99% 
            // until the real backend API returns success
            // Realistic progress: Much slower for big files (0.05% - 0.2% per second)
            // This prevents the UI from "faking" completion too fast
            const baseIncrement = Math.random() * 0.1 + 0.05;
            const slowedIncrement = task.progress > 95 ? baseIncrement / 10 : baseIncrement;
            
            const speed = Math.random() * 5 * 1024 * 1024 + 1 * 1024 * 1024; // 1-6 MB/s
            const newProgress = Math.min(task.progress + slowedIncrement, 99.8); 
            
            useDownloadStore.getState().updateProgress(task.id, newProgress, speed);
          }
        }
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [tasks]);

  return null;
};
