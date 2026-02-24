import { useEffect, useState } from 'react';
import { getNextEvent } from '../api/client';
import type { Event } from '../types';

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function calculateTimeRemaining(eventDate: string): TimeRemaining | null {
  const diff = new Date(eventDate).getTime() - Date.now();
  if (diff <= 0) return null;

  return {
    days: Math.floor(diff / (1000 * 60 * 60 * 24)),
    hours: Math.floor((diff / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((diff / (1000 * 60)) % 60),
    seconds: Math.floor((diff / 1000) % 60),
  };
}

export function CountdownPage() {
  const [event, setEvent] = useState<Event | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRemaining, setTimeRemaining] = useState<TimeRemaining | null>(null);

  useEffect(() => {
    getNextEvent()
      .then((evt) => {
        setEvent(evt);
        if (evt?.eventDate) {
          setTimeRemaining(calculateTimeRemaining(evt.eventDate));
        }
      })
      .catch(() => setEvent(null))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!event?.eventDate) return;

    const interval = setInterval(() => {
      const remaining = calculateTimeRemaining(event.eventDate!);
      setTimeRemaining(remaining);
      if (!remaining) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [event]);

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <p className="text-content-tertiary">Loading...</p>
      </div>
    );
  }

  if (!event || !event.eventDate) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl md:text-5xl font-bold mb-4 text-highlight-text">
            Fantasy Draft
          </h1>
          <p className="text-content-secondary text-lg">
            Next event TBD
          </p>
        </div>
      </div>
    );
  }

  if (!timeRemaining) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center">
          <p className="text-accent-bright text-xl font-semibold">
            The event is starting now!
          </p>
        </div>
      </div>
    );
  }

  const segments = [
    { value: timeRemaining.days, label: 'Days', shortLabel: 'Day' },
    { value: timeRemaining.hours, label: 'Hours', shortLabel: 'Hr' },
    { value: timeRemaining.minutes, label: 'Minutes', shortLabel: 'Min' },
    { value: timeRemaining.seconds, label: 'Seconds', shortLabel: 'Sec' },
  ];

  return (
    <div className="flex-1 w-full flex flex-col items-center justify-center px-6">
      <h1 className="text-2xl md:text-4xl font-bold text-accent-bright mb-8 md:mb-12">
        clubhousedraft.com
      </h1>
      <p className="text-content-tertiary text-sm mb-4 uppercase tracking-wider">
        Next event starts in
      </p>
      <div className="flex gap-2 md:gap-6">
        {segments.map(({ value, label, shortLabel }) => (
          <div key={label} className="flex flex-col items-center gap-1 md:gap-2">
            <div className="w-16 h-16 md:w-28 md:h-28 bg-surface-hover rounded-lg border border-edge flex items-center justify-center">
              <span className="text-2xl md:text-7xl font-mono font-bold text-accent-bright tabular-nums">
                {String(value).padStart(2, '0')}
              </span>
            </div>
            <span className="text-content-tertiary text-[0.625rem] md:text-xs uppercase tracking-wider">
              <span className="md:hidden">{shortLabel}</span>
              <span className="hidden md:inline">{label}</span>
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
