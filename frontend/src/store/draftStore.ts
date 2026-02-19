import { create } from 'zustand';
import type { Pick, ServerMessage, User } from '../types';

type ConnectionStatus = 'disconnected' | 'connecting' | 'connected';
type DraftStatus = 'idle' | 'in_progress' | 'paused' | 'completed';

interface DraftState {
  // Connection
  connectionStatus: ConnectionStatus;

  // Draft state
  draftStatus: DraftStatus;
  currentTurn: number | null;
  roundNumber: number;
  totalRounds: number;
  currentPickIndex: number;
  pickOrder: number[];
  availablePlayerIDs: number[] | null;
  pickHistory: Pick[];
  turnDeadline: number | null;
  remainingTime: number;

  // Users
  connectedUsers: User[];
  registeredUsers: User[];

  // Error
  lastError: string | null;

  // Actions
  setConnectionStatus: (status: ConnectionStatus) => void;
  setRegisteredUsers: (users: User[]) => void;
  handleServerMessage: (message: ServerMessage) => void;
  reset: () => void;
}

const initialState = {
  connectionStatus: 'disconnected' as ConnectionStatus,
  draftStatus: 'idle' as DraftStatus,
  currentTurn: null,
  roundNumber: 0,
  totalRounds: 0,
  currentPickIndex: 0,
  pickOrder: [],
  availablePlayerIDs: null,
  pickHistory: [],
  turnDeadline: null,
  remainingTime: 0,
  connectedUsers: [] as User[],
  registeredUsers: [] as User[],
  lastError: null,
};

export const useDraftStore = create<DraftState>((set) => ({
  ...initialState,

  setConnectionStatus: (status) => set({ connectionStatus: status }),
  setRegisteredUsers: (users) => set({ registeredUsers: users }),

  handleServerMessage: (message) => {
    switch (message.type) {
      case 'draft_started':
        set({
          draftStatus: 'in_progress',
          currentTurn: message.currentTurn,
          roundNumber: message.roundNumber,
          turnDeadline: message.turnDeadline,
          pickOrder: message.pickOrder,
          totalRounds: message.totalRounds,
          availablePlayerIDs: message.availablePlayers,
          lastError: null,
        });
        break;

      case 'draft_state':
        set((state) => ({
          draftStatus: message.status === 'in_progress' ? 'in_progress'
                     : message.status === 'paused' ? 'paused'
                     : message.status === 'not_started' ? 'idle'
                     : 'completed',
          currentTurn: message.currentTurn,
          roundNumber: message.roundNumber,
          totalRounds: message.totalRounds,
          currentPickIndex: message.currentPickIndex,
          pickOrder: message.pickOrder,
          availablePlayerIDs: message.availablePlayers,
          pickHistory: message.pickHistory,
          turnDeadline: message.turnDeadline,
          remainingTime: message.remainingTime,
          connectedUsers: state.registeredUsers.filter(
            (u) => message.connectedUserIDs.includes(u.id)
          ),
          lastError: null,
        }));
        break;

      case 'pick_made':
        set((state) => ({
          pickHistory: [
            ...state.pickHistory,
            {
              userID: message.userID,
              playerID: message.playerID,
              pickNumber: state.pickHistory.length + 1,
              round: message.round,
              autoDraft: message.autoDraft,
            },
          ],
          availablePlayerIDs: (state.availablePlayerIDs ?? []).filter(
            (id) => id !== message.playerID
          ),
        }));
        break;

      case 'turn_changed':
        set({
          currentTurn: message.currentTurn,
          roundNumber: message.roundNumber,
          turnDeadline: message.turnDeadline,
        });
        break;

      case 'draft_completed':
        set({
          draftStatus: 'completed',
          totalRounds: message.totalRounds,
        });
        break;

      case 'draft_paused':
        set({
          draftStatus: 'paused',
          remainingTime: message.remainingTime,
        });
        break;

      case 'draft_resumed':
        set({
          draftStatus: 'in_progress',
          currentTurn: message.currentTurn,
          roundNumber: message.roundNumber,
          turnDeadline: message.turnDeadline,
        });
        break;

      case 'user_joined':
        set((state) => {
          if (state.connectedUsers.some((u) => u.id === message.userID)) {
            return state;
          }
          let user = state.registeredUsers.find((u) => u.id === message.userID);
          const registeredUsers = user
            ? state.registeredUsers
            : [...state.registeredUsers, { id: message.userID, username: message.username, eventID: 0, createdAt: '' }];
          if (!user) {
            user = registeredUsers[registeredUsers.length - 1];
          }
          return {
            registeredUsers,
            connectedUsers: [...state.connectedUsers, user],
          };
        });
        break;

      case 'user_left':
        set((state) => ({
          connectedUsers: state.connectedUsers.filter(
            (u) => u.id !== message.userID
          ),
        }));
        break;

      case 'error':
        set({ lastError: message.error });
        break;
    }
  },

  reset: () => set(initialState),
}));
