import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Account {
  id: string;
  name: string;
  avatar?: string;
  isActive: boolean;
}

interface Message {
  id: string;
  senderId: string;
  text: string;
  timestamp: number;
  isRead: boolean;
}

interface Chat {
  id: string;
  name: string;
  lastMessage?: string;
  timestamp: number;
  unreadCount: number;
  isHidden: boolean;
  avatar?: string;
  messages: Message[];
}

interface UserProf {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

interface ChatState {
  isAuthenticated: boolean;
  user: UserProf | null;
  accounts: Account[];
  activeAccountId: string | null;
  activeChatId: string | null;
  isPrivateMode: boolean;
  revealTriggered: boolean;
  
  // Actions
  setAuthenticated: (user: UserProf) => void;
  logout: () => void;
  setActiveAccount: (id: string) => void;
  setActiveChat: (id: string | null) => void;
  togglePrivateMode: (pin?: string) => void;
  setRevealTriggered: (val: boolean) => void;
  hideChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Message) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      accounts: [
        { id: '1', name: 'Main Account', isActive: true },
        { id: '2', name: 'Work Account', isActive: false },
      ],
      activeAccountId: '1',
      activeChatId: null,
      isPrivateMode: false,
      revealTriggered: false,

      setAuthenticated: (user) => set({ isAuthenticated: true, user }),
      logout: () => set({ isAuthenticated: false, user: null }),
      setActiveAccount: (id) => set({ activeAccountId: id }),
      setActiveChat: (id) => set({ activeChatId: id }),
      setRevealTriggered: (val) => set({ revealTriggered: val }),
      
      togglePrivateMode: (pin) => set((state) => {
        // In a real app, verify PIN against hash
        if (state.isPrivateMode) return { isPrivateMode: false };
        if (pin === '1234') return { isPrivateMode: true };
        return state;
      }),

      hideChat: (chatId) => set((state) => ({
        // Logic to mark chat as hidden in state
      })),

      addMessage: (chatId, message) => set((state) => ({
        // Logic to add message to specific chat
      })),
    }),
    {
      name: 'telecool-storage',
      partialize: (state) => ({ 
        accounts: state.accounts, 
        activeAccountId: state.activeAccountId,
        isAuthenticated: state.isAuthenticated,
        user: state.user
      }),
    }
  )
);
