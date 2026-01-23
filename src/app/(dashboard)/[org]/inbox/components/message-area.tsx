/**
 * Message Area Component
 *
 * Área principal de mensagens com:
 * - Header do cliente
 * - Lista de mensagens
 * - Campo de input
 */

'use client';

import { useEffect, useRef } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { ScrollArea } from '@/components/ui/scroll-area';
import { MessageInput } from './message-input';
import { MessageBubble } from './message-bubble';
import { ContactInfoPopover } from './contact-info-popover';
import { ConversationOptionsMenu } from './conversation-options-menu';
import type { Conversation } from '@/lib/db/repositories/conversation';
import type { Message } from '@/lib/db/repositories/message';

interface MessageAreaProps {
  conversation: Conversation | null;
  messages: Message[];
  isLoadingMessages?: boolean;
  onSendMessage: (content: string) => Promise<boolean>;
}

export function MessageArea({
  conversation,
  messages,
  isLoadingMessages = false,
  onSendMessage,
}: MessageAreaProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Auto-scroll para última mensagem
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Placeholder para quando nenhuma conversa está selecionada
  if (!conversation) {
    return (
      <div className="flex-1 flex items-center justify-center bg-muted/20">
        <div className="text-center text-muted-foreground">
          <p className="text-lg font-medium mb-2">
            Selecione uma conversa para começar
          </p>
          <p className="text-sm">
            Escolha uma conversa da lista ao lado para visualizar as mensagens
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header - Informações do cliente */}
      <div className="border-b p-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage
              src={conversation.customer_profile_pic_url || undefined}
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(conversation.customer_name || 'Desconhecido')}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-sm">
              {conversation.customer_name || 'Desconhecido'}
            </h2>
            <p className="text-xs text-muted-foreground">
              {conversation.customer_phone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <ContactInfoPopover conversation={conversation} />
          <ConversationOptionsMenu />
        </div>
      </div>

      {/* Área de mensagens */}
      <ScrollArea className="flex-1 p-4">
        {isLoadingMessages ? (
          // Loading state
          <div className="space-y-4 max-w-4xl mx-auto">
            {[1, 2, 3].map((i) => (
              <div
                key={i}
                className={`flex items-end gap-2 ${i % 2 === 0 ? 'flex-row-reverse' : ''}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg px-4 py-3 ${
                    i % 2 === 0 ? 'bg-primary/20' : 'bg-muted'
                  } animate-pulse`}
                >
                  <div className="h-4 bg-current opacity-20 rounded w-48 mb-2" />
                  <div className="h-3 bg-current opacity-10 rounded w-16" />
                </div>
              </div>
            ))}
          </div>
        ) : messages.length === 0 ? (
          // Empty state
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <p className="text-sm">Nenhuma mensagem ainda</p>
          </div>
        ) : (
          // Messages
          <div className="space-y-4 max-w-4xl mx-auto">
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {/* Referência para auto-scroll */}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      {/* Input de mensagem */}
      <div className="border-t p-4">
        <MessageInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
}
