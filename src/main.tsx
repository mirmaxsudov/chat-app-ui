import type { QueryKey } from '@tanstack/react-query';

import { i18n } from '@lingui/core';
import { I18nProvider } from '@lingui/react';
import { MutationCache, QueryCache, QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createRouter, RouterProvider } from '@tanstack/react-router';
import { isAxiosError } from 'axios';
import { StrictMode } from 'react';
import ReactDOM from 'react-dom/client';
import { toast } from 'sonner';

import { routeTree } from './routeTree.gen';

import './app/styles/index.css';
import { clearAuthSession, getAuthSession } from './features/auth';
import { initialI18nActivate } from './shared/i18n';
import { setAccessTokenGetter, setUnauthorizedHandler } from './shared/api/client';

interface ApiErrorResponse {
  message?: string;
}

const getErrorMessage = (error: unknown, fallback: string) => {
  if (isAxiosError<ApiErrorResponse>(error)) return error.response?.data?.message ?? fallback;
  return error instanceof Error && error.message ? error.message : fallback;
};

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 10 * 60 * 1000 // 10 minutes
    }
  },
  queryCache: new QueryCache({
    onError: (error, query) => {
      if (query.meta?.withoutToastOnError) return;
      if (query.meta?.customErrorMessage) {
        toast.error(query.meta?.customErrorMessage);
        return;
      }
      toast.error(getErrorMessage(error, 'Something went wrong!'));
    }
  }),
  mutationCache: new MutationCache({
    onError: (error, _variables, _context, mutation) => {
      if (mutation.meta?.withoutToastOnError) return;
      toast.error(getErrorMessage(error, 'Something went wrong!'));
    },
    onSuccess: (_data, _variables, _context, mutation) => {
      if (mutation.meta?.invalidatesQuery) {
        void queryClient.invalidateQueries({
          queryKey: mutation.meta.invalidatesQuery
        });
      }
    }
  })
});

export const router = createRouter({
  routeTree,
  context: { queryClient },
  defaultPendingMinMs: 0,
  defaultPendingMs: 0
});

setAccessTokenGetter(() => getAuthSession()?.accessToken ?? null);
setUnauthorizedHandler(() => {
  clearAuthSession();
  queryClient.clear();
  void router.navigate({ to: '/login', replace: true });
});

declare module '@tanstack/react-query' {
  interface Register {
    mutationMeta: {
      invalidatesQuery?: QueryKey;
      withoutToastOnError?: boolean;
    };
    queryMeta: {
      invalidatesQuery?: QueryKey;
      customErrorMessage?: string;
      withoutToastOnError?: boolean;
    };
  }
}

declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}

initialI18nActivate();

const rootElement = document.getElementById('root');

if (rootElement && !rootElement.innerHTML) {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <StrictMode>
      <I18nProvider i18n={i18n}>
        <QueryClientProvider client={queryClient}>
          <RouterProvider router={router} />
        </QueryClientProvider>
      </I18nProvider>
    </StrictMode>
  );
}
