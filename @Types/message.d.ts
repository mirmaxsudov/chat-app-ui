type PreviewStatus = 'FAILED' | 'NOT_APPLICABLE' | 'PENDING' | 'PROCESSING' | 'READY';
type AttachmentType = 'AUDIO' | 'EXCEL' | 'IMAGE' | 'OTHERS' | 'PDF' | 'PPT' | 'VIDEO';

interface ChatMessage {
  attachments: ChatMessageAttachment[];
  createdAt: string;
  id: string;
  mine: boolean;
  senderId: string;
  seq: number;
  text: string;
}

interface ChatMessageAttachment {
  attachment: {
    name: string;
    contentType: string;
    sizeBytes: number;
    publicURL: string;
    thumbnailURL: string | null;
    type: AttachmentType;
    preview: AttachmentPreview | null;
  };
  sortOrder: number;
}

interface AttachmentPreview {
  contentType: 'image/jpeg' | 'image/png' | null;
  height: number | null;
  sizeBytes: number | null;
  status: PreviewStatus;
  url: string | null;
  width: number | null;
}
