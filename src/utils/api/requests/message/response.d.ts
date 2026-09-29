type ChatsResponse = ApiPaginationResponse<Chat>;
type ChatResponse = ApiResponse<Chat>;

interface ApiMessagesResponse {
  hasMore: boolean;
  messages: ChatMessage[];
  nextBeforeSeq: number | null;
}

type MessagesResponse = ApiResponse<ApiMessagesResponse>;
type MessageResponse = ApiResponse<ChatMessage>;
