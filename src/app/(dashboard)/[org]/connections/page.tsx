/**
 * Connections Page
 *
 * Gerenciamento de conexões WhatsApp Business
 */

import { requireAuth } from '@/lib/auth/guards';
import { getWhatsAppConnectionRepository } from '@/lib/db/supabase/repositories/whatsapp_connection';
import { getOrganizationRepository } from '@/lib/db/supabase/repositories/organization';
import { redirect } from 'next/navigation';
import { ConnectionsList } from './components/connections-list';
import { ConnectWhatsAppButton } from './components/connect-whatsapp-button';

interface ConnectionsPageProps {
  params: Promise<{ org: string }>;
}

export default async function ConnectionsPage({
  params,
}: ConnectionsPageProps) {
  // Verificar autenticação
  await requireAuth();

  // Resolver params
  const { org: orgSlug } = await params;

  // Buscar organização
  const orgRepo = getOrganizationRepository();
  const organization = await orgRepo.findBySlug(orgSlug);

  if (!organization) {
    redirect('/unauthorized');
  }

  // Buscar conexões WhatsApp da organização
  const connectionRepo = getWhatsAppConnectionRepository();
  const connections = await connectionRepo.findByOrganizationId(organization.id);

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Conexões WhatsApp
          </h1>
          <p className="text-muted-foreground">
            Gerencie suas conexões com WhatsApp Business
          </p>
        </div>
        <ConnectWhatsAppButton organizationId={organization.id} />
      </div>

      <ConnectionsList connections={connections} />
    </div>
  );
}
