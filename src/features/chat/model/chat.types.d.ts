import type { ChatLastMessage } from './message.types';

export type ChatType = 'SAVED' | 'DIRECT' | 'GROUP' | 'CHANNEL';

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
  username: string | null;
  createdAt: string;
}
