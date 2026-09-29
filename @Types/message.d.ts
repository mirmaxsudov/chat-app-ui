type PreviewStatus = 'NOT_APPLICABLE' | 'PENDING' | 'PROCESSING' | 'READY' | 'FAILED';
type AttachmentType = 'IMAGE' | 'VIDEO' | 'EXCEL' | 'AUDIO' | 'PDF' | 'PPT' | 'OTHERS';

interface ChatMessage {
  id: string;
  seq: number;
  senderId: string;
  text: string;
  createdAt: string;
  mine: boolean;
  attachments: ChatMessageAttachment[];
}

interface ChatMessageAttachment {
  sortOrder: number;
  attachment: {
    name: string;
    contentType: string;
    sizeBytes: number;
    publicURL: string;
    thumbnailURL: string | null;
    type: AttachmentType;
    preview: AttachmentPreview | null;
  };
}

interface AttachmentPreview {
  status: PreviewStatus;
  url: string | null;
  contentType: 'image/jpeg' | 'image/png' | null;
  sizeBytes: number | null;
  width: number | null;
  height: number | null;
}
