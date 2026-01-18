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
import { ConversationList } from './components/conversation-list';
import { MessageArea } from './components/message-area';
import { mockConversations, mockMessages, type Conversation, type Message } from './mock-data';

export default function InboxPage() {
  const [conversations, setConversations] = useState<Conversation[]>(mockConversations);
  const [messages, setMessages] = useState<Record<string, Message[]>>(mockMessages);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(
    mockConversations[0]?.id || null
  );
  const [searchQuery, setSearchQuery] = useState('');

  // Conversa selecionada
  const selectedConversation = conversations.find(
    (c) => c.id === selectedConversationId
  ) || null;

  // Mensagens da conversa selecionada
  const conversationMessages = selectedConversationId
    ? messages[selectedConversationId] || []
    : [];

  // Filtrar conversas pela busca
  const filteredConversations = conversations.filter((conv) =>
    conv.customerName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Handler para enviar mensagem
  const handleSendMessage = (content: string) => {
    if (!selectedConversationId || !content.trim()) return;

    const newMessage: Message = {
      id: `${selectedConversationId}-${Date.now()}`,
      conversationId: selectedConversationId,
      content: content.trim(),
      direction: 'outbound',
      timestamp: new Date(),
      isAiGenerated: false,
      status: 'sent',
    };

    // Adicionar mensagem ao array
    setMessages((prev) => ({
      ...prev,
      [selectedConversationId]: [...(prev[selectedConversationId] || []), newMessage],
    }));

    // Atualizar última mensagem na conversa
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === selectedConversationId
          ? {
              ...conv,
              lastMessageContent: content.trim(),
              lastMessageAt: new Date(),
              lastMessageDirection: 'outbound',
            }
          : conv
      )
    );
  };

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
          messages={conversationMessages}
          onSendMessage={handleSendMessage}
        />
      </div>
    </div>
  );
}
