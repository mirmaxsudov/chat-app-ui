type ChatsResponse = ApiPaginationResponse<Chat>;
type ChatResponse = ApiResponse<Chat>;

interface ApiMessagesResponse {
  messages: ChatMessage[];
  nextBeforeSeq: number | null;
  hasMore: boolean;
}

type MessagesResponse = ApiResponse<ApiMessagesResponse>;
type MessageResponse = ApiResponse<ChatMessage>;
