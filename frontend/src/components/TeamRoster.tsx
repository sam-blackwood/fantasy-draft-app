import { useMemo } from 'react';
import { useDraftStore } from '../store/draftStore';
import { useLocalStore } from '../store/localStore';
import { usePlayerStore } from '../store/playerStore';

interface TeamRosterProps {
  viewUserID?: number | null;
}

export function TeamRoster({ viewUserID }: TeamRosterProps) {
  const myUserID = useLocalStore((s) => s.userID);
  const pickHistory = useDraftStore((s) => s.pickHistory);
  const eventPlayers = usePlayerStore((s) => s.eventPlayers);

  const userID = viewUserID ?? myUserID;

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
