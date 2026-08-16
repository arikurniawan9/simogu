import { Module } from '@nestjs/common';
import { WhatsAppService } from './whatsapp.service';
import { WhatsAppController } from './whatsapp.controller';
import { MockWhatsAppProvider } from './providers/mock-whatsapp.provider';
import { CloudApiWhatsAppProvider } from './providers/cloud-api-whatsapp.provider';

@Module({
  controllers: [WhatsAppController],
  providers: [WhatsAppService, MockWhatsAppProvider, CloudApiWhatsAppProvider],
  exports: [WhatsAppService],
})
export class WhatsAppModule {}
