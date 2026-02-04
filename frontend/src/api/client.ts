import type { Event, Player, User } from '../types';

const API_BASE = 'http://localhost:8080';

async function fetchJSON<T>(url: string): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}: ${response.statusText}`);
  }
  return response.json();
}

export async function getEvents(): Promise<Event[]> {
  return fetchJSON<Event[]>('/events');
}

export async function getEvent(id: number): Promise<Event> {
  return fetchJSON<Event>(`/events/${id}`);
}

export async function getPlayers(): Promise<Player[]> {
  return fetchJSON<Player[]>('/players');
}

export async function getPlayer(id: number): Promise<Player> {
  return fetchJSON<Player>(`/players/${id}`);
}

export async function getUsers(): Promise<User[]> {
  return fetchJSON<User[]>('/users');
}

export async function getUser(id: number): Promise<User> {
  return fetchJSON<User>(`/users/${id}`);
}
