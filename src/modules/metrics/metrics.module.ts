import { Module } from '@nestjs/common';
import { PrometheusModule } from '@willsoto/nestjs-prometheus';
import { MetricsController } from './metrics.controller';
import { MetricsService } from './metrics.service';

@Module({
  imports: [PrometheusModule],
  controllers: [MetricsController],
  providers: [MetricsService],
  exports: [],
})
export class MetricsModule {}
