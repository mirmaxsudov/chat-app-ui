type ChatType = 'CHANNEL' | 'DIRECT' | 'GROUP' | 'SAVED';
type PresenceStatus = 'OFFLINE' | 'ONLINE';

interface UserPresence {
  changedAt: string | null;
  lastSeenAt: string | null;
  status: PresenceStatus;
  userId: string;
}

interface ChatPeer {
  firstname: string | null;
  id: string;
  lastname: string | null;
  username: string | null;
}

interface Chat {
  createdAt: string;
  id: string;
  lastMessage: ChatLastMessage | null;
  peer: ChatPeer;
  peerPresence: UserPresence | null;
  type: ChatType;
  updatedAt: string;
}

interface ChatSummary {
  color: string;
  createdAt: string;
  id: string;
  initials: string;
  message: string;
  name: string;
  presence: UserPresence | null;
  status: string;
  time: string;
  username: string | null;
}
