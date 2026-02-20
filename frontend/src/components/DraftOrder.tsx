import { useEffect, useRef } from "react";
import { useDraftStore } from "../store/draftStore";
import { useLocalStore } from "../store/localStore";

export function DraftOrder() {
  const myUserID = useLocalStore((s) => s.userID);
  const currentTurn = useDraftStore((s) => s.currentTurn);
  const pickOrder = useDraftStore((s) => s.pickOrder);
  const currentPickIndex = useDraftStore((s) => s.currentPickIndex);
  const connectedUsers = useDraftStore((s) => s.connectedUsers);
  const registeredUsers = useDraftStore((s) => s.registeredUsers);

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to center the active drafter when the turn changes
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const active = activeRef.current;
      const scrollLeft =
        active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
  }, [currentTurn]);

  function scrollBy(direction: number) {
    scrollRef.current?.scrollBy({ left: direction * 200, behavior: "smooth" });
  }

  // Build the upcoming picks starting from currentPickIndex
  const upcomingPicks = pickOrder.map((userID, i) => {
    // For each slot in pickOrder, figure out which overall pick number
    // corresponds to the next time this slot drafts
    // We show the current round's pick assignments
    const pickNumber = currentPickIndex + i + 1;
    return { userID, pickNumber };
  });

  return (
    <div className="flex items-center gap-1">
      <button
        onClick={() => scrollBy(-1)}
        className="shrink-0 p-1 text-gray-400 hover:text-white"
        aria-label="Scroll left"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
      </button>

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-hidden scroll-smooth"
      >
        {upcomingPicks.map(({ userID, pickNumber }) => {
          const user = registeredUsers.find((u) => u.id === userID);
          const isConnected =
            userID === myUserID ||
            connectedUsers.some((u) => u.id === userID);
          const isCurrent = currentTurn === userID;

          return (
            <div
              key={userID}
              ref={isCurrent ? activeRef : undefined}
              className={`flex-shrink-0 px-3 py-2 rounded text-center border transition-colors min-w-[72px] ${
                isCurrent
                  ? isConnected
                    ? "bg-blue-600 border-blue-400"
                    : "bg-gray-800 border-blue-400"
                  : "bg-gray-800 border-gray-700"
              }`}
            >
              <div
                className={`text-xs ${
                  isCurrent ? "text-blue-200" : "text-gray-500"
                }`}
              >
                Pick {pickNumber}
              </div>
              <div
                className={`text-sm font-medium ${
                  isConnected
                    ? isCurrent
                      ? "text-white"
                      : "text-gray-300"
                    : "text-gray-600"
                }`}
              >
                {user?.username ?? `User ${userID}`}
              </div>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => scrollBy(1)}
        className="shrink-0 p-1 text-gray-400 hover:text-white"
        aria-label="Scroll right"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}
