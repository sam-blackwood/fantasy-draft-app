import { useDraftStore } from "../store/draftStore";
import { useLocalStore } from "../store/localStore";

export function DraftOrder() {
  const myUserID = useLocalStore((s) => s.userID);
  const currentTurn = useDraftStore((s) => s.currentTurn);
  const pickOrder = useDraftStore((s) => s.pickOrder);
  const connectedUsers = useDraftStore((s) => s.connectedUsers);
  const registeredUsers = useDraftStore((s) => s.registeredUsers);

  return (
    <div className="flex gap-2 overflow-x-auto pb-2">
      {pickOrder.map((userID) => {
        const user = registeredUsers.find((u) => u.id === userID);
        const isConnected = userID === myUserID || connectedUsers.some((u) => u.id === userID);
        const isCurrent = currentTurn === userID;

        return (
          <div
            key={userID}
            className={`flex-shrink-0 px-3 py-2 rounded text-sm font-medium border ${
              isCurrent
                ? "bg-blue-600 border-blue-400 text-white"
                : "bg-gray-800 border-gray-700 text-gray-300"
            }`}
          >
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full ${
                  isConnected ? "bg-green-500" : "bg-gray-500"
                }`}
              />
              <span>{user?.username ?? `User ${userID}`}</span>
            </div>
          </div>
        );
      })}
    </div>
  );
}