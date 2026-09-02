import { queryOptions } from '@tanstack/react-query';

import type { ApiResponse } from '@/shared/api/contractors';
import { apiClient } from '@/shared/api/client';

export type Role = 'USER' | 'ADMIN';

export interface CurrentUser {
  id: string;
  phoneNumber: string;
  username: string | null;
  firstname: string | null;
  lastname: string | null;
  roles: Role[];
}

export const currentUserQueryKey = ['current-user'] as const;

export const getCurrentUser = async () => {
  const response = await apiClient.get<ApiResponse<CurrentUser>>('/users/me');
  return response.data.data;
};

export const currentUserQueryOptions = () =>
  queryOptions({
    queryKey: currentUserQueryKey,
    queryFn: getCurrentUser,
    staleTime: 5 * 60 * 1000
  });
