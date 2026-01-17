/**
 * Connections Page
 *
 * Gerenciamento de conexões WhatsApp Business
 */

import { getWhatsAppConnectionRepository } from '@/lib/db/supabase/repositories/whatsapp_connection';
import { getOrganizationRepository } from '@/lib/db/supabase/repositories/organization';
import { ConnectionsList } from './components/connections-list';
import { ConnectWhatsAppButton } from './components/connect-whatsapp-button';

interface ConnectionsPageProps {
  params: Promise<{ org: string }>;
}

export default async function ConnectionsPage({
  params,
}: ConnectionsPageProps) {
  const { org: orgSlug } = await params;

  const orgRepo = getOrganizationRepository();
  const organization = await orgRepo.findBySlug(orgSlug);

  if (!organization) {
    return <div>Organização não encontrada</div>;
  }

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
