import { Injectable, Logger } from '@nestjs/common';
import { IWhatsAppProvider, SendWhatsAppResponse } from './whatsapp.provider.interface';

@Injectable()
export class CloudApiWhatsAppProvider implements IWhatsAppProvider {
  private readonly logger = new Logger(CloudApiWhatsAppProvider.name);

  async sendMessage(toPhone: string, messageBody: string): Promise<SendWhatsAppResponse> {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const apiVersion = process.env.WHATSAPP_API_VERSION || 'v18.0';

    if (!token || !phoneId) {
      this.logger.warn('WhatsApp Cloud API Credentials not configured, falling back to mock mode');
      return {
        success: true,
        messageId: `mock_fallback_${Date.now()}`,
      };
    }

    try {
      const url = `https://graph.facebook.com/${apiVersion}/${phoneId}/messages`;
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messaging_product: 'whatsapp',
          recipient_type: 'individual',
          to: toPhone,
          type: 'text',
          text: { preview_url: false, body: messageBody },
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        return {
          success: false,
          error: data.error?.message || 'Gagal mengirim pesan WhatsApp via Cloud API',
        };
      }

      return {
        success: true,
        messageId: data.messages?.[0]?.id,
      };
    } catch (err: any) {
      return {
        success: false,
        error: err.message || 'Kesalahan koneksi Meta Graph API',
      };
    }
  }

  async sendTemplateMessage(
    toPhone: string,
    templateName: string,
    parameters: Record<string, string>,
  ): Promise<SendWhatsAppResponse> {
    return this.sendMessage(
      toPhone,
      `Pemberitahuan Kehadiran: Status mengajar Anda telah tercatat (${JSON.stringify(parameters)})`,
    );
  }
}
