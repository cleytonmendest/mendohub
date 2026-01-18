/**
 * Contact Info Popover
 *
 * Mostra informações detalhadas do contato
 */

'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { User, Phone, Mail, MapPin, Tag } from 'lucide-react';
import type { Conversation } from '../mock-data';

interface ContactInfoPopoverProps {
  conversation: Conversation;
}

export function ContactInfoPopover({ conversation }: ContactInfoPopoverProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <User className="h-4 w-4" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80" align="end">
        <div className="space-y-4">
          {/* Header com avatar e nome */}
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-20 w-20">
              <AvatarImage
                src={conversation.customerProfilePicUrl || undefined}
              />
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {getInitials(conversation.customerName)}
              </AvatarFallback>
            </Avatar>
            <div className="text-center">
              <h3 className="font-semibold text-lg">
                {conversation.customerName}
              </h3>
              <p className="text-sm text-muted-foreground">Cliente</p>
            </div>
          </div>

          <Separator />

          {/* Informações de contato */}
          <div className="space-y-3">
            <div className="flex items-center gap-3 text-sm">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <span>{conversation.customerPhone}</span>
            </div>

            {/* Email mockado - será dinâmico no futuro */}
            <div className="flex items-center gap-3 text-sm">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Não informado</span>
            </div>

            {/* Localização mockada */}
            <div className="flex items-center gap-3 text-sm">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Não informado</span>
            </div>

            {/* Tags mockadas */}
            <div className="flex items-center gap-3 text-sm">
              <Tag className="h-4 w-4 text-muted-foreground" />
              <span className="text-muted-foreground">Sem tags</span>
            </div>
          </div>

          <Separator />

          {/* Estatísticas mockadas - será dinâmico no futuro */}
          <div className="grid grid-cols-2 gap-4 text-center">
            <div>
              <p className="text-2xl font-semibold">12</p>
              <p className="text-xs text-muted-foreground">Mensagens</p>
            </div>
            <div>
              <p className="text-2xl font-semibold">1</p>
              <p className="text-xs text-muted-foreground">Conversas</p>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  );
}
