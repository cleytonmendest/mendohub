/**
 * Organization Dashboard Page
 *
 * Visão geral da organização com métricas e estatísticas
 */

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { getWhatsAppConnectionRepository } from '@/lib/db/supabase/repositories/whatsapp_connection';
import { getOrganizationRepository } from '@/lib/db/supabase/repositories/organization';
import { MessageSquare, Link as LinkIcon, Users, TrendingUp } from 'lucide-react';

interface DashboardPageProps {
  params: Promise<{ org: string }>;
}

export default async function DashboardPage({ params }: DashboardPageProps) {
  const { org: orgSlug } = await params;

  // Buscar dados da organização
  const orgRepo = getOrganizationRepository();
  const organization = await orgRepo.findBySlug(orgSlug);

  if (!organization) {
    return <div>Organização não encontrada</div>;
  }

  // Buscar conexões WhatsApp
  const connectionRepo = getWhatsAppConnectionRepository();
  const connections = await connectionRepo.findByOrganizationId(organization.id);

  const activeConnections = connections.filter((c) => c.is_active);

  // TODO (Semana 5-6): Buscar métricas reais
  const stats = {
    totalMessages: 0,
    totalConversations: 0,
    activeUsers: connections.length,
    responseRate: 0,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Visão geral da sua operação no WhatsApp Business
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conexões Ativas</CardTitle>
            <LinkIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeConnections.length}</div>
            <p className="text-xs text-muted-foreground">
              {connections.length} total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Conversas</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalConversations}</div>
            <p className="text-xs text-muted-foreground">
              +0% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mensagens</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalMessages}</div>
            <p className="text-xs text-muted-foreground">
              +0% em relação ao mês passado
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Taxa de Resposta</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.responseRate}%</div>
            <p className="text-xs text-muted-foreground">
              Média de tempo de resposta
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Connection Status */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Status das Conexões</CardTitle>
            <CardDescription>
              Suas conexões WhatsApp Business
            </CardDescription>
          </CardHeader>
          <CardContent>
            {connections.length === 0 ? (
              <div className="text-center py-6 text-muted-foreground">
                <LinkIcon className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhuma conexão configurada</p>
                <p className="text-sm">Conecte sua primeira conta WhatsApp Business</p>
              </div>
            ) : (
              <div className="space-y-4">
                {connections.map((connection) => (
                  <div
                    key={connection.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0"
                  >
                    <div>
                      <p className="font-medium">{connection.display_name || connection.phone_number}</p>
                      <p className="text-sm text-muted-foreground">
                        {connection.phone_number}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          connection.is_active ? 'bg-green-500' : 'bg-red-500'
                        }`}
                      />
                      <span className="text-sm text-muted-foreground">
                        {connection.is_active ? 'Ativa' : 'Inativa'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Primeiros Passos</CardTitle>
            <CardDescription>
              Configure sua operação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <div className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-medium ${
                  connections.length > 0 ? 'bg-green-500 text-white' : 'bg-muted text-muted-foreground'
                }`}>
                  {connections.length > 0 ? '✓' : '1'}
                </div>
                <div>
                  <p className="font-medium">Conectar WhatsApp Business</p>
                  <p className="text-sm text-muted-foreground">
                    Configure sua primeira conexão
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
                  2
                </div>
                <div>
                  <p className="font-medium">Configurar Workflows</p>
                  <p className="text-sm text-muted-foreground">
                    Automatize respostas e processos
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="h-6 w-6 rounded-full bg-muted text-muted-foreground flex items-center justify-center text-xs font-medium">
                  3
                </div>
                <div>
                  <p className="font-medium">Adicionar Equipe</p>
                  <p className="text-sm text-muted-foreground">
                    Convide membros para atender clientes
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
