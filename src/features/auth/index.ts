import type { ApiResponse } from '@/shared/api/contractors';
import { apiClient } from '@/shared/api/client';

export interface LoginInput {
  phoneNumber: string;
  password: string;
}

export interface LoginData {
  accessToken: string;
  tokenType: 'Bearer';
  expiresAt: string;
}

export const login = async (input: LoginInput) => {
  const response = await apiClient.post<ApiResponse<LoginData>>('/auth/login', input, {
    headers: { 'Content-Type': 'application/json' }
  });

  return response.data.data;
};

export * from './session';
