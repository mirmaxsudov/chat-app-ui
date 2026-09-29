type ChatType = 'SAVED' | 'DIRECT' | 'GROUP' | 'CHANNEL';
type PresenceStatus = 'ONLINE' | 'OFFLINE';

interface UserPresence {
  userId: string;
  status: PresenceStatus;
  lastSeenAt: string | null;
  changedAt: string | null;
}

interface ChatPeer {
  id: string;
  username: string | null;
  firstname: string | null;
  lastname: string | null;
}

interface Chat {
  id: string;
  type: ChatType;
  peer: ChatPeer;
  peerPresence: UserPresence | null;
  lastMessage: ChatLastMessage | null;
  createdAt: string;
  updatedAt: string;
}

interface ChatSummary {
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
