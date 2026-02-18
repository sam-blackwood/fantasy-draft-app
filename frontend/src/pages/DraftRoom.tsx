import { useEffect } from 'react';
import { useWebSocket } from '../hooks/useWebSocket';
import { useDraftStore } from '../store/draftStore';
import { useLocalStore } from '../store/localStore';
import { usePlayerStore } from '../store/playerStore';
import { getUsers } from '../api/client';
import { PlayerList } from '../components/PlayerList';
import { DraftOrder } from '../components/DraftOrder';

export function DraftRoom() {
  const userID = useLocalStore((s) => s.userID);

  // Custom hook - WebSocket connection methods
  const { connect, disconnect } = useWebSocket(userID);

  // Zustand store selectors - each subscribes to a slice of global state
  const connectionStatus = useDraftStore((s) => s.connectionStatus);
  const eventID = useLocalStore((s) => s.eventID);
  const draftStatus = useDraftStore((s) => s.draftStatus);
  const currentTurn = useDraftStore((s) => s.currentTurn);
  const roundNumber = useDraftStore((s) => s.roundNumber);
  const pickHistory = useDraftStore((s) => s.pickHistory);
  const lastError = useDraftStore((s) => s.lastError);
  const turnDeadline = useDraftStore((s) => s.turnDeadline);
  const connectedUsers = useDraftStore((s) => s.connectedUsers);
  const registeredUsers = useDraftStore((s) => s.registeredUsers);

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

  // Computed values
  const isMyTurn = currentTurn === userID;
  const isPreDraft = draftStatus === 'idle';
  const myUsername = registeredUsers.find((u) => u.id === userID)?.username;

  return (
    <div className="min-h-screen bg-gray-900 text-white p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Draft Room</h1>
        </div>

        {/* Connection Status */}
        <div className="mb-4 p-3 bg-gray-800 rounded">
          <div className="flex items-center gap-2">
            <span
              className={`w-3 h-3 rounded-full ${
                connectionStatus === 'connected'
                  ? 'bg-green-500'
                  : connectionStatus === 'connecting'
                  ? 'bg-yellow-500'
                  : 'bg-red-500'
              }`}
            />
            <span className="text-sm">
              {connectionStatus === 'connected'
                ? 'Connected'
                : connectionStatus === 'connecting'
                ? 'Connecting...'
                : 'Disconnected'}
            </span>
          </div>
          <p className="text-xs text-gray-400 mt-1">
            {myUsername ? `Connected as ${myUsername} (ID: ${userID})` : `User ID: ${userID}`}
          </p>
        </div>

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
        ) : (
          <>
            {/* Draft Order */}
            <div className="mb-4">
              <DraftOrder />
            </div>

            {/* Draft Status */}
            <div className="mb-4 p-4 bg-gray-800 rounded">
              <h2 className="font-semibold mb-2">Draft Status</h2>
              <div className="grid grid-cols-2 gap-2 text-sm">
                <div>Status: <span className="text-blue-400">{draftStatus}</span></div>
                <div>Round: <span className="text-blue-400">{roundNumber}</span></div>
                <div>Current Turn: <span className="text-blue-400">{currentTurn ?? 'N/A'}</span></div>
                <div>
                  {isMyTurn ? (
                    <span className="text-green-400 font-bold">YOUR TURN!</span>
                  ) : (
                    <span className="text-gray-400">Waiting...</span>
                  )}
                </div>
              </div>
              {turnDeadline && (
                <div className="mt-2 text-xs text-gray-400">
                  Turn deadline: {new Date(turnDeadline * 1000).toLocaleTimeString()}
                </div>
              )}
            </div>

            {/* Pick History */}
            <div className="mb-4 p-4 bg-gray-800 rounded">
              <h2 className="font-semibold mb-2">
                Pick History ({pickHistory.length})
              </h2>
              {pickHistory.length === 0 ? (
                <p className="text-gray-400 text-sm">No picks yet.</p>
              ) : (
                <div className="space-y-1 text-sm max-h-48 overflow-y-auto">
                  {pickHistory.map((pick, i) => (
                    <div key={i} className="flex justify-between">
                      <span>
                        #{pick.pickNumber} - User {pick.userID} picked Player {pick.playerID}
                      </span>
                      <span className="text-gray-400">
                        Round {pick.round}
                        {pick.autoDraft && (
                          <span className="text-yellow-500 ml-2">(auto)</span>
                        )}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        )}

        {/* Player List */}
        <div className="mb-4">
          <PlayerList />
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
