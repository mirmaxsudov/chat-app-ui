export type AttachmentType = 'IMAGE' | 'VIDEO' | 'EXCEL' | 'AUDIO' | 'PDF' | 'PPT' | 'OTHERS';

export interface ChatMessage {
  id: string;
  seq: number;
  senderId: string;
  text: string;
  createdAt: string;
  mine: boolean;
  attachments: ChatMessageAttachment[];
}

export interface ChatMessageAttachment {
  sortOrder: number;
  attachment: {
    name: string;
    contentType: string;
    sizeBytes: number;
    publicURL: string;
    thumbnailURL: string | null;
    type: AttachmentType;
  };
}
