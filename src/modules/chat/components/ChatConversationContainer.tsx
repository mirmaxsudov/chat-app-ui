import { ChatConversationView, useChatConversation } from '@/modules/chat';

interface ChatConversationContainerProps {
  chatId: string;
  onBack: () => void;
}

export const ChatConversationContainer = ({ chatId, onBack }: ChatConversationContainerProps) => {
  const conversation = useChatConversation(chatId);
  return <ChatConversationView {...conversation} onBack={onBack} />;
};
