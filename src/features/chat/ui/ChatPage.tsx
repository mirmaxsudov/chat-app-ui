import { useState } from 'react';
import type { CurrentUser } from '@/entities/user';
import { useConversationList } from '../model/use-conversation-list';
import { ChatConversationContainer } from './ChatConversationContainer';
import { ChatLayoutView } from './ChatLayoutView';
import { NewChatDialog } from './NewChatDialog';

interface ChatPageProps {
  activeChatId: string | null;
  currentUser: CurrentUser;
  onBack: () => void;
  onLogout: () => void;
  onSelectChat: (id: string) => void;
}

export const ChatPage = ({
  activeChatId,
  currentUser,
  onBack,
  onLogout,
  onSelectChat
}: ChatPageProps) => {
  const [creatingChat, setCreatingChat] = useState(false);
  const conversationList = useConversationList();

  return (
    <>
      <ChatLayoutView
        {...conversationList}
        activeChatId={activeChatId}
        currentUser={currentUser}
        onLogout={onLogout}
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
