import { queryOptions } from '@tanstack/react-query';
import { getCurrentUser } from '@/utils/api';

export const currentUserQueryKey = ['current-user'] as const;

export const currentUserQueryOptions = () =>
  queryOptions({
    queryKey: currentUserQueryKey,
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000,
    select: (data) => data.data.data
  });
