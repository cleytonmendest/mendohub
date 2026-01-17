/**
 * Dashboard Header
 *
 * Header superior da dashboard com informações do usuário e logout
 */

'use client';

import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { createClient } from '@/lib/db/supabase/client';
import { useState } from 'react';

interface DashboardHeaderProps {
  organizationName: string;
}

export function DashboardHeader({ organizationName }: DashboardHeaderProps) {
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    try {
      setIsLoggingOut(true);
      const supabase = createClient();
      await supabase.auth.signOut();
      router.push('/login');
      router.refresh();
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
      setIsLoggingOut(false);
    }
  };

  return (
    <header className="flex h-16 items-center justify-between border-b bg-card px-6">
      <div>
        <p className="text-sm text-muted-foreground">Organização</p>
        <h1 className="text-lg font-semibold">{organizationName}</h1>
      </div>

      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          disabled={isLoggingOut}
        >
          <LogOut className="h-4 w-4 mr-2" />
          {isLoggingOut ? 'Saindo...' : 'Sair'}
        </Button>
      </div>
    </header>
  );
}
