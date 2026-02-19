import { useEffect } from 'react';
import { useDraftStore } from '../store/draftStore';
import { useLocalStore } from '../store/localStore';
import { usePlayerStore } from '../store/playerStore';
import type { ClientMessage } from '../types';

interface DraftAdmin {
  startDraft: (pickOrder: number[], totalRounds: number, timerDuration: number) => void;
  pause: () => void;
  resume: () => void;
  makePick: (userID: number, playerID: number) => void;
  autopick: () => void;
  status: () => void;
  users: () => void;
}

declare global {
  interface Window {
    draftAdmin?: DraftAdmin;
  }
}

export function useDraftAdmin(sendMessage: (message: ClientMessage) => void) {
  useEffect(() => {
    window.draftAdmin = {
      startDraft: (pickOrder: number[], totalRounds: number, timerDuration: number) => {
        const eventID = useLocalStore.getState().eventID;
        const availablePlayers = usePlayerStore.getState().eventPlayers.map((p) => p.id);
        sendMessage({
          type: 'start_draft',
          eventID: eventID ?? 0,
          pickOrder,
          totalRounds,
          timerDuration,
          availablePlayers,
        });
      },
      pause: () => {
        sendMessage({ type: 'pause_draft' });
      },
      resume: () => {
        sendMessage({ type: 'resume_draft' });
      },
      makePick: (userID: number, playerID: number) => {
        sendMessage({ type: 'make_pick', userID, playerID });
      },
      autopick: () => {
        const { currentTurn, availablePlayerIDs, draftStatus } = useDraftStore.getState();
        if (draftStatus !== 'in_progress') {
          console.warn('Draft is not in progress');
          return;
        }
        if (currentTurn == null || !availablePlayerIDs?.length) {
          console.warn('No current turn or no available players');
          return;
        }
        const playerID = availablePlayerIDs[Math.floor(Math.random() * availablePlayerIDs.length)];
        console.log(`Autopicking player ${playerID} for user ${currentTurn}`);
        sendMessage({ type: 'make_pick', userID: currentTurn, playerID });
      },
      status: () => {
        const state = useDraftStore.getState();
        console.table({
          draftStatus: state.draftStatus,
          connectionStatus: state.connectionStatus,
          currentTurn: state.currentTurn,
          roundNumber: state.roundNumber,
          totalRounds: state.totalRounds,
          currentPickIndex: state.currentPickIndex,
          pickCount: state.pickHistory.length,
          turnDeadline: state.turnDeadline
            ? new Date(state.turnDeadline * 1000).toLocaleTimeString()
            : null,
        });
      },
      users: () => {
        const state = useDraftStore.getState();
        console.log('Connected:', state.connectedUsers);
        console.log('Registered:', state.registeredUsers);
      },
    };

    return () => {
      delete window.draftAdmin;
    };
  }, [sendMessage]);
}
