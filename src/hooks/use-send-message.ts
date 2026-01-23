/**
 * useSendMessage Hook
 *
 * Hook para enviar mensagens via WhatsApp API.
 * Inclui optimistic update e rollback em caso de erro.
 */

import { useState } from 'react';
import { fetcherWithBody } from '@/lib/utils/fetcher';
import type { Message } from '@/lib/db/repositories/message';

interface SendMessageParams {
  orgId: string;
  conversationId: string;
  content: string;
  templateId?: string;
}

interface UseSendMessageResult {
  sendMessage: (params: SendMessageParams) => Promise<Message | null>;
  isSending: boolean;
  error: Error | null;
}

export function useSendMessage(): UseSendMessageResult {
  const [isSending, setIsSending] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const sendMessage = async (params: SendMessageParams): Promise<Message | null> => {
    const { orgId, conversationId, content, templateId } = params;

    if (!orgId || !conversationId || !content.trim()) {
      return null;
    }

    setIsSending(true);
    setError(null);

    try {
      const message = await fetcherWithBody<Message>(
        `/api/${orgId}/conversations/${conversationId}/messages`,
        {
          method: 'POST',
          body: JSON.stringify({
            content: content.trim(),
            templateId,
          }),
        }
      );

      return message;
    } catch (err) {
      const error = err instanceof Error ? err : new Error('Falha ao enviar mensagem');
      setError(error);
      console.error('Erro ao enviar mensagem:', error);
      return null;
    } finally {
      setIsSending(false);
    }
  };

  return {
    sendMessage,
    isSending,
    error,
  };
}
