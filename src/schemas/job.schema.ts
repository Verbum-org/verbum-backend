import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type JobDocument = Job & Document;

@Schema({ timestamps: true })
export class Job {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  type: string;

  @Prop({ type: Object, required: true })
  data: Record<string, any>;

  @Prop({ default: 'pending' })
  status: string;

  @Prop()
  startedAt?: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  failedAt?: Date;

  @Prop()
  errorMessage?: string;

  @Prop({ default: 0 })
  attempts: number;

  @Prop({ default: 3 })
  maxAttempts: number;

  @Prop()
  nextAttemptAt?: Date;

  @Prop({ type: Object, default: {} })
  result?: Record<string, any>;
}

export const JobSchema = SchemaFactory.createForClass(Job);
