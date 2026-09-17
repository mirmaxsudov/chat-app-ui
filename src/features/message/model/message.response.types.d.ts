import type { ApiResponse } from '@/shared/api';

import type { ChatMessage } from './message.types';

export interface ApiMessagesResponse {
  messages: ChatMessage[];
  nextBeforeSeq: number | null;
  hasMore: boolean;
}

export type MessagesResponse = ApiResponse<ApiMessagesResponse>;
export type MessageResponse = ApiResponse<ChatMessage>;
