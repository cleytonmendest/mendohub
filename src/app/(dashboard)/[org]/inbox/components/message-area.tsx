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
import type { Conversation, Message } from '../mock-data';

interface MessageAreaProps {
  conversation: Conversation | null;
  messages: Message[];
  onSendMessage: (content: string) => void;
}

export function MessageArea({ conversation, messages, onSendMessage }: MessageAreaProps) {
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
              src={conversation.customerProfilePicUrl || undefined}
            />
            <AvatarFallback className="bg-primary/10 text-primary">
              {getInitials(conversation.customerName)}
            </AvatarFallback>
          </Avatar>
          <div>
            <h2 className="font-semibold text-sm">
              {conversation.customerName}
            </h2>
            <p className="text-xs text-muted-foreground">
              {conversation.customerPhone}
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
        <div className="space-y-4 max-w-4xl mx-auto">
          {messages.map((message) => (
            <MessageBubble key={message.id} message={message} />
          ))}
          {/* Referência para auto-scroll */}
          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input de mensagem */}
      <div className="border-t p-4">
        <MessageInput onSendMessage={onSendMessage} />
      </div>
    </div>
  );
}
