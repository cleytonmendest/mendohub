/**
 * WhatsApp API Service
 *
 * Client para Meta Graph API (WhatsApp Business API)
 * Envia mensagens de texto via WhatsApp
 */

import { getWhatsAppConnectionRepository } from '@/lib/db/supabase/repositories/whatsapp_connection';
import { decrypt } from '@/lib/utils/crypto';

export class WhatsAppApiService {
  private readonly apiVersion = 'v21.0';
  private readonly baseUrl = 'https://graph.facebook.com';

  /**
   * Envia mensagem de texto via WhatsApp
   *
   * @param params - Parâmetros da mensagem
   * @returns WAMID (WhatsApp Message ID)
   */
  async sendMessage(params: {
    connectionId: string;
    to: string; // formato: +5511999998888
    text: string;
  }): Promise<string> {
    const { connectionId, to, text } = params;

    // 1. Buscar connection do banco
    const connectionRepo = getWhatsAppConnectionRepository();
    const connection = await connectionRepo.findById(connectionId);

    if (!connection) {
      throw new Error(`WhatsApp connection not found: ${connectionId}`);
    }

    // 2. Decrypt access token
    const accessToken = decrypt(connection.access_token);

    // 3. Chamar Meta Graph API
    const url = `${this.baseUrl}/${this.apiVersion}/${connection.phone_number_id}/messages`;

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: to.replace('+', ''), // Remove + do número
        type: 'text',
        text: {
          body: text,
        },
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        `WhatsApp API error: ${errorData.error?.message || response.statusText}`
      );
    }

    const data = await response.json();

    // 4. Retornar WAMID
    const wamid = data.messages?.[0]?.id;

    if (!wamid) {
      throw new Error('WhatsApp API did not return message ID');
    }

    return wamid;
  }
}

/**
 * Factory function para obter o service
 */
export function getWhatsAppService(): WhatsAppApiService {
  return new WhatsAppApiService();
}
