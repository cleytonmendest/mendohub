/**
 * Message Input Component
 *
 * Campo de input para enviar mensagens com:
 * - Textarea auto-resize
 * - Botão de envio
 * - Ações extras (template, mídia)
 * - Atalho Ctrl+Enter
 */

'use client';

import { useState, useRef, KeyboardEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Send } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TemplatesPopover } from './templates-popover';
import { EmojiPicker } from './emoji-picker';
import { AttachmentOptions } from './attachment-options';

interface MessageInputProps {
  onSendMessage: (content: string) => void;
}

export function MessageInput({ onSendMessage }: MessageInputProps) {
  const [message, setMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = async () => {
    if (!message.trim() || isSending) return;

    setIsSending(true);

    try {
      // Chamar callback de envio
      onSendMessage(message);

      setMessage('');

      // Resetar altura do textarea
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } finally {
      setIsSending(false);
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Ctrl/Cmd + Enter para enviar
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      handleSend();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const handleSelectTemplate = (content: string) => {
    setMessage(content);

    // Ajustar altura do textarea após inserir template
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 200)}px`;
    }

    // Focar no textarea
    textareaRef.current?.focus();
  };

  const handleSelectEmoji = (emoji: string) => {
    // Inserir emoji na posição do cursor
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newMessage =
      message.substring(0, start) + emoji + message.substring(end);

    setMessage(newMessage);

    // Ajustar altura e mover cursor após o emoji
    setTimeout(() => {
      if (textarea) {
        textarea.style.height = 'auto';
        textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
        textarea.focus();
        textarea.setSelectionRange(start + emoji.length, start + emoji.length);
      }
    }, 0);
  };

  const handleSelectFile = (file: File) => {
    // TODO: Implementar upload quando backend estiver pronto
    console.log('Arquivo selecionado:', file.name);
  };

  return (
    <div className="flex flex-col gap-2">
      {/* Ações rápidas */}
      <div className="flex items-center gap-1">
        <TemplatesPopover
          onSelectTemplate={handleSelectTemplate}
          disabled={isSending}
        />
        <EmojiPicker onSelectEmoji={handleSelectEmoji} disabled={isSending} />
        <AttachmentOptions
          onSelectFile={handleSelectFile}
          disabled={isSending}
        />
      </div>

      {/* Input de mensagem */}
      <div className="flex items-end gap-2">
        <Textarea
          ref={textareaRef}
          placeholder="Digite sua mensagem... (Ctrl+Enter para enviar)"
          value={message}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          disabled={isSending}
          className={cn(
            'min-h-[44px] max-h-[200px] resize-none',
            'focus-visible:ring-1'
          )}
          rows={1}
        />
        <Button
          onClick={handleSend}
          disabled={!message.trim() || isSending}
          size="icon"
          className="h-11 w-11 flex-shrink-0"
        >
          <Send className="h-4 w-4" />
        </Button>
      </div>

      {/* Dica */}
      <p className="text-xs text-muted-foreground">
        Pressione <kbd className="px-1 py-0.5 rounded bg-muted">Ctrl</kbd> +{' '}
        <kbd className="px-1 py-0.5 rounded bg-muted">Enter</kbd> para enviar
      </p>
    </div>
  );
}
