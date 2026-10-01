import { useRouter } from '@tanstack/react-router';

import { ChatPage } from '@/modules/chat/components/ChatPage.tsx';

export const ChatRoutePage = ({ chatId = null }: { chatId?: string | null }) => {
  const router = useRouter();

  return (
    <ChatPage
      activeChatId={chatId}
      onBack={() => {
        void router.navigate({ to: '/' });
      }}
      onSelectChat={(id) => {
        void router.navigate({ to: '/$id', params: { id } });
      }}
    />
  );
};
