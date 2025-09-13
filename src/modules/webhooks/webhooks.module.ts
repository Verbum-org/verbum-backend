import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { WebhookEvent, WebhookEventSchema } from '../../schemas/webhook-event.schema';
import { WebhooksController } from './webhooks.controller';
import { WebhooksService } from './webhooks.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: WebhookEvent.name, schema: WebhookEventSchema }])],
  controllers: [WebhooksController],
  providers: [WebhooksService],
  exports: [],
})
export class WebhooksModule {}
