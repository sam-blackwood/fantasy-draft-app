import { useMemo, useState } from 'react';
import { createDraftRoom } from '../api/client';
import { buildAutopickMessage } from '../hooks/useDraftAdmin';
import { useDraftStore } from '../store/draftStore';
import { useLocalStore } from '../store/localStore';
import { usePlayerStore } from '../store/playerStore';
import type { ClientMessage, User } from '../types';

interface AdminPanelProps {
  sendMessage: (msg: ClientMessage) => void;
}

export function AdminPanel({ sendMessage }: AdminPanelProps) {
  const [isOpen, setIsOpen] = useState(false);

  const draftStatus = useDraftStore((s) => s.draftStatus);
  const registeredUsers = useDraftStore((s) => s.registeredUsers);
  const connectedUsers = useDraftStore((s) => s.connectedUsers);
  const currentTurn = useDraftStore((s) => s.currentTurn);

  const isPreDraft = draftStatus === 'idle';
  const isActive = draftStatus === 'in_progress' || draftStatus === 'paused';

  return (
    <>
      {/* Sticky toggle button */}
      <button
        onClick={() => setIsOpen((o) => !o)}
        className="fixed bottom-4 right-4 z-50 w-12 h-12 rounded-full bg-accent hover:bg-accent-bright text-white flex items-center justify-center shadow-lg transition-colors text-xl"
        aria-label="Toggle admin panel"
      >
        {isOpen ? (
          <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="size-5" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z" clipRule="evenodd" />
          </svg>
        )}
      </button>

      {/* Panel overlay */}
      {isOpen && (
        <div className="fixed bottom-20 right-4 z-50 w-80 max-h-[70vh] overflow-y-auto bg-surface border border-edge rounded-lg shadow-xl p-4">
          <h2 className="text-lg font-bold text-highlight-text mb-4">Admin Panel</h2>

          {isPreDraft && (
            <PreDraftPanel
              registeredUsers={registeredUsers}
              connectedUsers={connectedUsers}
              sendMessage={sendMessage}
            />
          )}

          {isActive && (
            <ActiveDraftPanel
              draftStatus={draftStatus}
              currentTurn={currentTurn}
              registeredUsers={registeredUsers}
              sendMessage={sendMessage}
            />
          )}

          {draftStatus === 'completed' && (
            <p className="text-content-tertiary text-sm">Draft is complete. No actions available.</p>
          )}
        </div>
      )}
    </>
  );
}

// --- Pre-draft panel ---

