import { create } from 'zustand';

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
  globalSpeedLimit: number | null; // null means no limit (boost mode)
  defaultDestination: string | null;
  
  addTask: (task: DownloadTask) => void;
  updateStatus: (id: string, status: DownloadTask['status']) => void;
  updateProgress: (id: string, progress: number, speed: number) => void;
  setSpeedLimit: (limit: number | null) => void;
}

export const useDownloadStore = create<DownloadState>((set) => ({
  tasks: [],
  globalSpeedLimit: null,
  defaultDestination: null,

  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateStatus: (id, status) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, status } : t)
  })),
  updateProgress: (id, progress, speed) => set((state) => ({
    tasks: state.tasks.map(t => t.id === id ? { ...t, progress, speed } : t)
  })),
  setSpeedLimit: (limit) => set({ globalSpeedLimit: limit }),
}));
