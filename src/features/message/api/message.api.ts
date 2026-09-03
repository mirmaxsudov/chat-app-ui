import { apiClient } from '@/shared/api/client';

import type {
  ApiMessagesResponse,
  MessageResponse,
  MessagesResponse
} from '../model/message.response.types';
import type { ChatMessage } from '../model/message.types';
import type { PostSendMessageDto } from './messages.dto';

export interface GetChatMessagesRequest {
  chatId: string;
  beforeSeq?: number;
  size?: number;
}

export const getChatMessages = async (
  { chatId, beforeSeq, size = 50 }: GetChatMessagesRequest,
  signal?: AbortSignal
): Promise<ApiMessagesResponse> => {
  const response = await apiClient.get<MessagesResponse>(`/chats/${chatId}/messages`, {
    params: { beforeSeq, size },
    signal
  });

  return response.data.data;
};

export interface PostSendMessageRequest {
  chatId: string;
  data: PostSendMessageDto;
}

export const postSendMessage = async ({
  data,
  chatId
}: PostSendMessageRequest): Promise<ChatMessage> => {
  const response = await apiClient.post<MessageResponse>(`/chats/${chatId}/messages`, data);
  return response.data.data;
};
