import { useCallback, useEffect, useRef, useState } from "react";
import { useDraftStore } from "../store/draftStore";
import { useLocalStore } from "../store/localStore";

export function DraftOrder() {
  const myUserID = useLocalStore((s) => s.userID);
  const currentTurn = useDraftStore((s) => s.currentTurn);
  const pickOrder = useDraftStore((s) => s.pickOrder);

  const connectedUsers = useDraftStore((s) => s.connectedUsers);
  const registeredUsers = useDraftStore((s) => s.registeredUsers);

  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLDivElement>(null);

  const [isScrollable, setIsScrollable] = useState(false);

  const checkScrollable = useCallback(() => {
    if (scrollRef.current) {
      setIsScrollable(scrollRef.current.scrollWidth > scrollRef.current.clientWidth);
    }
  }, []);

  // Auto-scroll to center the active drafter when the turn changes
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const active = activeRef.current;
      const scrollLeft =
        active.offsetLeft - container.offsetWidth / 2 + active.offsetWidth / 2;
      container.scrollTo({ left: scrollLeft, behavior: "smooth" });
    }
    checkScrollable();
  }, [currentTurn, checkScrollable]);

  // Recheck on resize
  useEffect(() => {
    window.addEventListener("resize", checkScrollable);
    return () => window.removeEventListener("resize", checkScrollable);
  }, [checkScrollable]);

  function scrollBy(direction: number) {
    scrollRef.current?.scrollBy({ left: direction * 200, behavior: "smooth" });
  }

  const upcomingPicks = pickOrder;

  return (
    <div className="flex items-center gap-1">
      {isScrollable && (
        <button
          onClick={() => scrollBy(-1)}
          className="shrink-0 p-1 text-content-tertiary hover:text-content-primary"
          aria-label="Scroll left"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      )}

      <div
        ref={scrollRef}
        className="flex gap-2 overflow-x-hidden scroll-smooth"
      >
        {upcomingPicks.map((userID) => {
          const user = registeredUsers.find((u) => u.id === userID);
          const isConnected =
            userID === myUserID ||
            connectedUsers.some((u) => u.id === userID);
          const isCurrent = currentTurn === userID;

          return (
            <div
              key={userID}
              ref={isCurrent ? activeRef : undefined}
              className={`flex-shrink-0 px-2 md:px-3 py-2 rounded text-center border transition-colors min-w-[60px] md:min-w-[72px] ${
                isCurrent
                  ? isConnected
                    ? "bg-accent border-accent-bright"
                    : "bg-surface border-accent-bright"
                  : "bg-surface border-edge"
              }`}
            >
              <div
                className={`text-sm font-medium ${
                  isConnected
                    ? isCurrent
                      ? "text-content-primary"
                      : "text-content-secondary"
                    : "text-content-disabled"
                }`}
              >
                {user?.username ?? `User ${userID}`}
              </div>
            </div>
          );
        })}
      </div>

      {isScrollable && (
        <button
          onClick={() => scrollBy(1)}
          className="shrink-0 p-1 text-content-tertiary hover:text-content-primary"
          aria-label="Scroll right"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
          </svg>
        </button>
      )}
    </div>
  );
}
