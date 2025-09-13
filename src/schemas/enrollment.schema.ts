import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type EnrollmentDocument = Enrollment & Document;

@Schema({ timestamps: true })
export class Enrollment {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Course', required: true })
  courseId: Types.ObjectId;

  @Prop({ default: 'active' })
  status: string;

  @Prop()
  enrolledAt: Date;

  @Prop()
  completedAt?: Date;

  @Prop()
  moodleEnrollmentId?: number;
}

export const EnrollmentSchema = SchemaFactory.createForClass(Enrollment);
