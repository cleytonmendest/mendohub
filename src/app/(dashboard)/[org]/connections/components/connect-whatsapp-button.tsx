/**
 * Connect WhatsApp Button
 *
 * Botão para iniciar o fluxo de conexão com WhatsApp Business
 * TODO: Implementar Meta Embedded Signup na próxima etapa
 */

'use client';

import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

interface ConnectWhatsAppButtonProps {
  organizationId: string;
}

export function ConnectWhatsAppButton({
  organizationId,
}: ConnectWhatsAppButtonProps) {
  const handleConnect = () => {
    // TODO: Implementar Meta Embedded Signup
    console.log('Conectar WhatsApp para org:', organizationId);
    alert('Meta Embedded Signup será implementado na próxima etapa!');
  };

  return (
    <Button onClick={handleConnect} size="lg">
      <Plus className="h-5 w-5 mr-2" />
      Conectar WhatsApp
    </Button>
  );
}
