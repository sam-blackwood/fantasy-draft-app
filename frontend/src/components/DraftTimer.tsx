import { useEffect, useState } from 'react';
import { useDraftStore } from '../store/draftStore';

export function DraftTimer() {
  const draftStatus = useDraftStore((s) => s.draftStatus);
  const turnDeadline = useDraftStore((s) => s.turnDeadline);
  const remainingTime = useDraftStore((s) => s.remainingTime);

  const [secondsLeft, setSecondsLeft] = useState<number | null>(null);

  useEffect(() => {
    if (draftStatus === 'paused') {
      setSecondsLeft(Math.floor(remainingTime));
      return;
    }

    if (draftStatus !== 'in_progress' || !turnDeadline) {
      setSecondsLeft(null);
      return;
    }

    function tick() {
      const now = Date.now() / 1000;
      const remaining = Math.max(0, Math.ceil(turnDeadline! - now));
      setSecondsLeft(remaining);
    }

    tick();
    const interval = setInterval(tick, 100);
    return () => clearInterval(interval);
  }, [draftStatus, turnDeadline, remainingTime]);

  if (draftStatus === 'idle' || draftStatus === 'completed' || secondsLeft === null) {
    return null;
  }

  const isPaused = draftStatus === 'paused';
  const mins = Math.floor(secondsLeft / 60);
  const secs = secondsLeft % 60;
  const display = `${mins}:${secs.toString().padStart(2, '0')}`;

  const colorClass =
    isPaused ? 'text-gray-400'
    : secondsLeft <= 10 ? 'text-red-500'
    : 'text-green-500';

  return (
    <div className="text-center">
      <div className={`text-2xl font-bold font-mono ${colorClass}`}>
        {display}
      </div>
      {isPaused && (
        <div className="text-sm text-gray-400 mt-1">PAUSED</div>
      )}
    </div>
  );
}
