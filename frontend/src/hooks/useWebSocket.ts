import { useCallback, useEffect, useRef } from 'react';
import { useDraftStore } from '../store/draftStore';
import type { ClientMessage, ServerMessage } from '../types';

const WS_BASE_URL = 'ws://localhost:8080/ws/draft';

export function useWebSocket(userID: number | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const setConnectionStatus = useDraftStore((s) => s.setConnectionStatus);
  const handleServerMessage = useDraftStore((s) => s.handleServerMessage);

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    if (userID == null) {
      console.error('Cannot connect WebSocket: userID is not set');
      return;
    }

    setConnectionStatus('connecting');
    const registeredUsers = useDraftStore.getState().registeredUsers;
    const username = registeredUsers.find((u) => u.id === userID)?.username;
    const params = new URLSearchParams({ userID: String(userID) });
    if (username) params.set('username', username);
    const ws = new WebSocket(`${WS_BASE_URL}?${params}`);

    ws.onopen = () => {
      setConnectionStatus('connected');
    };

    ws.onclose = () => {
      setConnectionStatus('disconnected');
      wsRef.current = null;
    };

    ws.onerror = () => {
      setConnectionStatus('disconnected');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as ServerMessage;
        handleServerMessage(message);
      } catch (err) {
        console.error('Failed to parse WebSocket message:', err);
      }
    };

    wsRef.current = ws;
  }, [userID, setConnectionStatus, handleServerMessage]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, []);

  const sendMessage = useCallback((message: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  useEffect(() => {
    return () => {
      disconnect();
    };
  }, [disconnect]);

  return { connect, disconnect, sendMessage };
}
