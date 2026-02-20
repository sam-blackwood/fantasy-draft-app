import { useCallback, useEffect, useRef } from 'react';
import { useDraftStore } from '../store/draftStore';
import type { ClientMessage, ServerMessage } from '../types';

const WS_BASE_URL = 'ws://localhost:8080/ws/draft';
const RECONNECT_BASE_DELAY = 1000; // 1 second
const RECONNECT_MAX_DELAY = 30000; // 30 seconds

function getBackoffDelay(attempt: number): number {
  return Math.min(RECONNECT_BASE_DELAY * Math.pow(2, attempt), RECONNECT_MAX_DELAY);
}

export function useWebSocket(userID: number | null) {
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const intentionalDisconnectRef = useRef(false);
  const reconnectAttemptRef = useRef(0);

  const setConnectionStatus = useDraftStore((s) => s.setConnectionStatus);
  const setReconnectAttempt = useDraftStore((s) => s.setReconnectAttempt);
  const handleServerMessage = useDraftStore((s) => s.handleServerMessage);

  // Use a ref so connect's onclose can call the latest version without circular deps
  const scheduleReconnectRef = useRef<() => void>(() => {});

  const connect = useCallback(() => {
    if (
      wsRef.current?.readyState === WebSocket.OPEN ||
      wsRef.current?.readyState === WebSocket.CONNECTING
    ) {
      return;
    }

    if (userID == null) {
      console.error('Cannot connect WebSocket: userID is not set');
      return;
    }

    // Clear any pending reconnect timer
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    setConnectionStatus('connecting');
    const registeredUsers = useDraftStore.getState().registeredUsers;
    const username = registeredUsers.find((u) => u.id === userID)?.username;
    const params = new URLSearchParams({ userID: String(userID) });
    if (username) params.set('username', username);
    const ws = new WebSocket(`${WS_BASE_URL}?${params}`);

    ws.onopen = () => {
      setConnectionStatus('connected');
      reconnectAttemptRef.current = 0;
      setReconnectAttempt(0);
    };

    ws.onclose = () => {
      wsRef.current = null;

      if (intentionalDisconnectRef.current) {
        setConnectionStatus('disconnected');
        return;
      }

      // Unexpected disconnect — trigger reconnection
      setConnectionStatus('disconnected');
      scheduleReconnectRef.current();
    };

    ws.onerror = () => {
      // onerror is always followed by onclose per the WebSocket spec,
      // so we only log here and let onclose handle state + reconnection.
      console.error('WebSocket error occurred');
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
  }, [userID, setConnectionStatus, setReconnectAttempt, handleServerMessage]);

  // Keep scheduleReconnectRef up to date with latest closure
  useEffect(() => {
    scheduleReconnectRef.current = () => {
      if (intentionalDisconnectRef.current || userID == null) {
        return;
      }

      const attempt = reconnectAttemptRef.current;
      const delay = getBackoffDelay(attempt);
      console.log(`Scheduling reconnect attempt ${attempt + 1} in ${delay}ms`);

      reconnectTimerRef.current = setTimeout(() => {
        reconnectAttemptRef.current = attempt + 1;
        setReconnectAttempt(attempt + 1);
        connect();
      }, delay);
    };
  }, [userID, connect, setReconnectAttempt]);

  const disconnect = useCallback(() => {
    intentionalDisconnectRef.current = true;

    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    reconnectAttemptRef.current = 0;
    setReconnectAttempt(0);

    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
  }, [setReconnectAttempt]);

  const reconnectNow = useCallback(() => {
    if (reconnectTimerRef.current) {
      clearTimeout(reconnectTimerRef.current);
      reconnectTimerRef.current = null;
    }

    intentionalDisconnectRef.current = false;
    reconnectAttemptRef.current += 1;
    setReconnectAttempt(reconnectAttemptRef.current);
    connect();
  }, [connect, setReconnectAttempt]);

  const sendMessage = useCallback((message: ClientMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.error('WebSocket is not connected');
    }
  }, []);

  // Reset intentional flag on mount so initial connect() works
  useEffect(() => {
    intentionalDisconnectRef.current = false;
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      intentionalDisconnectRef.current = true;
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []);

  return { connect, disconnect, sendMessage, reconnectNow };
}
