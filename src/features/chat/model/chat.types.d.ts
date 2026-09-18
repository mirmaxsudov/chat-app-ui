import type { ChatLastMessage } from './message.types';

export type ChatType = 'SAVED' | 'DIRECT' | 'GROUP' | 'CHANNEL';
export type PresenceStatus = 'ONLINE' | 'OFFLINE';

export interface UserPresence {
  userId: string;
  status: PresenceStatus;
  lastSeenAt: string | null;
  changedAt: string | null;
}

export interface ChatPeer {
  id: string;
  username: string | null;
  firstname: string | null;
  lastname: string | null;
}

export interface Chat {
  id: string;
  type: ChatType;
  peer: ChatPeer;
  peerPresence: UserPresence | null;
  lastMessage: ChatLastMessage | null;
  createdAt: string;
  updatedAt: string;
}

// Presentation fields derived exclusively from the API response.
export interface ChatSummary {
  id: string;
  name: string;
  initials: string;
  color: string;
  message: string;
  time: string;
  status: string;
  presence: UserPresence | null;
  username: string | null;
  createdAt: string;
}
