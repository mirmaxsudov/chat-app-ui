import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { currentUserQueryOptions } from '@/entities/user';
import { clearAuthSession } from '@/features/auth';
import { ChatPage } from '@/features/chat';

export const ChatRoutePage = ({ chatId = null }: { chatId?: string | null }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { data: user } = useSuspenseQuery(currentUserQueryOptions());

  const handleLogout = async () => {
    clearAuthSession();
    queryClient.clear();
    await router.navigate({ to: '/login', replace: true });
  };

  return (
    <ChatPage
      activeChatId={chatId}
      currentUser={user}
      onBack={() => {
        void router.navigate({ to: '/' });
      }}
      onLogout={handleLogout}
      onSelectChat={(id) => {
        void router.navigate({ to: '/$id', params: { id } });
      }}
    />
  );
};
