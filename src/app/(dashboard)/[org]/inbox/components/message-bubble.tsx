/**
 * Message Bubble Component
 *
 * Balão de mensagem com suporte para:
 * - Mensagens inbound/outbound
 * - Badge de IA
 * - Timestamp
 * - Status (enviado, entregue, lido)
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { Bot, Check, CheckCheck } from 'lucide-react';

interface MessageBubbleProps {
  message: {
    id: string;
    content: string;
    direction: string;
    timestamp: Date;
    isAiGenerated: boolean;
    status?: string;
  };
}

export function MessageBubble({ message }: MessageBubbleProps) {
  const isInbound = message.direction === 'inbound';
  const isOutbound = message.direction === 'outbound';

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('pt-BR', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusIcon = () => {
    if (!isOutbound) return null;

    switch (message.status) {
      case 'read':
        return <CheckCheck className="h-3 w-3 text-blue-500" />;
      case 'delivered':
        return <CheckCheck className="h-3 w-3" />;
      case 'sent':
        return <Check className="h-3 w-3" />;
      default:
        return <Check className="h-3 w-3 text-muted-foreground" />;
    }
  };

  return (
    <div
      className={cn(
        'flex items-end gap-2',
        isOutbound && 'flex-row-reverse'
      )}
    >
      <div
        className={cn(
          'max-w-[70%] rounded-lg px-4 py-2 shadow-sm',
          isInbound && 'bg-muted',
          isOutbound && 'bg-primary text-primary-foreground'
        )}
      >
        {/* Badge de IA (se aplicável) */}
        {message.isAiGenerated && isOutbound && (
          <div className="mb-1">
            <Badge
              variant="secondary"
              className="h-5 text-xs gap-1 bg-primary-foreground/10"
            >
              <Bot className="h-3 w-3" />
              IA
            </Badge>
          </div>
        )}

        {/* Conteúdo da mensagem */}
        <p className="text-sm whitespace-pre-wrap break-words">
          {message.content}
        </p>

        {/* Timestamp e status */}
        <div
          className={cn(
            'flex items-center gap-1 mt-1',
            isOutbound && 'justify-end'
          )}
        >
          <span
            className={cn(
              'text-xs',
              isInbound ? 'text-muted-foreground' : 'text-primary-foreground/70'
            )}
          >
            {formatTime(message.timestamp)}
          </span>
          {getStatusIcon()}
        </div>
      </div>
    </div>
  );
}
