import { useEffect, useRef, useState } from 'react';
import { getEvent, getUsers } from '../api/client';
import { DraftOrder } from '../components/DraftOrder';
import { Lobby } from '../components/Lobby';
import { DraftResults } from '../components/DraftResults';
import { DraftTimer } from '../components/DraftTimer';
import { PlayerList } from '../components/PlayerList';
import { TeamRoster } from '../components/TeamRoster';
import { useDraftAdmin } from '../hooks/useDraftAdmin';
import { useWebSocket } from '../hooks/useWebSocket';
import { ThemeToggle } from '../components/ThemeToggle';
import { useDraftStore } from '../store/draftStore';
import { useLocalStore } from '../store/localStore';
import { usePlayerStore } from '../store/playerStore';

export function DraftRoom() {
  const userID = useLocalStore((s) => s.userID);

  // Custom hook - WebSocket connection methods
  const { connect, disconnect, sendMessage, reconnectNow } = useWebSocket(userID);
  // Setup the console API for the admin
  useDraftAdmin(sendMessage);

  // Zustand store selectors - each subscribes to a slice of global state
  const connectionStatus = useDraftStore((s) => s.connectionStatus);
  const eventID = useLocalStore((s) => s.eventID);
  const draftStatus = useDraftStore((s) => s.draftStatus);
  const roundNumber = useDraftStore((s) => s.roundNumber);
  const lastError = useDraftStore((s) => s.lastError);
  const connectedUsers = useDraftStore((s) => s.connectedUsers);
  const registeredUsers = useDraftStore((s) => s.registeredUsers);

  const reconnectAttempt = useDraftStore((s) => s.reconnectAttempt);

  const [eventName, setEventName] = useState<string>('Draft');

  const initializeEventPlayers = usePlayerStore((s) => s.setEventPlayers);
  const setRegisteredUsers = useDraftStore((s) => s.setRegisteredUsers);

  // Fetch registered users then connect WebSocket
  useEffect(() => {
    getUsers()
      .then((users) => {
        setRegisteredUsers(users);
        connect();
      })
      .catch((err) => console.error('Failed to fetch users:', err));
    return () => disconnect();
  }, [connect, disconnect, setRegisteredUsers]);

  // Fetch event name
  useEffect(() => {
    if (eventID != null) {
      getEvent(eventID)
        .then((event) => setEventName(event.name))
        .catch((err) => console.error('Failed to fetch event:', err));
    }
  }, [eventID]);

  // Initialize players for the given eventID
  useEffect(() => {
    if (eventID != null) {
      initializeEventPlayers(eventID)
    }
  }, [eventID, initializeEventPlayers])

  // Reconnection success banner
  const [showReconnected, setShowReconnected] = useState(false);
  const wasReconnectingRef = useRef(false);

  useEffect(() => {
    if (reconnectAttempt > 0) {
      wasReconnectingRef.current = true;
    }

    if (connectionStatus === 'connected' && wasReconnectingRef.current) {
      wasReconnectingRef.current = false;
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [connectionStatus, reconnectAttempt]);

  // Computed values
  const isPreDraft = draftStatus === 'idle';
  const isDraftComplete = draftStatus === 'completed';
  const [viewTeamID, setViewTeamID] = useState<number | null>(null);

  function pickPlayer(playerID: number) {
    if (userID != null) {
      sendMessage({ type: 'make_pick', userID, playerID });
    }
  }

  return (
    <div className="min-h-screen bg-surface-base text-content-primary p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-highlight-text">{eventName} Draft</h1>
          <ThemeToggle />
        </div>

        {/* Reconnection Banner */}
        {connectionStatus === 'disconnected' && reconnectAttempt > 0 && (
          <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-700 rounded flex items-center justify-between">
            <div>
              <span className="text-yellow-300 font-medium">Connection lost. Reconnecting...</span>
              <span className="text-yellow-400 text-sm ml-2">(attempt {reconnectAttempt})</span>
            </div>
            <button
              onClick={reconnectNow}
              className="px-3 py-1 bg-yellow-700 hover:bg-yellow-600 text-white text-sm rounded"
            >
              Reconnect now
            </button>
          </div>
        )}

        {connectionStatus === 'connecting' && reconnectAttempt > 0 && (
          <div className="mb-4 p-3 bg-yellow-900/50 border border-yellow-700 rounded">
            <span className="text-yellow-300 font-medium">Reconnecting...</span>
            <span className="text-yellow-400 text-sm ml-2">(attempt {reconnectAttempt})</span>
          </div>
        )}

        {showReconnected && (
          <div className="mb-4 p-3 bg-green-900/50 border border-green-700 rounded text-green-300 font-medium">
            Reconnected!
          </div>
        )}

        {/* Error Display */}
        {lastError && (
          <div className="mb-4 p-3 bg-red-900/50 border border-red-700 rounded text-red-300">
            Error: {lastError}
          </div>
        )}

        {isPreDraft ? (
          <>
            {/* Waiting Banner */}
            <div className="mb-4 p-8 bg-surface rounded text-center">
              <h2 className="text-xl font-semibold mb-2 text-highlight-text">Waiting for draft to start...</h2>
              <p className="text-content-tertiary text-sm">
                The draft admin will start the draft once everyone is ready.
              </p>
            </div>

            {/* Users */}
            <Lobby registeredUsers={registeredUsers} connectedUsers={connectedUsers} userID={userID} />
          </>
        ) : isDraftComplete ? (
          <div className="mb-4 p-8 bg-surface rounded text-center">
            <h2 className="text-xl font-semibold mb-2">Draft Complete</h2>
          </div>
        ) : (
          <>
            {/* Draft Order */}
            <div className="mb-4">
              <DraftOrder />
            </div>

            {/* Draft Status + Timer */}
            <div className="mb-4 p-4 bg-surface rounded flex items-center justify-between">
              <div className="text-xl font-semibold text-highlight-text">
                Round <span className="text-highlight-text">{roundNumber}</span>
              </div>
              <DraftTimer />
            </div>
          </>
        )}

        {/* Three-panel layout: My Team | Available Golfers | Pick History */}
        <div className="grid grid-cols-[280px_1fr_280px] gap-4">
          {/* Left: Team Roster */}
          <div className="bg-surface rounded p-4 overflow-y-auto max-h-[calc(100vh-300px)]">
            <select
              value={viewTeamID ?? ''}
              onChange={(e) => setViewTeamID(e.target.value ? Number(e.target.value) : null)}
              className="w-full mb-3 px-2 py-1 bg-surface-input border border-edge-input rounded text-sm text-content-primary"
            >
              <option value="">My Team</option>
              {registeredUsers
                .filter((u) => u.id !== userID)
                .map((u) => (
                  <option key={u.id} value={u.id}>{u.username}</option>
                ))}
            </select>
            <TeamRoster viewUserID={viewTeamID} />
          </div>

          {/* Center: Available Golfers */}
          <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
            <PlayerList onPickPlayer={pickPlayer} />
          </div>

          {/* Right: Pick History */}
          <div className="bg-surface rounded p-4 overflow-y-auto max-h-[calc(100vh-300px)]">
            <DraftResults />
          </div>
        </div>
      </div>
    </div>
  );
}
