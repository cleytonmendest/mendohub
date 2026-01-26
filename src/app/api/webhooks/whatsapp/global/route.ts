/**
 * WhatsApp Webhook Global
 *
 * Webhook genérico configurado no Meta App Dashboard
 * Roteia mensagens para a conexão correta baseado no phone_number_id
 */

import { NextRequest, NextResponse } from 'next/server';
import { getWhatsAppConnectionRepository } from '@/lib/db/supabase/repositories/whatsapp_connection';
import { getMessageProcessor } from '@/lib/services/whatsapp/message-processor';

const VERIFY_TOKEN = process.env.WEBHOOK_VERIFY_TOKEN || 'mendo_webhook_2025';

async function processMessages(messages: any[], connectionId: string, organizationId: string) {
  const processor = getMessageProcessor();

  for (const message of messages) {
    console.log('Mensagem recebida:', {
      connectionId,
      from: message.from,
      type: message.type,
      id: message.id,
    });

    try {
      await processor.processIncomingMessage({
        message,
        connectionId,
        organizationId,
      });
    } catch (error) {
      console.error('Erro ao processar mensagem:', error);
      // Continuar processando outras mensagens
    }
  }
}

function processStatuses(statuses: any[], connectionId: string) {
  for (const status of statuses) {
    console.log('Status de mensagem:', {
      connectionId,
      id: status.id,
      status: status.status,
    });

    // TODO (Semana 5-6): Atualizar status no banco
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const mode = searchParams.get('hub.mode');
  const token = searchParams.get('hub.verify_token');
  const challenge = searchParams.get('hub.challenge');

  if (mode !== 'subscribe' || token !== VERIFY_TOKEN || !challenge) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return new NextResponse(challenge, {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
  });
}

export async function POST(request: NextRequest) {
  const start = performance.now();

  try {
    const body = await request.json();

    if (body.object !== 'whatsapp_business_account' || !Array.isArray(body.entry)) {
      return NextResponse.json({ received: true });
    }

    const repository = getWhatsAppConnectionRepository();

    for (const entry of body.entry) {
      if (!Array.isArray(entry.changes)) continue;

      for (const change of entry.changes) {
        if (change.field !== 'messages') continue;

        const phoneNumberId = change.value?.metadata?.phone_number_id;
        if (!phoneNumberId) continue;

        const connection = await repository.findByPhoneNumberId(phoneNumberId);
        if (!connection) {
          console.warn('Conexão não encontrada:', phoneNumberId);
          continue;
        }

        if (change.value.messages) {
          await processMessages(change.value.messages, connection.id, connection.organization_id);
        }

        if (change.value.statuses) {
          processStatuses(change.value.statuses, connection.id);
        }
      }
    }

    const duration = performance.now() - start;
    if (duration > 2000) {
      console.warn('⚠️ Webhook lento:', `${duration.toFixed(2)}ms`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Erro no webhook global:', error);
    return NextResponse.json({ received: true });
  }
}
