/**
 * Connect WhatsApp Button
 *
 * Botão para iniciar o fluxo de conexão com WhatsApp Business via Meta Embedded Signup
 *
 * Fluxo:
 * 1. Usuário clica no botão
 * 2. SDK do Facebook abre popup de autenticação
 * 3. Usuário autoriza conexão com WhatsApp Business
 * 4. Recebemos código de autorização
 * 5. Enviamos código para API que troca por access token
 */

'use client';

import { Button } from '@/components/ui/button';
import { Plus, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ConnectWhatsAppButtonProps {
  organizationId: string;
}

// Tipos do Facebook SDK
declare global {
  interface Window {
    fbAsyncInit?: () => void;
    FB?: {
      init: (params: {
        appId: string;
        autoLogAppEvents: boolean;
        xfbml: boolean;
        version: string;
      }) => void;
      login: (
        callback: (response: {
          authResponse?: {
            code: string;
          };
          status: string;
        }) => void,
        options: { config_id: string; response_type: string; override_default_response_type: boolean }
      ) => void;
    };
  }
}

export function ConnectWhatsAppButton({
  organizationId,
}: ConnectWhatsAppButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isSdkLoaded, setIsSdkLoaded] = useState(false);

  const metaAppId = process.env.NEXT_PUBLIC_META_APP_ID;
  const metaConfigId = process.env.NEXT_PUBLIC_META_CONFIG_ID;

  // Carregar SDK do Facebook
  useEffect(() => {
    if (!metaAppId || !metaConfigId) {
      console.warn('Meta App ID ou Config ID não configurado');
      return;
    }

    // Evitar carregar SDK múltiplas vezes
    if (window.FB) {
      setIsSdkLoaded(true);
      return;
    }

    // Configurar callback de inicialização
    window.fbAsyncInit = function () {
      window.FB?.init({
        appId: metaAppId,
        autoLogAppEvents: true,
        xfbml: true,
        version: 'v21.0',
      });
      setIsSdkLoaded(true);
    };

    // Carregar SDK
    const script = document.createElement('script');
    script.src = 'https://connect.facebook.net/en_US/sdk.js';
    script.async = true;
    script.defer = true;
    script.crossOrigin = 'anonymous';
    document.body.appendChild(script);

    return () => {
      // Cleanup
      if (script.parentNode) {
        script.parentNode.removeChild(script);
      }
    };
  }, [metaAppId, metaConfigId]);

  const handleConnect = () => {
    if (!metaAppId || !metaConfigId) {
      alert('Configuração do Meta App não encontrada. Verifique as variáveis de ambiente.');
      return;
    }

    if (!window.FB) {
      alert('SDK do Facebook ainda não carregou. Aguarde um momento e tente novamente.');
      return;
    }

    setIsLoading(true);

    // Lançar Meta Embedded Signup
    window.FB.login(
      (response) => {
        if (response.authResponse?.code) {
          // Código de autorização recebido - processar de forma assíncrona
          handleAuthResponse(response.authResponse.code);
        } else {
          // Usuário cancelou ou erro
          console.log('Conexão cancelada ou erro:', response);
          setIsLoading(false);
        }
      },
      {
        config_id: metaConfigId,
        response_type: 'code',
        override_default_response_type: true,
      }
    );
  };

  const handleAuthResponse = async (code: string) => {
    try {
      const apiResponse = await fetch('/api/whatsapp/connect', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          code,
          organizationId,
        }),
      });

      if (!apiResponse.ok) {
        const error = await apiResponse.json();
        throw new Error(error.error || 'Falha ao conectar WhatsApp');
      }

      // Sucesso - recarregar página para mostrar nova conexão
      router.refresh();
    } catch (error) {
      console.error('Erro ao processar conexão:', error);
      alert(
        error instanceof Error
          ? error.message
          : 'Erro ao conectar WhatsApp. Tente novamente.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const isDisabled = !metaAppId || !metaConfigId || !isSdkLoaded || isLoading;

  return (
    <Button onClick={handleConnect} size="lg" disabled={isDisabled}>
      {isLoading ? (
        <>
          <Loader2 className="h-5 w-5 mr-2 animate-spin" />
          Conectando...
        </>
      ) : (
        <>
          <Plus className="h-5 w-5 mr-2" />
          Conectar WhatsApp
        </>
      )}
    </Button>
  );
}
