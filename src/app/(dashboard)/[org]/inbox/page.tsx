/**
 * Inbox Page
 *
 * Central de atendimento WhatsApp com:
 * - Lista de conversas (sidebar)
 * - Área de mensagens
 * - Campo de resposta
 */

'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';
import { toast } from 'sonner';
import { ConversationList } from './components/conversation-list';
import { ConversationListSkeleton } from './components/conversation-skeleton';
import { MessageArea } from './components/message-area';
import { useConversations } from '@/hooks/use-conversations';
import { useMessages } from '@/hooks/use-messages';
import { useSendMessage } from '@/hooks/use-send-message';
import type { Conversation } from '@/lib/db/repositories/conversation';

export default function InboxPage() {
  // Get org from URL params
  const params = useParams<{ org: string }>();
  const orgId = params?.org || null;

  // Local state
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch conversations from API
  const {
    conversations: apiConversations,
    isLoading: isLoadingConversations,
    isError: isConversationsError,
  } = useConversations(orgId);

  // Fetch messages for selected conversation
  const {
    messages: apiMessages,
    isLoading: isLoadingMessages,
    mutate: mutateMessages,
  } = useMessages(orgId, selectedConversationId);

  // Hook para enviar mensagens
  const { sendMessage, error: sendError } = useSendMessage();

  // Use API data or empty arrays
  const conversations: Conversation[] = apiConversations || [];
  const messages = apiMessages || [];

  // Conversa selecionada
  const selectedConversation =
    conversations.find((c) => c.id === selectedConversationId) || null;

  // Filtrar conversas pela busca
  const filteredConversations = conversations.filter((conv) =>
    (conv.customer_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handler para enviar mensagem
  const handleSendMessage = async (content: string): Promise<boolean> => {
    if (!selectedConversationId || !content.trim() || !orgId) {
      return false;
    }

    const message = await sendMessage({
      orgId,
      conversationId: selectedConversationId,
      content,
    });

    if (message) {
      // Revalidar mensagens após envio bem-sucedido
      mutateMessages();
      return true;
    }

    // Mostrar toast de erro
    toast.error('Falha ao enviar mensagem', {
      description: sendError?.message || 'Tente novamente mais tarde',
    });

    return false;
  };

  // Loading state - mostra skeleton da lista
  if (isLoadingConversations) {
    return (
      <div className="flex h-[calc(100vh-7rem)]">
        <div className="w-full md:w-96 border-r flex-shrink-0 p-4">
          <ConversationListSkeleton count={8} />
        </div>
        <div className="flex-1 flex items-center justify-center bg-muted/20">
          <p className="text-muted-foreground">Selecione uma conversa</p>
        </div>
      </div>
    );
  }

  // Error state
  if (isConversationsError) {
    return (
      <div className="flex h-[calc(100vh-7rem)] items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-destructive text-4xl">⚠️</div>
          <h2 className="text-xl font-semibold">Erro ao carregar conversas</h2>
          <p className="text-muted-foreground">
            Não foi possível carregar as conversas. Tente recarregar a página.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
          >
            Recarregar página
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-[calc(100vh-7rem)]">
      {/* Sidebar - Lista de conversas */}
      <div className="w-full md:w-96 border-r flex-shrink-0">
        <ConversationList
          conversations={filteredConversations}
          selectedConversationId={selectedConversationId}
          searchQuery={searchQuery}
          onSelectConversation={setSelectedConversationId}
          onSearchChange={setSearchQuery}
        />
      </div>

      {/* Área principal - Mensagens */}
      <div className="flex-1 flex flex-col">
        <MessageArea
          conversation={selectedConversation}
          messages={messages}
          isLoadingMessages={isLoadingMessages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
