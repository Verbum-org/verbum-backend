import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type UserProgressDocument = UserProgress & Document;

@Schema({ timestamps: true })
export class UserProgress {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop()
  moduleId?: string;

  @Prop({ default: 0 })
  progress: number;

  @Prop({ default: 0 })
  timeSpent: number;

  @Prop({ default: false })
  isCompleted: boolean;

  @Prop()
  completedAt?: Date;

  @Prop()
  lastAccessedAt?: Date;

  @Prop({ type: Object, default: {} })
  metadata: Record<string, any>;

  @Prop()
  moodleProgressId?: number;
}

export const UserProgressSchema = SchemaFactory.createForClass(UserProgress);
