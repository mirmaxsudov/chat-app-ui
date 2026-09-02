import type { QueryClient } from '@tanstack/react-query';

import { createRootRouteWithContext, Outlet } from '@tanstack/react-router';
import { NuqsAdapter } from 'nuqs/adapters/tanstack-router';
import { GeneralError, NotFoundError } from '@/shared/ui/errors';
import { ThemeProvider } from '@/app/providers';
import { Toaster } from '@/shared/ui/toast';

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
        <Toaster />
      </ThemeProvider>
    </NuqsAdapter>
  )
});
