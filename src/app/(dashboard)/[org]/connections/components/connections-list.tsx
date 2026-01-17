/**
 * Connections List Component
 *
 * Exibe lista de conexões WhatsApp Business
 */

import type { WhatsAppConnection } from '@/lib/db/repositories/whatsapp_connection';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Phone, Circle } from 'lucide-react';

interface ConnectionsListProps {
  connections: WhatsAppConnection[];
}

export function ConnectionsList({ connections }: ConnectionsListProps) {
  if (connections.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Phone className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            Nenhuma conexão encontrada
          </h3>
          <p className="text-sm text-muted-foreground text-center max-w-sm">
            Conecte sua conta WhatsApp Business para começar a enviar e receber
            mensagens
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {connections.map((connection) => (
        <Card key={connection.id}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5" />
                {connection.display_name || connection.phone_number}
              </CardTitle>
              <Badge
                variant={connection.is_active ? 'default' : 'secondary'}
                className="gap-1"
              >
                <Circle
                  className="h-2 w-2 fill-current"
                  strokeWidth={0}
                />
                {connection.is_active ? 'Ativa' : 'Inativa'}
              </Badge>
            </div>
            <CardDescription>{connection.phone_number}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm space-y-1">
              {connection.quality_rating && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Qualidade:</span>
                  <span className="font-medium capitalize">
                    {connection.quality_rating}
                  </span>
                </div>
              )}
              {connection.connected_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Conectado em:</span>
                  <span className="font-medium">
                    {new Date(connection.connected_at).toLocaleDateString(
                      'pt-BR'
                    )}
                  </span>
                </div>
              )}
              {connection.last_webhook_at && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Último webhook:</span>
                  <span className="font-medium">
                    {new Date(connection.last_webhook_at).toLocaleDateString(
                      'pt-BR'
                    )}
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
