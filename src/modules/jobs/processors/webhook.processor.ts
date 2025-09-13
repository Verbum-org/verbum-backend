import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';

@Processor('webhook')
export class WebhookProcessor {
  private readonly logger = new Logger(WebhookProcessor.name);

  @Process('event')
  async processWebhookEvent(job: any) {
    this.logger.log('Processing webhook event job...');
    // Implementation will be added later
  }
}
