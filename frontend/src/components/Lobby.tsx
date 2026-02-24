import type { User } from '../types';

interface LobbyProps {
  registeredUsers: User[];
  connectedUsers: User[];
  userID: number | null;
}

export function Lobby({ registeredUsers, connectedUsers, userID }: LobbyProps) {
  const onlineCount = registeredUsers.filter((u) => {
    return u.id === userID || connectedUsers.some((c) => c.id === u.id);
  }).length;

  return (
    <div className="mb-4 p-4 bg-surface rounded">
      <div className="flex items-center justify-between mb-3">
        <h2 className="font-semibold">Lobby</h2>
        <span className="text-xs text-content-tertiary">
          {onlineCount}/{registeredUsers.length} online
        </span>
      </div>

      <div className="grid grid-cols-6 gap-2">
        {registeredUsers.map((user) => {
          const isMe = user.id === userID;
          const isConnected = isMe || connectedUsers.some((u) => u.id === user.id);

          return (
            <div
              key={user.id}
              className={`
                relative flex flex-col items-center gap-1 px-2 py-2 rounded border transition-colors
                ${isMe
                  ? 'bg-highlight border-accent-bright'
                  : isConnected
                    ? 'bg-surface-input border-edge'
                    : 'bg-surface border-edge opacity-60'
                }
              `}
            >
              {/* Status dot */}
              <span
                className={`
                  absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full
                  ${isConnected ? 'bg-accent-bright' : 'bg-content-muted'}
                `}
              />

              {/* Avatar circle */}
              <div
                className={`
                  flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold
                  ${isMe
                    ? 'bg-accent text-content-primary'
                    : isConnected
                      ? 'bg-surface-hover text-content-secondary'
                      : 'bg-surface-hover text-content-disabled'
                  }
                `}
              >
                {user.username.charAt(0).toUpperCase()}
              </div>

              {/* Username */}
              <span
                className={`
                  text-xs font-medium truncate max-w-full text-center
                  ${isConnected ? 'text-content-primary' : 'text-content-muted'}
                `}
              >
                {user.username}
              </span>

              {/* Status label */}
              <span
                className={`
                  text-[10px]
                  ${isMe
                    ? 'text-accent-bright'
                    : isConnected
                      ? 'text-accent'
                      : 'text-content-muted'
                  }
                `}
              >
                {isMe ? 'You' : isConnected ? 'Active' : 'Inactive'}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
