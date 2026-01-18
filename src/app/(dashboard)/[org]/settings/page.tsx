/**
 * Settings Page
 *
 * Configurações da organização
 */

import { getOrganizationRepository } from '@/lib/db/supabase/repositories/organization';
import { OrganizationForm } from './components/organization-form';
import { DefaultMessagesForm } from './components/default-messages-form';
import { BusinessHoursForm } from './components/business-hours-form';
import { Separator } from '@/components/ui/separator';

interface SettingsPageProps {
  params: Promise<{ org: string }>;
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { org: orgSlug } = await params;

  const orgRepo = getOrganizationRepository();
  const organization = await orgRepo.findBySlug(orgSlug);

  if (!organization) {
    return <div>Organização não encontrada</div>;
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Configurações</h1>
        <p className="text-muted-foreground">
          Gerencie as configurações da sua organização
        </p>
      </div>

      <div className="flex flex-col gap-8">
        {/* Dados da Organização */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Dados da Organização</h2>
            <p className="text-sm text-muted-foreground">
              Informações básicas da sua organização
            </p>
          </div>
          <OrganizationForm organization={organization} />
        </div>

        <Separator />

        {/* Horário de Atendimento */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Horário de Atendimento</h2>
            <p className="text-sm text-muted-foreground">
              Configure os dias e horários em que sua equipe está disponível
            </p>
          </div>
          <BusinessHoursForm organization={organization} />
        </div>

        <Separator />

        {/* Mensagens Padrão */}
        <div className="space-y-4">
          <div>
            <h2 className="text-xl font-semibold">Mensagens Padrão</h2>
            <p className="text-sm text-muted-foreground">
              Configure mensagens automáticas enviadas aos clientes
            </p>
          </div>
          <DefaultMessagesForm organization={organization} />
        </div>
      </div>
    </div>
  );
}
