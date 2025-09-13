import { Process, Processor } from '@nestjs/bull';
import { Logger } from '@nestjs/common';

@Processor('report')
export class ReportProcessor {
  private readonly logger = new Logger(ReportProcessor.name);

  @Process('generate')
  async processReportGeneration(job: any) {
    this.logger.log('Processing report generation job...');
    // Implementation will be added later
  }
}
