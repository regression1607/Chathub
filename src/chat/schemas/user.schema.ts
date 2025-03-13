import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

@Schema({ timestamps: true })
export class User extends Document {
  @Prop({ required: true })
  name: string;

  @Prop()
  socketId: string;

  @Prop({ default: true })
  isOnline: boolean;
}

export const UserSchema = SchemaFactory.createForClass(User);