function PreDraftPanel({
  registeredUsers,
  connectedUsers,
  sendMessage,
}: {
  registeredUsers: User[];
  connectedUsers: User[];
  sendMessage: (msg: ClientMessage) => void;
}) {
  const [orderedUsers, setOrderedUsers] = useState<User[]>(registeredUsers);
  const [totalRounds, setTotalRounds] = useState(6);
  const [timerDuration, setTimerDuration] = useState(60);
  const [starting, setStarting] = useState(false);

  // Keep orderedUsers in sync when new users register
  // (only add new ones to the end, don't reorder existing)
  const orderedIDs = new Set(orderedUsers.map((u) => u.id));
  const newUsers = registeredUsers.filter((u) => !orderedIDs.has(u.id));
  if (newUsers.length > 0) {
    setOrderedUsers((prev) => [...prev, ...newUsers]);
  }

  const userID = useLocalStore((s) => s.userID);
  const connectedIDs = useMemo(() => {
    const ids = new Set(connectedUsers.map((u) => u.id));
    if (userID != null) ids.add(userID);
    return ids;
  }, [connectedUsers, userID]);

  function moveUser(index: number, direction: -1 | 1) {
    const target = index + direction;
    if (target < 0 || target >= orderedUsers.length) return;
    const next = [...orderedUsers];
    [next[index], next[target]] = [next[target], next[index]];
    setOrderedUsers(next);
  }

  async function handleStartDraft() {
    setStarting(true);
    const eventID = useLocalStore.getState().eventID ?? 0;
    try {
      await createDraftRoom(eventID);
    } catch (err) {
      console.error('Failed to create draft room:', err);
      setStarting(false);
      return;
    }
    const availablePlayers = usePlayerStore.getState().eventPlayers.map((p) => p.id);
    sendMessage({
      type: 'start_draft',
      eventID,
      pickOrder: orderedUsers.map((u) => u.id),
      totalRounds,
      timerDuration,
      availablePlayers,
    });
  }

  return (
    <div className="space-y-4">
      {/* Pick order */}
      <div>
        <h3 className="text-sm font-semibold text-content-secondary mb-2">Pick Order</h3>
        <div className="space-y-1">
          {orderedUsers.map((user, i) => {
            const isConnected = connectedIDs.has(user.id);
            return (
              <div
                key={user.id}
                className={`flex items-center gap-2 px-2 py-1.5 rounded text-sm ${
                  isConnected ? 'bg-surface-input text-content-primary' : 'bg-surface text-content-muted'
                }`}
              >
                <span className="w-5 text-content-tertiary text-xs">{i + 1}.</span>
                <span className="flex-1 truncate">{user.username}</span>
                {!isConnected && (
                  <span className="text-[10px] text-content-muted">offline</span>
                )}
                <button
                  onClick={() => moveUser(i, -1)}
                  disabled={i === 0}
                  className="px-1 text-content-tertiary hover:text-content-primary disabled:opacity-30"
                  aria-label={`Move ${user.username} up`}
                >
                  &uarr;
                </button>
                <button
                  onClick={() => moveUser(i, 1)}
                  disabled={i === orderedUsers.length - 1}
                  className="px-1 text-content-tertiary hover:text-content-primary disabled:opacity-30"
                  aria-label={`Move ${user.username} down`}
                >
                  &darr;
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Settings */}
      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-content-secondary mb-1">Settings</h3>
        <label className="flex items-center justify-between text-sm">
          <span className="text-content-secondary">Total Rounds</span>
          <input
            type="number"
            min={1}
            value={totalRounds}
            onChange={(e) => setTotalRounds(Number(e.target.value))}
            className="w-16 px-2 py-1 bg-surface-input border border-edge-input rounded text-sm text-content-primary text-right"
          />
        </label>
        <label className="flex items-center justify-between text-sm">
          <span className="text-content-secondary">Timer (seconds)</span>
          <input
            type="number"
            min={10}
            value={timerDuration}
            onChange={(e) => setTimerDuration(Number(e.target.value))}
            className="w-16 px-2 py-1 bg-surface-input border border-edge-input rounded text-sm text-content-primary text-right"
          />
        </label>
      </div>

      {/* Start button */}
      <button
        onClick={handleStartDraft}
        disabled={starting || orderedUsers.length === 0}
        className="w-full py-2 bg-accent hover:bg-accent-bright disabled:opacity-50 text-white font-semibold rounded transition-colors"
      >
        {starting ? 'Starting...' : 'Start Draft'}
      </button>
    </div>
  );
}

// --- Active draft panel ---

function ActiveDraftPanel({
  draftStatus,
  currentTurn,
  registeredUsers,
  sendMessage,
}: {
  draftStatus: string;
  currentTurn: number | null;
  registeredUsers: User[];
  sendMessage: (msg: ClientMessage) => void;
}) {
  const isPaused = draftStatus === 'paused';
  const currentUser = registeredUsers.find((u) => u.id === currentTurn);

  function handleTogglePause() {
    if (isPaused) {
      sendMessage({ type: 'resume_draft' });
    } else {
      sendMessage({ type: 'pause_draft' });
    }
  }

  function handleAutopick() {
    const result = buildAutopickMessage();
    if (!result) return;
    sendMessage(result.message);
  }

  return (
    <div className="space-y-3">
      {currentUser && (
        <p className="text-sm text-content-secondary">
          On the clock: <span className="font-semibold text-highlight-text">{currentUser.username}</span>
        </p>
      )}

      <button
        onClick={handleTogglePause}
        className={`w-full py-2 font-semibold rounded transition-colors text-white ${
          isPaused
            ? 'bg-green-600 hover:bg-green-500'
            : 'bg-yellow-600 hover:bg-yellow-500'
        }`}
      >
        {isPaused ? 'Resume Draft' : 'Pause Draft'}
      </button>

      <button
        onClick={handleAutopick}
        disabled={isPaused}
        className="w-full py-2 bg-accent hover:bg-accent-bright disabled:opacity-50 text-white font-semibold rounded transition-colors"
      >
        Autopick
      </button>
    </div>
  );
}
