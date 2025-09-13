import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { MoodleAdapterController } from './moodle-adapter.controller';
import { MoodleAdapterService } from './moodle-adapter.service';

@Module({
  imports: [
    ConfigModule,
    HttpModule.register({
      timeout: 30000, // 30 seconds timeout
      maxRedirects: 5,
    }),
  ],
  controllers: [MoodleAdapterController],
  providers: [MoodleAdapterService],
  exports: [MoodleAdapterService],
})
export class MoodleAdapterModule {}
