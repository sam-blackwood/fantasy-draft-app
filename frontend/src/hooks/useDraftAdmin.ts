import { useEffect } from 'react';
import { createDraftRoom } from '../api/client';
import { useDraftStore } from '../store/draftStore';
import { useLocalStore } from '../store/localStore';
import { usePlayerStore } from '../store/playerStore';
import type { ClientMessage } from '../types';

/**
 * Picks a random available player for the current turn user.
 * Returns the message to send, or null if autopick isn't possible.
 */
export function buildAutopickMessage(): { message: ClientMessage; playerID: number; userID: number } | null {
  const { currentTurn, availablePlayerIDs, draftStatus } = useDraftStore.getState();
  if (draftStatus !== 'in_progress') return null;
  if (currentTurn == null || !availablePlayerIDs?.length) return null;
  const playerID = availablePlayerIDs[Math.floor(Math.random() * availablePlayerIDs.length)];
  return {
    message: { type: 'make_pick', userID: currentTurn, playerID, autoDraft: true },
    playerID,
    userID: currentTurn,
  };
}

interface DraftAdmin {
  startDraft: (pickOrder: number[], totalRounds: number, timerDuration: number) => void;
  pause: () => void;
  resume: () => void;
  makePick: (userID: number, playerIDOrName: number | string) => void;
  autopick: () => void;
  status: () => void;
  users: () => void;
  players: (search?: string) => void;
}

declare global {
  interface Window {
    draftAdmin?: DraftAdmin;
  }
}

export function useDraftAdmin(sendMessage: (message: ClientMessage) => void) {
  useEffect(() => {
    window.draftAdmin = {
      startDraft: async (pickOrder: number[], totalRounds: number, timerDuration: number) => {
        const eventID = useLocalStore.getState().eventID ?? 0;
        try {
          await createDraftRoom(eventID);
          console.log('Draft room created');
        } catch (err) {
          console.error('Failed to create draft room:', err);
          return;
        }
        const availablePlayers = usePlayerStore.getState().eventPlayers.map((p) => p.id);
        sendMessage({
          type: 'start_draft',
          eventID,
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
      makePick: (userID: number, playerIDOrName: number | string) => {
        let playerID: number;

        if (typeof playerIDOrName === 'number') {
          playerID = playerIDOrName;
        } else {
          const query = playerIDOrName.toLowerCase();
          const eventPlayers = usePlayerStore.getState().eventPlayers;
          const availableIDs = new Set(useDraftStore.getState().availablePlayerIDs ?? []);
          const matches = eventPlayers.filter((p) => {
            const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
            return (
              availableIDs.has(p.id) &&
              (fullName.includes(query) ||
                p.firstName.toLowerCase().includes(query) ||
                p.lastName.toLowerCase().includes(query))
            );
          });

          if (matches.length === 0) {
            console.warn(`No available player found matching "${playerIDOrName}"`);
            return;
          }
          if (matches.length > 1) {
            console.warn(`Multiple players match "${playerIDOrName}":`);
            console.table(matches.map((p) => ({ id: p.id, name: `${p.firstName} ${p.lastName}` })));
            return;
          }
          playerID = matches[0].id;
          console.log(`Drafting ${matches[0].firstName} ${matches[0].lastName} (ID: ${playerID})`);
        }

        sendMessage({ type: 'make_pick', userID, playerID });
      },
      autopick: () => {
        const result = buildAutopickMessage();
        if (!result) {
          console.warn('Cannot autopick: draft not in progress or no available players');
          return;
        }
        console.log(`Autopicking player ${result.playerID} for user ${result.userID}`);
        sendMessage(result.message);
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
      players: (search?: string) => {
        const eventPlayers = usePlayerStore.getState().eventPlayers;
        const availableIDs = new Set(useDraftStore.getState().availablePlayerIDs ?? []);
        let players = eventPlayers.filter((p) => availableIDs.has(p.id));

        if (search) {
          const query = search.toLowerCase();
          players = players.filter((p) => {
            const fullName = `${p.firstName} ${p.lastName}`.toLowerCase();
            return (
              fullName.includes(query) ||
              p.firstName.toLowerCase().includes(query) ||
              p.lastName.toLowerCase().includes(query)
            );
          });
        }

        if (players.length === 0) {
          console.log(search ? `No available players matching "${search}"` : 'No available players');
          return;
        }

        console.table(
          players.map((p) => ({ id: p.id, name: `${p.firstName} ${p.lastName}`, status: p.status, country: p.countryCode }))
        );
      },
    };

    return () => {
      delete window.draftAdmin;
    };
  }, [sendMessage]);
}
