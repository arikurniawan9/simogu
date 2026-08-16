export interface SendWhatsAppResponse {
  success: boolean;
  messageId?: string;
  error?: string;
}

export interface IWhatsAppProvider {
  sendMessage(toPhone: string, messageBody: string): Promise<SendWhatsAppResponse>;
  sendTemplateMessage(
    toPhone: string,
    templateName: string,
    parameters: Record<string, string>,
  ): Promise<SendWhatsAppResponse>;
}
