/**
 * Conversation List Component
 *
 * Lista de conversas com busca e filtros
 */

'use client';

import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { Conversation } from '@/lib/db/repositories/conversation';

interface ConversationListProps {
  conversations: Conversation[];
  selectedConversationId: string | null;
  searchQuery: string;
  onSelectConversation: (id: string) => void;
  onSearchChange: (query: string) => void;
}

export function ConversationList({
  conversations,
  selectedConversationId,
  searchQuery,
  onSelectConversation,
  onSearchChange,
}: ConversationListProps) {

  const formatTimestamp = (dateStr: string | null) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMinutes = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60)
    );

    if (diffInMinutes < 60) {
      return `${diffInMinutes}m`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours}h`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d`;
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header com busca */}
      <div className="p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar conversas..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Lista de conversas */}
      <ScrollArea className="flex-1 w-full">
        <div className="divide-y w-full">
          {conversations.map((conversation) => (
            <button
              key={conversation.id}
              onClick={() => onSelectConversation(conversation.id)}
              className={cn(
                'w-full flex items-start gap-3 hover:bg-muted/50 transition-colors text-left py-4 px-2',
                selectedConversationId === conversation.id && 'bg-muted'
              )}
            >
              {/* Avatar */}
              <Avatar className="flex-shrink-0">
                <AvatarImage src={conversation.customer_profile_pic_url || undefined} />
                <AvatarFallback className="bg-primary/10 text-primary">
                  {getInitials(conversation.customer_name || 'Desconhecido')}
                </AvatarFallback>
              </Avatar>

              {/* Conteúdo */}
              <div className="flex-1 min-w-0">
                <div className="flex items-baseline justify-between gap-2 mb-1">
                  <h3 className="font-semibold text-sm truncate">
                    {conversation.customer_name || 'Desconhecido'}
                  </h3>
                  <span className="text-xs text-muted-foreground flex-shrink-0">
                    {formatTimestamp(conversation.last_message_at)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p
                    className={cn(
                      'text-sm truncate',
                      (conversation.unread_count || 0) > 0
                        ? 'font-medium text-foreground'
                        : 'text-muted-foreground'
                    )}
                  >
                    {conversation.last_message_content}
                  </p>
                  {(conversation.unread_count || 0) > 0 && (
                    <Badge
                      variant="default"
                      className="flex-shrink-0 h-5 min-w-5 flex items-center justify-center rounded-full px-1.5"
                    >
                      {conversation.unread_count}
                    </Badge>
                  )}
                </div>
              </div>
            </button>
          ))}

          {conversations.length === 0 && (
            <div className="p-8 text-center text-muted-foreground">
              <p>Nenhuma conversa encontrada</p>
            </div>
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
