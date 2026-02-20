import { useMemo } from 'react';
import { useDraftStore } from '../store/draftStore';
import { usePlayerStore } from '../store/playerStore';

export function DraftResults() {
  const pickHistory = useDraftStore((s) => s.pickHistory);
  const pickOrder = useDraftStore((s) => s.pickOrder);
  const registeredUsers = useDraftStore((s) => s.registeredUsers);
  const eventPlayers = usePlayerStore((s) => s.eventPlayers);
  const numTeams = pickOrder.length;

  const picks = useMemo(() => {
    const playerMap = new Map(eventPlayers.map((p) => [p.id, p]));
    const userMap = new Map(registeredUsers.map((u) => [u.id, u]));

    return [...pickHistory].reverse().map((pick) => ({
      ...pick,
      player: playerMap.get(pick.playerID),
      user: userMap.get(pick.userID),
    }));
  }, [pickHistory, eventPlayers, registeredUsers]);

  return (
    <div>
      <h2 className="font-semibold mb-2">Previous Picks</h2>
      <p className="text-gray-400 text-xs mb-3">
        {picks.length} {picks.length === 1 ? 'pick' : 'picks'} made
      </p>
      {picks.length === 0 ? (
        <p className="text-gray-500 text-sm text-center py-4">No picks yet</p>
      ) : (
        <div className="space-y-2 text-sm">
          {picks.map((pick) => (
            <div key={pick.pickNumber} className="flex items-start gap-2">
              <span className="text-gray-500 font-mono text-[10px] w-10 text-right shrink-0 pt-1">
                R{pick.round}P{numTeams > 0 ? ((pick.pickNumber - 1) % numTeams) + 1 : pick.pickNumber}
              </span>
              <div className="min-w-0">
                <div>
                  {pick.player
                    ? `${pick.player.firstName} ${pick.player.lastName}`
                    : `Player ${pick.playerID}`}
                </div>
                <div className="text-xs text-gray-400">
                  {pick.user?.username ?? `User ${pick.userID}`}
                  {pick.autoDraft && (
                    <span className="text-yellow-500 ml-1">(auto)</span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
