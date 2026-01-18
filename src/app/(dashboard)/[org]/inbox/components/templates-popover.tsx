/**
 * Templates Popover
 *
 * Lista de templates de mensagens rápidas
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { FileText, Search } from 'lucide-react';

// Templates mockados - será dinâmico no futuro
const MOCK_TEMPLATES = [
  {
    id: '1',
    name: 'Saudação',
    content:
      'Olá! Obrigado por entrar em contato. Como posso ajudá-lo(a) hoje?',
  },
  {
    id: '2',
    name: 'Informações sobre produtos',
    content:
      'Temos diversos produtos disponíveis. Você está procurando algo específico?',
  },
  {
    id: '3',
    name: 'Horário de atendimento',
    content:
      'Nosso horário de atendimento é de segunda a sexta, das 9h às 18h.',
  },
  {
    id: '4',
    name: 'Prazo de entrega',
    content:
      'O prazo de entrega varia de 3 a 7 dias úteis, dependendo da sua localização.',
  },
  {
    id: '5',
    name: 'Política de devolução',
    content:
      'Aceitamos devoluções em até 7 dias após o recebimento do produto.',
  },
  {
    id: '6',
    name: 'Agradecimento',
    content:
      'Obrigado pelo contato! Estamos à disposição para ajudá-lo(a).',
  },
];

interface TemplatesPopoverProps {
  onSelectTemplate: (content: string) => void;
  disabled?: boolean;
}

export function TemplatesPopover({
  onSelectTemplate,
  disabled,
}: TemplatesPopoverProps) {
  const [search, setSearch] = useState('');
  const [open, setOpen] = useState(false);

  const filteredTemplates = MOCK_TEMPLATES.filter(
    (template) =>
      template.name.toLowerCase().includes(search.toLowerCase()) ||
      template.content.toLowerCase().includes(search.toLowerCase())
  );

  const handleSelectTemplate = (content: string) => {
    onSelectTemplate(content);
    setOpen(false);
    setSearch('');
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
          <FileText className="h-4 w-4" />
          Templates
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="start">
        <div className="flex flex-col">
          {/* Header com busca */}
          <div className="p-3 border-b">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar templates..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 h-9"
              />
            </div>
          </div>

          {/* Lista de templates */}
          <ScrollArea className="h-[300px]">
            {filteredTemplates.length === 0 ? (
              <div className="p-4 text-center text-sm text-muted-foreground">
                Nenhum template encontrado
              </div>
            ) : (
              <div className="p-2">
                {filteredTemplates.map((template) => (
                  <button
                    key={template.id}
                    onClick={() => handleSelectTemplate(template.content)}
                    className="w-full text-left p-3 rounded-md hover:bg-accent transition-colors"
                  >
                    <div className="font-medium text-sm mb-1">
                      {template.name}
                    </div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {template.content}
                    </div>
                  </button>
                ))}
              </div>
            )}
          </ScrollArea>

          {/* Footer */}
          <div className="p-2 border-t bg-muted/50">
            <p className="text-xs text-muted-foreground text-center">
              {filteredTemplates.length} template(s) disponível(is)
            </p>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
