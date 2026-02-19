import { useMemo } from 'react';
import { useDraftStore } from '../store/draftStore';
import { useLocalStore } from '../store/localStore';
import { usePlayerStore } from '../store/playerStore';

export function TeamRoster() {
  const userID = useLocalStore((s) => s.userID);
  const registeredUsers = useDraftStore((s) => s.registeredUsers);
  const pickHistory = useDraftStore((s) => s.pickHistory);
  const eventPlayers = usePlayerStore((s) => s.eventPlayers);

  const username = registeredUsers.find((u) => u.id === userID)?.username;

  const picks = useMemo(() => {
    if (!userID) return [];

    const playerMap = new Map(eventPlayers.map((p) => [p.id, p]));

    return pickHistory
      .filter((pick) => pick.userID === userID)
      .sort((a, b) => a.pickNumber - b.pickNumber)
      .map((pick) => ({
        ...pick,
        player: playerMap.get(pick.playerID),
      }));
  }, [userID, pickHistory, eventPlayers]);

  return (
    <div>
      <h2 className="font-semibold mb-3">Your Team</h2>

      {/* Team header card */}
      <div className="bg-green-700 rounded-lg p-4 mb-4 flex justify-between items-end">
        <div>
          <div className="font-bold text-lg">{username ?? 'Unknown'}</div>
        </div>
        <div className="text-right">
          <div className="text-2xl font-bold">{picks.length}</div>
          <div className="text-green-200 text-xs">
            {picks.length === 1 ? 'golfer' : 'golfers'}
          </div>
        </div>
      </div>

      {/* Roster list */}
      {picks.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No picks yet</p>
      ) : (
        <div className="space-y-3 overflow-y-auto">
          {picks.map((pick) => (
            <div
              key={pick.pickNumber}
              className="flex items-start gap-3 px-2 py-2"
            >
              <span className="text-gray-500 text-sm font-medium w-5 text-right shrink-0">
                {pick.pickNumber}
              </span>
              <div className="min-w-0">
                <div className="font-medium flex items-center gap-2">
                  {pick.player
                    ? `${pick.player.firstName} ${pick.player.lastName}`
                    : `Player ${pick.playerID}`}
                  {pick.autoDraft && (
                    <span className="text-yellow-500 text-xs">(auto)</span>
                  )}
                </div>
                <div className="text-gray-400 text-xs">
                  {pick.player?.countryCode}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
