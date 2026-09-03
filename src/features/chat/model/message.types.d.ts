export interface ChatLastMessage {
  id: string;
  seq: number;
  senderId: string;
  text: string;
  createdAt: string;
  mine: boolean;
}
