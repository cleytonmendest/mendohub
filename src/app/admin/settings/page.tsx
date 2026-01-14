/**
 * Admin Settings Page
 *
 * Página para configurações da plataforma.
 * Protegido pelo layout admin (requirePlatformAdmin).
 */

import { requirePlatformAdmin } from '@/lib/auth/guards';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Database,
  Mail,
} from 'lucide-react';

export const metadata = {
  title: 'Configurações - Admin - MendoHub',
  description: 'Configurações da plataforma',
};

export default async function AdminSettingsPage() {
  const { admin } = await requirePlatformAdmin();

  const settingsSections = [
    {
      name: 'Geral',
      description: 'Configurações gerais da plataforma',
      icon: SettingsIcon,
      href: '#general',
    },
    {
      name: 'Notificações',
      description: 'Configurar notificações e alertas',
      icon: Bell,
      href: '#notifications',
    },
    {
      name: 'Segurança',
      description: 'Políticas de segurança e acesso',
      icon: Shield,
      href: '#security',
    },
    {
      name: 'Integrações',
      description: 'APIs e webhooks externos',
      icon: Database,
      href: '#integrations',
    },
    {
      name: 'Email',
      description: 'Configurações de envio de email',
      icon: Mail,
      href: '#email',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Configurações</h1>
        <p className="mt-1 text-sm text-gray-500">
          Gerencie as configurações da plataforma
        </p>
      </div>

      {/* Admin Info Card */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Informações do Admin
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <p className="text-sm font-medium text-gray-500">Nome</p>
            <p className="mt-1 text-sm text-gray-900">{admin.full_name}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Role</p>
            <p className="mt-1 text-sm text-gray-900">{admin.role}</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Status</p>
            <span
              className={`mt-1 inline-flex rounded-full px-2 py-1 text-xs font-medium ${
                admin.is_active
                  ? 'bg-green-100 text-green-800'
                  : 'bg-red-100 text-red-800'
              }`}
            >
              {admin.is_active ? 'Ativo' : 'Inativo'}
            </span>
          </div>
        </div>
      </div>

      {/* Settings Sections */}
      <div className="grid gap-6 sm:grid-cols-2">
        {settingsSections.map((section) => {
          const Icon = section.icon;
          return (
            <a
              key={section.name}
              href={section.href}
              className="group rounded-lg border border-gray-200 bg-white p-6 transition-colors hover:border-blue-300 hover:bg-blue-50"
            >
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-lg bg-blue-50 transition-colors group-hover:bg-blue-100">
                  <Icon className="h-6 w-6 text-blue-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-base font-semibold text-gray-900">
                    {section.name}
                  </h3>
                  <p className="mt-1 text-sm text-gray-500">
                    {section.description}
                  </p>
                </div>
              </div>
            </a>
          );
        })}
      </div>

      {/* Platform Info */}
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-semibold text-gray-900">
          Informações da Plataforma
        </h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <div>
            <p className="text-sm font-medium text-gray-500">Versão</p>
            <p className="mt-1 text-sm text-gray-900">v1.0.0</p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Ambiente</p>
            <p className="mt-1 text-sm text-gray-900">
              {process.env.NODE_ENV === 'production'
                ? 'Produção'
                : 'Desenvolvimento'}
            </p>
          </div>
          <div>
            <p className="text-sm font-medium text-gray-500">Database</p>
            <p className="mt-1 text-sm text-gray-900">Supabase PostgreSQL</p>
          </div>
        </div>
      </div>
    </div>
  );
}
