import type { QueryClient } from '@tanstack/react-query';

import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router';

import { ThemeProvider } from '@/app/providers';
import { GeneralError, NotFoundError } from '@/shared/ui/errors';
import { toast, Toaster } from '@/shared/ui/toast';

interface RouterContext {
  queryClient: QueryClient;
}

export const Route = createRootRouteWithContext<RouterContext>()({
  notFoundComponent: NotFoundError,
  errorComponent: GeneralError,
  component: () => (
    <NuqsAdapter>
      <ThemeProvider>
        <Outlet />
        <button onClick={() => toast.add({ title: 'Toast smoke test', type: 'success' })}>
          Toast smoke test
        </button>
        <Toaster />
      </ThemeProvider>
    </NuqsAdapter>
  )
});
