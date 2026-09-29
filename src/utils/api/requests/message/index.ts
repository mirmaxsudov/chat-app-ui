import { apiClient } from '@/utils/api';

export interface GetChatMessagesRequest {
  beforeSeq?: number;
  chatId: string;
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

export interface DeleteMessageRequest {
  chatId: string;
  messageId: string;
}

export const deleteMessage = ({ messageId, chatId }: DeleteMessageRequest) =>
  apiClient.delete(`/chats/${chatId}/messages/${messageId}`);
