/**
 * WhatsApp Connect API Route
 *
 * Processa o código de autorização do Meta Embedded Signup e:
 * 1. Troca o código por um access token via Meta Graph API
 * 2. Obtém informações do WhatsApp Business Account e Phone Number
 * 3. Salva a conexão criptografada no banco de dados
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

// Validação do input
const ConnectRequestSchema = z.object({
  code: z.string().min(1, 'Código de autorização é obrigatório'),
  organizationId: z.string().uuid('ID da organização inválido'),
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

export async function POST(request: NextRequest) {
  try {
    // Parse e valida body
    const body = await request.json();
    const validationResult = ConnectRequestSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        {
          success: false,
          error: 'Dados inválidos',
          details: validationResult.error.errors,
        },
        { status: 400 }
      );
    }

    const { code, organizationId } = validationResult.data;

    // Verifica se usuário tem acesso à organização
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Não autenticado' },
        { status: 401 }
      );
    }

    // Verifica se usuário pertence à organização
    const { data: userRecord } = (await supabase
      .from('users')
      .select('organization_id, role')
      .eq('id', user.id)
      .single()) as {
      data: { organization_id: string | null; role: string } | null;
    };

    if (!userRecord || userRecord.organization_id !== organizationId) {
      return NextResponse.json(
        { success: false, error: 'Acesso negado a esta organização' },
        { status: 403 }
      );
    }

    // Variáveis de ambiente
    const metaAppId = process.env.NEXT_PUBLIC_META_APP_ID;
    const metaAppSecret = process.env.META_APP_SECRET;
    const redirectUri = `${process.env.NEXT_PUBLIC_APP_URL}/auth/meta/callback`;

    if (!metaAppId || !metaAppSecret) {
      throw new Error('Meta App credentials não configuradas');
    }

    // PASSO 1: Trocar código por access token
    const tokenUrl = `https://graph.facebook.com/v21.0/oauth/access_token?client_id=${metaAppId}&client_secret=${metaAppSecret}&code=${code}&redirect_uri=${redirectUri}`;

    const tokenResponse = await fetch(tokenUrl, {
      method: 'GET',
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.json();
      console.error('Erro ao trocar código por token:', error);
      throw new Error(error.error?.message || 'Falha ao obter access token');
    }

    const tokenData = (await tokenResponse.json()) as MetaTokenResponse;
    const accessToken = tokenData.access_token;

    // PASSO 2: Debug token para obter WABA ID
    const debugTokenUrl = `https://graph.facebook.com/v21.0/debug_token?input_token=${accessToken}&access_token=${metaAppId}|${metaAppSecret}`;

    const debugResponse = await fetch(debugTokenUrl, {
      method: 'GET',
    });

    if (!debugResponse.ok) {
      throw new Error('Falha ao validar token');
    }

    const debugData = (await debugResponse.json()) as MetaDebugTokenResponse;

    // Encontrar o WABA ID nos granular_scopes
    const wabaScope = debugData.data.granular_scopes?.find((scope) =>
      scope.scope.includes('whatsapp_business_management')
    );

    if (!wabaScope || !wabaScope.target_ids || wabaScope.target_ids.length === 0) {
      throw new Error('WhatsApp Business Account ID não encontrado');
    }

    const wabaId = wabaScope.target_ids[0];

    if (!wabaId) {
      throw new Error('WhatsApp Business Account ID inválido');
    }

    // PASSO 3: Obter Phone Numbers do WABA
    const phoneNumbersUrl = `https://graph.facebook.com/v21.0/${wabaId}/phone_numbers?access_token=${accessToken}`;

    const phoneNumbersResponse = await fetch(phoneNumbersUrl, {
      method: 'GET',
    });

    if (!phoneNumbersResponse.ok) {
      throw new Error('Falha ao obter números de telefone');
    }

    const phoneNumbersData =
      (await phoneNumbersResponse.json()) as MetaPhoneNumberResponse;

    if (!phoneNumbersData.data || phoneNumbersData.data.length === 0) {
      throw new Error('Nenhum número de telefone encontrado nesta conta');
    }

    // Por enquanto, usar o primeiro número (futuramente pode permitir escolher)
    const phoneNumber = phoneNumbersData.data[0];

    if (!phoneNumber) {
      throw new Error('Nenhum número de telefone disponível');
    }

    // PASSO 4: Criptografar e salvar no banco
    const encryptedToken = encrypt(accessToken);
    const webhookVerifyToken = crypto.randomBytes(32).toString('hex');

    const repository = getWhatsAppConnectionRepository();

    const connection = await repository.create({
      organization_id: organizationId,
      waba_id: wabaId,
      phone_number_id: phoneNumber.id,
      phone_number: phoneNumber.display_phone_number,
      display_name: phoneNumber.verified_name,
      quality_rating: phoneNumber.quality_rating,
      access_token: encryptedToken,
      webhook_verify_token: webhookVerifyToken,
      is_active: true,
    });

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
        error:
          error instanceof Error
            ? error.message
            : 'Erro ao conectar WhatsApp. Tente novamente.',
      },
      { status: 500 }
    );
  }
}
