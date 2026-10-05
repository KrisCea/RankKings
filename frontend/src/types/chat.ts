export interface ChatParticipant {
  id: string;
  username: string;
  avatarUrl: string;
  isOnline: boolean;
}

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
}

export interface Conversation {
  id: string;
  participant: ChatParticipant;   // chat 1-a-1 (si luego quieres grupos, se amplía)
  lastMessage?: ChatMessage;
  unreadCount: number;
}

export type ChatWindowState = "minimized" | "window" | "fullscreen";