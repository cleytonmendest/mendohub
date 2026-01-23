/**
 * useMessages Hook
 *
 * Hook SWR para buscar mensagens de uma conversa.
 * Revalida automaticamente quando a conversa muda.
 */

import useSWR from 'swr';
import { fetcher } from '@/lib/utils/fetcher';
import type { Message } from '@/lib/db/repositories/message';

interface UseMessagesOptions {
  /**
   * Intervalo de polling em ms (default: 0 = desabilitado)
   * Mensagens usam polling mais lento que conversas
   */
  refreshInterval?: number;
}

export function useMessages(
  orgId: string | null,
  conversationId: string | null,
  options: UseMessagesOptions = {}
) {
  const { refreshInterval = 0 } = options;

  // Só faz fetch se tiver orgId E conversationId
  const url =
    orgId && conversationId
      ? `/api/${orgId}/conversations/${conversationId}/messages`
      : null;

  const { data, error, isLoading, mutate } = useSWR<Message[]>(
    url,
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000,
    }
  );

  return {
    messages: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
