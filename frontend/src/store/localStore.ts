import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocalState {
  eventID: number | null;
  userID: number | null;
  theme: 'dark' | 'light';
  setEventID: (eventID: number) => void;
  setUserID: (userID: number) => void;
  toggleTheme: () => void;
  clear: () => void;
}

export const useLocalStore = create<LocalState>()(
  persist(
    (set) => ({
      eventID: null,
      userID: null,
      theme: 'dark' as const,
      setEventID: (eventID) => set({ eventID }),
      setUserID: (userID) => set({ userID }),
      toggleTheme: () => set((state) => ({ theme: state.theme === 'dark' ? 'light' : 'dark' })),
      clear: () => set({ eventID: null, userID: null }),
    }),
    { name: 'draft-local-store' },
  ),
);
