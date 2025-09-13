import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type CourseDocument = Course & Document;

@Schema({ timestamps: true })
export class Course {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  shortName: string;

  @Prop()
  description?: string;

  @Prop()
  imageUrl?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop()
  moodleId?: number;

  @Prop()
  moodleShortName?: string;

  @Prop()
  moodleFullName?: string;

  @Prop()
  moodleCategoryId?: number;

  @Prop()
  moodleStartDate?: Date;

  @Prop()
  moodleEndDate?: Date;

  @Prop({ type: [Object], default: [] })
  modules: Array<{
    id: string;
    name: string;
    type: string;
    url?: string;
    content?: string;
    isVisible: boolean;
    moodleId?: number;
  }>;
}

export const CourseSchema = SchemaFactory.createForClass(Course);
