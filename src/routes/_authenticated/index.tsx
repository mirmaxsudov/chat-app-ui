import { useSuspenseQuery } from '@tanstack/react-query';
import { createFileRoute, useRouter } from '@tanstack/react-router';

import { currentUserQueryOptions } from '@/entities/user';
import { clearAuthSession } from '@/features/auth';
import { ChatLayout } from '@/features/chat';

const HomePage = () => {
  const router = useRouter();
  const { data: user } = useSuspenseQuery(currentUserQueryOptions());

  const handleLogout = async () => {
    clearAuthSession();
    router.options.context.queryClient.clear();
    await router.navigate({ to: '/login', replace: true });
  };

  return <ChatLayout currentUser={user} onLogout={handleLogout} />;
};

export const Route = createFileRoute('/_authenticated/')({
  loader: ({ context }) => context.queryClient.ensureQueryData(currentUserQueryOptions()),
  component: HomePage
});
