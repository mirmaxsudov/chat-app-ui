import { apiClient } from '@/utils/api';

export const getCurrentUser = () => apiClient.get<CurrentUserResponse>('/users/me');
