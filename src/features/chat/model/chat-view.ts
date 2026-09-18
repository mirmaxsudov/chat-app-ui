import type { Chat, UserPresence } from './chat.types';
import type { ChatMessage } from '../../message/model/message.types';
import type { ApiMessagesResponse } from '../../message/model/message.response.types';

const colors = ['bg-[#cf6f61]', 'bg-[#447fb2]', 'bg-[#775da6]', 'bg-[#329482]', 'bg-[#d28a3c]'];

export const formatMessageTime = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

export const formatMessageDate = (value: string) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? 'Unknown date'
    : date.toLocaleDateString([], {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      });
};

export const toChatSummary = (chat: Chat, presence: UserPresence | null = chat.peerPresence) => {
  const peerName = [chat.peer?.firstname, chat.peer?.lastname].filter(Boolean).join(' ').trim();
  const name =
    chat.type === 'SAVED'
      ? 'Saved Messages'
      : peerName ||
        chat.peer?.username ||
        (chat.type === 'DIRECT'
          ? 'Unnamed user'
          : chat.type === 'GROUP'
            ? 'Group chat'
            : 'Channel');

  const hash = [...chat.id].reduce((total, char) => total + char.charCodeAt(0), 0);
  const timestamp = chat.lastMessage?.createdAt ?? chat.updatedAt;
  const date = new Date(timestamp);
  const lastMessageContent = chat.lastMessage
    ? chat.lastMessage.text ||
      (chat.lastMessage.attachments?.some(
        ({ attachment }) =>
          attachment.type === 'IMAGE' || attachment.contentType.startsWith('image/')
      )
        ? 'Photo'
        : chat.lastMessage.attachments?.length
          ? 'Attachment'
          : '')
    : '';
  return {
    id: chat.id,
    name,
    initials: name
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join('')
      .toUpperCase(),
    color: colors[hash % colors.length],
    message: chat.lastMessage
      ? (chat.lastMessage.mine ? 'You: ' : '') + lastMessageContent
      : 'No messages yet',
    time: Number.isNaN(date.getTime())
      ? ''
      : date.toDateString() === new Date().toDateString()
        ? formatMessageTime(timestamp)
        : date.toLocaleDateString([], { month: 'short', day: 'numeric' }),
    status: {
      SAVED: 'Personal notes',
      DIRECT: 'Direct chat',
      GROUP: 'Group chat',
      CHANNEL: 'Channel'
    }[chat.type],
    presence: chat.type === 'DIRECT' ? presence : null,
    username: chat.peer?.username ?? null,
    createdAt: chat.createdAt
  };
};

export const chronologicalMessages = (pages: ApiMessagesResponse[]): ChatMessage[] =>
  [
    ...new Map(
      pages.flatMap((page) => page.messages).map((message) => [message.id, message])
    ).values()
  ].sort((a, b) => a.seq - b.seq);
