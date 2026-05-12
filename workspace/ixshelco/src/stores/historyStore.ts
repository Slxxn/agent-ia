import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface HistoryEntry {
  id: string;
  userId: string;
  type: 'appointment' | 'payment' | 'profile' | 'review';
  action: string;
  description: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

interface HistoryState {
  entries: HistoryEntry[];
  isLoading: boolean;
  error: string | null;
  addEntry: (entry: Omit<HistoryEntry, 'id' | 'createdAt'>) => void;
  getEntriesByUser: (userId: string) => HistoryEntry[];
  getEntriesByType: (type: HistoryEntry['type']) => HistoryEntry[];
  clearHistory: () => void;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setEntries: (entries: HistoryEntry[]) => void;
}

export const useHistoryStore = create<HistoryState>()(
  persist(
    (set, get) => ({
      entries: [],
      isLoading: false,
      error: null,

      addEntry: (entry) => {
        const newEntry: HistoryEntry = {
          ...entry,
          id: 'hist_' + Math.random().toString(36).substr(2, 9),
          createdAt: new Date().toISOString(),
        };
        set((state) => ({ 
          entries: [newEntry, ...state.entries].slice(0, 100)
        }));
      },

      getEntriesByUser: (userId) => {
        return get().entries.filter(entry => entry.userId === userId);
      },

      getEntriesByType: (type) => {
        return get().entries.filter(entry => entry.type === type);
      },

      clearHistory: () => set({ entries: [] }),
      clearError: () => set({ error: null }),
      setLoading: (loading) => set({ isLoading: loading }),
      setError: (error) => set({ error }),
      setEntries: (entries) => set({ entries }),
    }),
    {
      name: 'ixshel-history',
      partialize: (state) => ({ entries: state.entries }),
    }
  )
);