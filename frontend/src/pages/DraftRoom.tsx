import { useEffect, useRef, useState } from 'react';
import { getUsers } from '../api/client';
import { DraftOrder } from '../components/DraftOrder';
import { DraftResults } from '../components/DraftResults';
import { DraftTimer } from '../components/DraftTimer';
import { PlayerList } from '../components/PlayerList';
import { TeamRoster } from '../components/TeamRoster';
import { useDraftAdmin } from '../hooks/useDraftAdmin';
import { useWebSocket } from '../hooks/useWebSocket';
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
  const myUsername = registeredUsers.find((u) => u.id === userID)?.username;

  function pickPlayer(playerID: number) {
    if (userID != null) {
      sendMessage({ type: 'make_pick', userID, playerID });
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Draft Room</h1>
        </div>

        {/* Connection Status */}
        <div className="mb-4 p-3 bg-gray-800 rounded">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${connectionStatus === 'connected'
                ? 'bg-green-500'
                : connectionStatus === 'connecting'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
                }`}
            />
            <span className="text-sm">
              {connectionStatus === 'connected'
                ? 'Connected'
                : connectionStatus === 'connecting' && reconnectAttempt > 0
                  ? `Reconnecting (attempt ${reconnectAttempt})...`
                  : connectionStatus === 'connecting'
                    ? 'Connecting...'
                    : 'Disconnected'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {myUsername ? `Connected as ${myUsername} (ID: ${userID})` : `User ID: ${userID}`}
          </p>
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
            <div className="mb-4 p-8 bg-gray-800 rounded text-center">
              <h2 className="text-xl font-semibold mb-2">Waiting for draft to start...</h2>
              <p className="text-gray-400 text-sm">
                The draft admin will start the draft once everyone is ready.
              </p>
            </div>

            {/* Users */}
            <div className="mb-4 p-4 bg-gray-800 rounded">
              <h2 className="font-semibold mb-2">Users</h2>
              <div className="space-y-1 text-sm">
                {registeredUsers.map((user) => {
                  const isMe = user.id === userID;
                  const isConnected = isMe || connectedUsers.some((u) => u.id === user.id);
                  return (
                    <div key={user.id} className="flex items-center gap-2">
                      <span className={isConnected ? 'text-white' : 'text-gray-500'}>
                        {user.username}
                      </span>
                      <span className={`text-xs ${isMe ? 'text-blue-400' : isConnected ? 'text-green-400' : 'text-gray-500'}`}>
                        ({isMe ? 'You' : isConnected ? 'Active' : 'Inactive'})
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        ) : isDraftComplete ? (
          <div className="mb-4 p-8 bg-gray-800 rounded text-center">
            <h2 className="text-xl font-semibold mb-2">Draft Complete</h2>
          </div>
        ) : (
          <>
            {/* Draft Order */}
            <div className="mb-4">
              <DraftOrder />
            </div>

            {/* Draft Status + Timer */}
            <div className="mb-4 p-4 bg-gray-800 rounded flex items-center justify-between">
              <div className="text-sm">
                <div>Round <span className="text-blue-400 font-medium">{roundNumber}</span></div>
              </div>
              <DraftTimer />
            </div>
          </>
        )}

        {/* Three-panel layout: My Team | Available Golfers | Pick History */}
        <div className="grid grid-cols-[280px_1fr_280px] gap-4">
          {/* Left: My Team */}
          <div className="bg-gray-800 rounded p-4 overflow-y-auto max-h-[calc(100vh-300px)]">
            <TeamRoster />
          </div>

          {/* Center: Available Golfers */}
          <div className="overflow-y-auto max-h-[calc(100vh-300px)]">
            <PlayerList onPickPlayer={pickPlayer} />
          </div>

          {/* Right: Pick History */}
          <div className="bg-gray-800 rounded p-4 overflow-y-auto max-h-[calc(100vh-300px)]">
            <DraftResults />
          </div>
        </div>

        {/* Debug: Raw State */}
        <details className="mt-4">
          <summary className="text-gray-400 text-sm cursor-pointer">
            Debug: Raw Store State
          </summary>
          <pre className="mt-2 p-4 bg-gray-800 rounded text-xs overflow-x-auto">
            {JSON.stringify(useDraftStore.getState(), null, 2)}
          </pre>
        </details>
      </div>
    </div>
  );
}
