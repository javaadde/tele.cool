import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface DownloadTask {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: 'pending' | 'downloading' | 'paused' | 'completed' | 'error';
  speed: number; // bytes per second
}

interface DownloadState {
  tasks: DownloadTask[];
  completedTasks: DownloadTask[];
  defaultDestination: string;
  
  addTask: (task: DownloadTask) => void;
  updateStatus: (id: string, status: DownloadTask['status']) => void;
  updateProgress: (id: string, progress: number, speed: number) => void;
  removeTask: (id: string) => void;
  clearCompleted: () => void;
}

export const useDownloadStore = create<DownloadState>()(
  persist(
    (set) => ({
      tasks: [],
      completedTasks: [],
      defaultDestination: '~/Downloads/TeleCool',

      addTask: (task) => set((state) => ({ 
        tasks: [...state.tasks, task] 
      })),

      updateStatus: (id, status) => set((state) => {
        const task = state.tasks.find(t => t.id === id);
        if (status === 'completed' && task) {
          return {
            tasks: state.tasks.filter(t => t.id !== id),
            completedTasks: [{ ...task, status: 'completed', progress: 100 }, ...state.completedTasks]
          };
        }
        return {
          tasks: state.tasks.map(t => t.id === id ? { ...t, status } : t)
        };
      }),

      updateProgress: (id, progress, speed) => set((state) => ({
        tasks: state.tasks.map(t => t.id === id ? { ...t, progress, speed } : t)
      })),

      removeTask: (id) => set((state) => ({
        tasks: state.tasks.filter(t => t.id !== id),
        completedTasks: state.completedTasks.filter(t => t.id !== id)
      })),

      clearCompleted: () => set({ completedTasks: [] }),
    }),
    {
      name: 'telecool-downloads',
    }
  )
);
