import type { UserPresence } from '../model/chat.types';

export const presenceLabel = (presence: UserPresence | null): string | null => {
  if (!presence) return null;
  if (presence.status === 'ONLINE') return 'online';
  if (!presence.lastSeenAt) return 'offline';
  const lastSeen = new Date(presence.lastSeenAt);
  if (Number.isNaN(lastSeen.getTime())) return 'offline';
  return `last seen ${lastSeen.toLocaleString([], {
    dateStyle: 'medium',
    timeStyle: 'short'
  })}`;
};
