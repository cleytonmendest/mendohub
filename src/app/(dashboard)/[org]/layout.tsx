/**
 * Organization Dashboard Layout
 *
 * Layout compartilhado por todas as páginas da dashboard da organização
 */

import { requireAuth, canAccessOrganization } from '@/lib/auth/guards';
import { getOrganizationRepository } from '@/lib/db/supabase/repositories/organization';
import { redirect } from 'next/navigation';
import { DashboardSidebar } from './components/dashboard-sidebar';
import { DashboardHeader } from './components/dashboard-header';

interface OrgLayoutProps {
  children: React.ReactNode;
  params: Promise<{ org: string }>;
}

export default async function OrgLayout({ children, params }: OrgLayoutProps) {
  await requireAuth();

  const { org: orgSlug } = await params;

  const orgRepo = getOrganizationRepository();
  const organization = await orgRepo.findBySlug(orgSlug);

  if (!organization) {
    redirect('/unauthorized');
  }

  const hasAccess = await canAccessOrganization(organization.id);

  if (!hasAccess) {
    redirect('/unauthorized');
  }

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Sidebar */}
      <DashboardSidebar organizationSlug={orgSlug} organizationName={organization.name} />

      {/* Main content */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Header */}
        <DashboardHeader organizationName={organization.name} />

        {/* Page content */}
        <main className="flex-1 overflow-y-auto bg-muted/20 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
