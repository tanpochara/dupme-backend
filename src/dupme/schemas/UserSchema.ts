import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema()
export class User {
  @Prop()
  socketId: string;

  @Prop()
  points: number;
}

export const UserSchema = SchemaFactory.createForClass(User);
