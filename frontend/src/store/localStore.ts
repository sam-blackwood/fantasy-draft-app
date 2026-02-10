import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface LocalState {
  eventID: number | null;
  userID: number | null;
  setEventID: (eventID: number) => void;
  setUserID: (userID: number) => void;
  clear: () => void;
}

const initialState = {
  eventID: null,
  userID: null,
};

export const useLocalStore = create<LocalState>()(
  persist(
    (set) => ({
      ...initialState,
      setEventID: (eventID) => set({ eventID }),
      setUserID: (userID) => set({ userID }),
      clear: () => set(initialState),
    }),
    { name: 'draft-local-store' },
  ),
);
