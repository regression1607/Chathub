import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({ timestamps: true })
export class User {
  @Prop({ required: true })
  username: string;

  @Prop({ default: true })
  isOnline: boolean;

  @Prop({ default: Date.now })
  lastSeen: Date;

  _id:string;
}

export const UserSchema = SchemaFactory.createForClass(User);
