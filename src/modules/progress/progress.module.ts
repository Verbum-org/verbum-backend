import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { UserProgress, UserProgressSchema } from '../../schemas/user-progress.schema';
import { ProgressController } from './progress.controller';
import { ProgressService } from './progress.service';

@Module({
  imports: [MongooseModule.forFeature([{ name: UserProgress.name, schema: UserProgressSchema }])],
  controllers: [ProgressController],
  providers: [ProgressService],
  exports: [],
})
export class ProgressModule {}
