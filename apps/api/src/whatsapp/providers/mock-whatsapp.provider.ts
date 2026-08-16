import { Injectable, Logger } from '@nestjs/common';
import { IWhatsAppProvider, SendWhatsAppResponse } from './whatsapp.provider.interface';

@Injectable()
export class MockWhatsAppProvider implements IWhatsAppProvider {
  private readonly logger = new Logger(MockWhatsAppProvider.name);

  async sendMessage(toPhone: string, messageBody: string): Promise<SendWhatsAppResponse> {
    this.logger.log(`[MOCK WA SENT] To: ${toPhone} | Body: "${messageBody}"`);
    return {
      success: true,
      messageId: `mock_msg_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };
  }

  async sendTemplateMessage(
    toPhone: string,
    templateName: string,
    parameters: Record<string, string>,
  ): Promise<SendWhatsAppResponse> {
    this.logger.log(
      `[MOCK WA TEMPLATE] To: ${toPhone} | Template: ${templateName} | Params: ${JSON.stringify(parameters)}`,
    );
    return {
      success: true,
      messageId: `mock_tpl_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    };
  }
}
