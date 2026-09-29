import { createFileRoute, Outlet } from '@tanstack/react-router';

import { useChatRealtime } from '@/modules/realtime';
import { NotFoundError } from '@/shared/ui/errors';
import { PageLoading } from '@/shared/ui/layout';

const AuthenticatedLayout = () => {
  useChatRealtime();
  return <Outlet />;
};

export const Route = createFileRoute('/_authenticated')({
  pendingComponent: PageLoading,
  notFoundComponent: NotFoundError,
  component: AuthenticatedLayout
});
