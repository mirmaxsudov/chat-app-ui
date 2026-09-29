type ChatsResponse = ApiPaginationResponse<Chat>;
type ChatResponse = ApiResponse<Chat>;

interface PostDmChatDto {
  username: string;
}
