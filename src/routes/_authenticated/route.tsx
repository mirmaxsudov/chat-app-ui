import { createFileRoute, Outlet, redirect } from '@tanstack/react-router';
import { isAxiosError } from 'axios';

import { currentUserQueryOptions } from '@/entities/user';
import { clearAuthSession, getAuthSession } from '@/features/auth';
import { NotFoundError } from '@/shared/ui/errors';
import { PageLoading } from '@/shared/ui/layout';
import { useChatRealtime } from '@/features/chat/realtime/use-chat-realtime';

const AuthenticatedLayout = () => {
  useChatRealtime();
  return <Outlet />;
};

export const Route = createFileRoute('/_authenticated')({
  beforeLoad: async ({ context }) => {
    if (!getAuthSession()) throw redirect({ to: '/login' });

    try {
      await context.queryClient.ensureQueryData(currentUserQueryOptions());
    } catch (error) {
      if (
        isAxiosError(error) &&
        (error.response?.status === 401 || error.response?.status === 404)
      ) {
        clearAuthSession();
        context.queryClient.clear();
        throw redirect({ to: '/login' });
      }

      throw error;
    }
  },
  pendingComponent: PageLoading,
  notFoundComponent: NotFoundError,
  component: AuthenticatedLayout
});
