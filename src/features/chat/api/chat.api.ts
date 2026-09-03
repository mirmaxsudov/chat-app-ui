import { apiClient } from '@/shared/api/client';

import type { Chat } from '../model/chat.types';
import type { ChatResponse, ChatsResponse } from '../model/chat.response.types';
import type { PostDmChatDto } from './chat.dto';

export interface GetChatsRequest {
  page?: number;
  size?: number;
}

export const getChats = async (
  { page = 0, size = 20 }: GetChatsRequest = {},
  signal?: AbortSignal
) => {
  const response = await apiClient.get<ChatsResponse>('/chats', { params: { page, size }, signal });
  return response.data;
};

export interface GetChatByIdRequest {
  id: string;
}

export const getChatById = async (
  { id }: GetChatByIdRequest,
  signal?: AbortSignal
): Promise<Chat> => {
  const response = await apiClient.get<ChatResponse>(`/chats/${id}`, { signal });
  return response.data.data;
};

export const postSavedChat = async (): Promise<Chat> => {
  const response = await apiClient.post<ChatResponse>('/chats/saved');
  return response.data.data;
};

export interface PostDMChatRequest {
  data: PostDmChatDto;
}

export const postDMChat = async ({ data }: PostDMChatRequest): Promise<Chat> => {
  const response = await apiClient.post<ChatResponse>('/chats/dm', data);
  return response.data.data;
};
