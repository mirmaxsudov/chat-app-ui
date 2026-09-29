import { useQueryClient, useSuspenseQuery } from '@tanstack/react-query';
import { useRouter } from '@tanstack/react-router';
import { currentUserQueryOptions } from '@/modules/user';

export const useAuth = () => {
  const queryClient = useQueryClient();
  const router = useRouter();

  const getAuthMeSuspenseQuery = useSuspenseQuery(currentUserQueryOptions());

  const me = getAuthMeSuspenseQuery.data;

  const logout = async () => {
    queryClient.clear();
    await router.navigate({ to: '/login', replace: true });
  };

  return {
    me,
    logout
  } as const;
};
