import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true, unique: true })
  email: string;

  @Prop({ required: true })
  password: string;

  @Prop({ unique: true, sparse: true })
  username?: string;

  @Prop({ required: true })
  firstName: string;

  @Prop({ required: true })
  lastName: string;

  @Prop()
  avatar?: string;

  @Prop({ default: true })
  isActive: boolean;

  @Prop({ default: false })
  isEmailVerified: boolean;

  @Prop()
  emailVerificationToken?: string;

  @Prop()
  passwordResetToken?: string;

  @Prop()
  passwordResetExpires?: Date;

  @Prop()
  lastLoginAt?: Date;

  @Prop({ type: [String], default: [] })
  roles: string[];

  @Prop({ type: [Object], default: [] })
  oauthProviders: Array<{
    provider: string;
    providerId: string;
    accessToken?: string;
    refreshToken?: string;
  }>;

  @Prop()
  moodleId?: number;

  @Prop({ type: Object, default: {} })
  preferences: Record<string, any>;
}

export const UserSchema = SchemaFactory.createForClass(User);
