/**
 * Emoji Picker
 *
 * Seletor de emojis para mensagens
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Smile } from 'lucide-react';

// Emojis organizados por categoria - mockado e simplificado
const EMOJI_CATEGORIES = [
  {
    name: 'Smileys',
    emojis: ['😀', '😃', '😄', '😁', '😅', '😂', '🤣', '😊', '😇', '🙂', '🙃', '😉', '😌', '😍', '🥰', '😘', '😗', '😙', '😚', '😋'],
  },
  {
    name: 'Gestos',
    emojis: ['👋', '🤚', '🖐️', '✋', '🖖', '👌', '🤌', '🤏', '✌️', '🤞', '🤟', '🤘', '🤙', '👈', '👉', '👆', '👇', '☝️', '👍', '👎'],
  },
  {
    name: 'Objetos',
    emojis: ['📱', '💻', '⌨️', '🖥️', '🖨️', '🖱️', '📞', '☎️', '📧', '📨', '📩', '📮', '📫', '📪', '📬', '📭', '📦', '📋', '📄', '📃'],
  },
  {
    name: 'Símbolos',
    emojis: ['❤️', '🧡', '💛', '💚', '💙', '💜', '🖤', '🤍', '🤎', '💔', '❣️', '💕', '💞', '💓', '💗', '💖', '💘', '💝', '✅', '❌'],
  },
];

interface EmojiPickerProps {
  onSelectEmoji: (emoji: string) => void;
  disabled?: boolean;
}

export function EmojiPicker({ onSelectEmoji, disabled }: EmojiPickerProps) {
  const [open, setOpen] = useState(false);
  const [activeCategory, setActiveCategory] = useState(0);

  const handleSelectEmoji = (emoji: string) => {
    onSelectEmoji(emoji);
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 gap-2"
          disabled={disabled}
        >
          <Smile className="h-4 w-4" />
          Emoji
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="flex flex-col">
          {/* Tabs de categorias */}
          <div className="flex border-b overflow-x-auto">
            {EMOJI_CATEGORIES.map((category, index) => (
              <button
                key={category.name}
                onClick={() => setActiveCategory(index)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors flex-shrink-0 ${
                  activeCategory === index
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                }`}
              >
                {category.name}
              </button>
            ))}
          </div>

          {/* Grid de emojis */}
          <ScrollArea className="h-[250px]">
            <div className="p-3">
              <div className="grid grid-cols-8 gap-1">
                {EMOJI_CATEGORIES[activeCategory]?.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => handleSelectEmoji(emoji)}
                    className="text-2xl p-2 rounded hover:bg-accent transition-colors"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          </ScrollArea>

          {/* Footer */}
          <div className="p-2 border-t bg-muted/50">
            <p className="text-xs text-muted-foreground text-center">
              Clique em um emoji para inserir
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
