/**
 * useConversations Hook
 *
 * Hook SWR para buscar conversas do inbox de uma organização.
 * Inclui polling automático e revalidação.
 */

import useSWR from 'swr';
import { fetcher } from '@/lib/utils/fetcher';
import type { Conversation } from '@/lib/db/repositories/conversation';

interface UseConversationsOptions {
  /**
   * Status das conversas para filtrar
   */
  status?: 'open' | 'assigned' | 'resolved' | 'closed';

  /**
   * Filtrar por usuário atribuído
   */
  assignedTo?: string;

  /**
   * Intervalo de polling em ms (default: 3000)
   * Use 0 para desabilitar polling
   */
  refreshInterval?: number;
}

export function useConversations(
  orgId: string | null,
  options: UseConversationsOptions = {}
) {
  const { status, assignedTo, refreshInterval = 3000 } = options;

  // Construir URL com query params
  const buildUrl = () => {
    if (!orgId) return null;

    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (assignedTo) params.append('assignedTo', assignedTo);

    const queryString = params.toString();
    return `/api/${orgId}/conversations${queryString ? `?${queryString}` : ''}`;
  };

  const url = buildUrl();

  // SWR config
  const { data, error, isLoading, mutate } = useSWR<Conversation[]>(
    url, // Se null, não faz fetch
    fetcher,
    {
      refreshInterval,
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 2000, // Evita duplicação de requests em 2s
    }
  );

  return {
    conversations: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
