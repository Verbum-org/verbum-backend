import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type WebhookEventDocument = WebhookEvent & Document;

@Schema({ timestamps: true })
export class WebhookEvent {
  @Prop({ required: true })
  source: string;

  @Prop({ required: true })
  eventType: string;

  @Prop({ type: Object, required: true })
  payload: Record<string, any>;

  @Prop({ default: 'pending' })
  status: string;

  @Prop()
  processedAt?: Date;

  @Prop()
  errorMessage?: string;

  @Prop({ default: 0 })
  retryCount: number;

  @Prop()
  nextRetryAt?: Date;
}

export const WebhookEventSchema = SchemaFactory.createForClass(WebhookEvent);
