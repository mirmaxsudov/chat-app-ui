import { apiClient } from '@/utils/api';

export const postLogin = ({ data }: PostLoginRequest) =>
  apiClient.post<LoginResponse>('/auth/login', data).then((response) => response.data.data);
