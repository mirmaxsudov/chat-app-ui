interface PostSendMessageDto {
  attachments: { id: string; sortOrder: number }[];
  text: string;
}
