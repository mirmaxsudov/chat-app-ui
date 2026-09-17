export interface PostSendMessageDto {
  text: string;
  attachments: { id: string; sortOrder: number }[];
}
