import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class Message extends Document {
  @Prop({ required: true })
  content: string;

  @Prop({ required: true })
  sender: string;

  @Prop({ default: 'general' })
  room: string;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
