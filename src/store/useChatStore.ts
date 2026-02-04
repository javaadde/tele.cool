import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface Account {
  id: string;
  name: string;
  avatar?: string;
  isActive: boolean;
  session: string;
  user: UserProf;
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

export interface UserProf {
  id: string;
  phone: string;
  firstName?: string;
  lastName?: string;
  username?: string;
}

interface ChatState {
  isAuthenticated: boolean;
  user: UserProf | null;
  session: string | null;
  accounts: Account[];
  activeAccountId: string | null;
  activeChatId: string | null;
  isPrivateMode: boolean;
  revealTriggered: boolean;
  
  // Actions
  setAuthenticated: (user: UserProf, session: string) => void;
  addAccount: (account: Omit<Account, 'isActive'>) => void;
  renameAccount: (id: string, name: string) => void;
  logout: () => void;
  clearAll: () => void;
  setActiveAccount: (id: string) => void;
  setActiveChat: (id: string | null) => void;
  togglePrivateMode: (pin?: string) => void;
  setRevealTriggered: (val: boolean) => void;
  hideChat: (chatId: string) => void;
  addMessage: (chatId: string, message: Message) => void;
  removeAccount: (id: string) => void;
}

export const useChatStore = create<ChatState>()(
  persist(
    (set) => ({
      isAuthenticated: false,
      user: null,
      session: null,
      accounts: [],
      activeAccountId: null,
      activeChatId: null,
      isPrivateMode: false,
      revealTriggered: false,

      setAuthenticated: (user, session) => 
        set((state) => ({ 
          isAuthenticated: true, 
          user, 
          session,
          accounts: state.accounts.map(acc => 
            acc.id === state.activeAccountId ? { ...acc, user, session } : acc
          )
        })),
      addAccount: (account) =>
        set((state) => {
          const exists = state.accounts.some((acc) => acc.id === account.id);
          const newAccount = { ...account, isActive: true };
          
          if (exists) {
            return {
              isAuthenticated: true,
              user: account.user,
              session: account.session,
              accounts: state.accounts.map((acc) =>
                acc.id === account.id ? { ...acc, ...newAccount } : acc
              ),
              activeAccountId: account.id,
            };
          }
          return {
            isAuthenticated: true,
            user: account.user,
            session: account.session,
            accounts: [...state.accounts, newAccount],
            activeAccountId: account.id,
          };
        }),
      renameAccount: (id, name) =>
        set((state) => ({
          accounts: state.accounts.map((acc) => (acc.id === id ? { ...acc, name } : acc)),
        })),
      logout: () => set({ 
        isAuthenticated: false, 
        user: null, 
        session: null, 
        accounts: [], 
        activeAccountId: null,
        activeChatId: null,
        isPrivateMode: false
      }),
      clearAll: () => {
        localStorage.removeItem('telecool-storage');
        set({ 
          isAuthenticated: false, 
          user: null, 
          session: null, 
          accounts: [], 
          activeAccountId: null,
          activeChatId: null,
          isPrivateMode: false
        });
        window.location.reload();
      },
      setActiveAccount: (id) => set((state) => {
        const account = state.accounts.find(a => a.id === id);
        return { 
          activeAccountId: id, 
          activeChatId: null,
          session: account?.session || null,
          user: account?.user || null,
          isAuthenticated: !!account?.session
        };
      }),
      setActiveChat: (id) => set({ activeChatId: id }),
      setRevealTriggered: (val) => set({ revealTriggered: val }),
      
      removeAccount: (id) => set((state) => ({
        accounts: state.accounts.filter(a => a.id !== id),
        activeAccountId: state.activeAccountId === id ? (state.accounts.find(a => a.id !== id)?.id || null) : state.activeAccountId
      })),

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
        user: state.user,
        session: state.session
      }),
    }
  )
);
