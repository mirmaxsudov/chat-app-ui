import { create } from 'zustand';
import type { Chat, UserPresence } from '../model/chat.types';

export type RealtimeConnectionStatus = 'connecting' | 'connected' | 'reconnecting';
export type PresenceState = Record<string, UserPresence>;

export const isPresenceNewerOrEqual = (
  current: UserPresence | undefined,
  incoming: UserPresence
) => {
  if (!current?.changedAt) return true;
  if (!incoming.changedAt) return false;
  return Date.parse(incoming.changedAt) >= Date.parse(current.changedAt);
};

export const applyPresence = (state: PresenceState, incoming: UserPresence): PresenceState => {
  if (!isPresenceNewerOrEqual(state[incoming.userId], incoming)) return state;
  const current = state[incoming.userId];
  if (
    current?.status === incoming.status &&
    current.lastSeenAt === incoming.lastSeenAt &&
    current.changedAt === incoming.changedAt
  )
    return state;
  return { ...state, [incoming.userId]: incoming };
};

interface PresenceStore {
  byUserId: PresenceState;
  connectionStatus: RealtimeConnectionStatus;
  receive: (presence: UserPresence) => void;
  receiveChats: (chats: Chat[]) => void;
  reset: () => void;
  setConnectionStatus: (status: RealtimeConnectionStatus) => void;
}

export const usePresenceStore = create<PresenceStore>((set) => ({
  byUserId: {},
  connectionStatus: 'connecting',
  receive: (presence) =>
    set((state) => {
      const byUserId = applyPresence(state.byUserId, presence);
      return byUserId === state.byUserId ? state : { byUserId };
    }),
  receiveChats: (chats) =>
    set((state) => {
      let byUserId = state.byUserId;
      for (const chat of chats) {
        if (chat.peerPresence) byUserId = applyPresence(byUserId, chat.peerPresence);
      }
      return byUserId === state.byUserId ? state : { byUserId };
    }),
  reset: () => set({ byUserId: {}, connectionStatus: 'connecting' }),
  setConnectionStatus: (connectionStatus) => set({ connectionStatus })
}));

export const presenceStore = usePresenceStore.getState;
