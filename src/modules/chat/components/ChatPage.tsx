import { useState } from 'react';
import {
  ChatConversationContainer,
  ChatLayoutView,
  NewChatDialog,
  useConversationList
} from '@/modules/chat';
import { usePresenceStore } from '@/modules/presence';

interface ChatPageProps {
  activeChatId: string | null;
  onBack: () => void;
  onSelectChat: (id: string) => void;
}

export const ChatPage = ({ activeChatId, onBack, onSelectChat }: ChatPageProps) => {
  const [creatingChat, setCreatingChat] = useState(false);
  const connectionStatus = usePresenceStore((state) => state.connectionStatus);
  const conversationList = useConversationList();

  return (
    <>
      <ChatLayoutView
        {...conversationList}
        connectionStatus={connectionStatus}
        activeChatId={activeChatId}
        onNewChat={() => setCreatingChat(true)}
        onSelectChat={onSelectChat}
        conversation={
          activeChatId ? (
            <ChatConversationContainer key={activeChatId} chatId={activeChatId} onBack={onBack} />
          ) : undefined
        }
      />
      {creatingChat && (
        <NewChatDialog
          onClose={() => setCreatingChat(false)}
          onCreated={(id) => onSelectChat(id)}
        />
      )}
    </>
  );
};
