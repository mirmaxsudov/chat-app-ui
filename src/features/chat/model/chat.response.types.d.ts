import type { ApiPaginationResponse, ApiResponse } from '@/shared/api/contractors';

import type { Chat } from './chat.types';

export type ChatsResponse = ApiPaginationResponse<Chat>;
export type ChatResponse = ApiResponse<Chat>;
