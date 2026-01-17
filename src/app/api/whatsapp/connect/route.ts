/**
 * WhatsApp Connect API Route
 *
 * Processa o código de autorização do Meta Embedded Signup e:
 * 1. Troca o código por um access token via Meta Graph API
 * 2. Obtém informações do WhatsApp Business Account e Phone Number
 * 3. Salva a conexão criptografada no banco de dados
 *
 * IMPORTANTE - Meta Embedded Signup:
 * - O código é retornado via FB.login() (JavaScript), não via redirect
 * - Não precisamos de redirect_uri na troca do token
 * - O popup do Facebook gerencia toda a autenticação
 *
 * IMPORTANTE - Configuração do Webhook:
 * - Configure o webhook GLOBAL no Meta App Dashboard
 * - URL: https://seu-dominio.com/api/webhooks/whatsapp/global
 * - Verify Token: valor da variável WEBHOOK_VERIFY_TOKEN no .env
 * - O webhook global roteia mensagens automaticamente para cada conexão
 *
 * Fluxo do Meta Embedded Signup:
 * https://developers.facebook.com/docs/whatsapp/embedded-signup
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import crypto from 'crypto';
import { getWhatsAppConnectionRepository } from '@/lib/db/supabase/repositories/whatsapp_connection';
import { encrypt } from '@/lib/utils/crypto';
import { createClient } from '@/lib/db/supabase/server';

const ConnectRequestSchema = z.object({
  code: z.string().min(1),
  organizationId: z.string().uuid(),
});

// Tipos da resposta do Meta Graph API
interface MetaTokenResponse {
  access_token: string;
  token_type: string;
}

interface MetaDebugTokenResponse {
  data: {
    app_id: string;
    type: string;
    application: string;
    expires_at: number;
    is_valid: boolean;
    scopes: string[];
    granular_scopes: Array<{
      scope: string;
      target_ids: string[];
    }>;
  };
}

interface MetaPhoneNumberResponse {
  data: Array<{
    id: string;
    display_phone_number: string;
    verified_name: string;
    quality_rating: string;
  }>;
}

async function exchangeCodeForToken(
  code: string,
  appId: string,
  appSecret: string
): Promise<string> {
  const url = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${appId}&client_secret=${appSecret}&code=${code}`;
  const response = await fetch(url);

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error?.message || 'Falha ao obter access token');
  }

  const data = (await response.json()) as MetaTokenResponse;
  return data.access_token;
}

async function getWABAId(
  accessToken: string,
  appId: string,
  appSecret: string
): Promise<string> {
  const url = `https://graph.facebook.com/v21.0/debug_token?input_token=${accessToken}&access_token=${appId}|${appSecret}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Falha ao validar token');
  }

  const data = (await response.json()) as MetaDebugTokenResponse;
  const wabaScope = data.data.granular_scopes?.find((scope) =>
    scope.scope.includes('whatsapp_business_management')
  );

  if (!wabaScope?.target_ids?.[0]) {
    throw new Error('WhatsApp Business Account ID não encontrado');
  }

  return wabaScope.target_ids[0];
}

async function getPhoneNumber(
  wabaId: string,
  accessToken: string
): Promise<MetaPhoneNumberResponse['data'][0]> {
  const url = `https://graph.facebook.com/v21.0/${wabaId}/phone_numbers?access_token=${accessToken}`;
  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Falha ao obter números de telefone');
  }

  const data = (await response.json()) as MetaPhoneNumberResponse;

  if (!data.data?.[0]) {
    throw new Error('Nenhum número de telefone encontrado nesta conta');
  }

  return data.data[0];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, organizationId } = ConnectRequestSchema.parse(body);

    // Validar autenticação e permissão
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    const { data: userRecord } = (await supabase
      .from('users')
      .select('organization_id')
      .eq('id', user.id)
      .single()) as { data: { organization_id: string | null } | null };

    if (userRecord?.organization_id !== organizationId) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado a esta organização' },
        { status: 403 }
      );
    }

    const metaAppId = process.env.NEXT_PUBLIC_META_APP_ID;
    const metaAppSecret = process.env.META_APP_SECRET;

    if (!metaAppId || !metaAppSecret) {
      throw new Error('Meta App credentials não configuradas');
    }

    // Obter dados do WhatsApp via Meta API
    const accessToken = await exchangeCodeForToken(code, metaAppId, metaAppSecret);
    const wabaId = await getWABAId(accessToken, metaAppId, metaAppSecret);
    const phoneNumber = await getPhoneNumber(wabaId, accessToken);

    // Salvar conexão no banco
    const repository = getWhatsAppConnectionRepository();
    const connection = await repository.create({
      organization_id: organizationId,
      waba_id: wabaId,
      phone_number_id: phoneNumber.id,
      phone_number: phoneNumber.display_phone_number,
      display_name: phoneNumber.verified_name,
      quality_rating: phoneNumber.quality_rating,
      access_token: encrypt(accessToken),
      webhook_verify_token: crypto.randomBytes(32).toString('hex'),
      is_active: true,
    });

    console.log('Conexão WhatsApp criada:', connection.id);

    return NextResponse.json({
      success: true,
      data: {
        connectionId: connection.id,
        phoneNumber: connection.phone_number,
        displayName: connection.display_name,
      },
    });
  } catch (error) {
    console.error('Erro no connect WhatsApp:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Erro ao conectar WhatsApp',
      },
      { status: 500 }
    );
  }
}
