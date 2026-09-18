import { useChatConversation } from '../model/use-chat-conversation';
import { ChatConversationView } from './ChatConversationView';

interface ChatConversationContainerProps {
  chatId: string;
  onBack: () => void;
}

export const ChatConversationContainer = ({ chatId, onBack }: ChatConversationContainerProps) => {
  const conversation = useChatConversation(chatId);
  return <ChatConversationView {...conversation} onBack={onBack} />;
};
