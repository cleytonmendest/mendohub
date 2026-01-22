/**
 * Inbox Types
 *
 * Tipos compartilhados para a UI do Inbox.
 * Mantém compatibilidade com mock data durante migração.
 */

import type { Conversation as DbConversation } from '@/lib/db/repositories/conversation';

/**
 * Tipo de conversa usado pela UI (compatível com mock-data)
 */
export interface UiConversation {
  id: string;
  customerName: string;
  customerPhone: string;
  customerProfilePicUrl: string | null;
  lastMessageContent: string;
  lastMessageAt: Date;
  lastMessageDirection: 'inbound' | 'outbound';
  unreadCount: number;
  status: 'open' | 'resolved';
}

/**
 * Tipo de mensagem usado pela UI (compatível com mock-data)
 */
export interface UiMessage {
  id: string;
  conversationId: string;
  content: string;
  direction: 'inbound' | 'outbound';
  timestamp: Date;
  isAiGenerated: boolean;
  status?: 'sent' | 'delivered' | 'read';
}

/**
 * Converte conversa do banco (snake_case) para formato da UI (camelCase)
 */
export function toUiConversation(dbConv: DbConversation): UiConversation {
  return {
    id: dbConv.id,
    customerName: dbConv.customer_name || 'Desconhecido',
    customerPhone: dbConv.customer_phone,
    customerProfilePicUrl: dbConv.customer_profile_pic_url,
    lastMessageContent: dbConv.last_message_content || '',
    lastMessageAt: dbConv.last_message_at
      ? new Date(dbConv.last_message_at)
      : new Date(),
    lastMessageDirection:
      (dbConv.last_message_direction as 'inbound' | 'outbound') || 'inbound',
    unreadCount: dbConv.unread_count || 0,
    status: dbConv.status === 'resolved' ? 'resolved' : 'open',
  };
}
