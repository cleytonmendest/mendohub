/**
 * Conversation Options Menu
 *
 * Menu de opções para gerenciar a conversa
 */

'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MoreVertical,
  UserPlus,
  Archive,
  Trash2,
  Tag,
  BellOff,
  Flag,
} from 'lucide-react';

export function ConversationOptionsMenu() {
  const handleAssignToAgent = () => {
    // TODO: Implementar ao conectar com backend
    console.log('Atribuir a agente');
  };

  const handleAddTag = () => {
    // TODO: Implementar ao conectar com backend
    console.log('Adicionar tag');
  };

  const handleMarkAsImportant = () => {
    // TODO: Implementar ao conectar com backend
    console.log('Marcar como importante');
  };

  const handleMute = () => {
    // TODO: Implementar ao conectar com backend
    console.log('Silenciar notificações');
  };

  const handleArchive = () => {
    // TODO: Implementar ao conectar com backend
    console.log('Arquivar conversa');
  };

  const handleDelete = () => {
    // TODO: Implementar ao conectar com backend e confirmação
    console.log('Excluir conversa');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>Opções da conversa</DropdownMenuLabel>
        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleAssignToAgent}>
          <UserPlus className="mr-2 h-4 w-4" />
          <span>Atribuir a agente</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleAddTag}>
          <Tag className="mr-2 h-4 w-4" />
          <span>Adicionar tag</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleMarkAsImportant}>
          <Flag className="mr-2 h-4 w-4" />
          <span>Marcar como importante</span>
        </DropdownMenuItem>

        <DropdownMenuItem onClick={handleMute}>
          <BellOff className="mr-2 h-4 w-4" />
          <span>Silenciar notificações</span>
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={handleArchive}>
          <Archive className="mr-2 h-4 w-4" />
          <span>Arquivar</span>
        </DropdownMenuItem>

        <DropdownMenuItem
          onClick={handleDelete}
          className="text-destructive focus:text-destructive"
        >
          <Trash2 className="mr-2 h-4 w-4" />
          <span>Excluir conversa</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
