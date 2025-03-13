import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Message } from './schemas/message.schema';
import { User } from './schemas/user.schema';

@Injectable()
export class ChatService {
  constructor(
    @InjectModel(Message.name) private messageModel: Model<Message>,
    @InjectModel(User.name) private userModel: Model<User>,
  ) {}

  async registerUser(name: string, socketId: string): Promise<User> {
    return this.userModel.findOneAndUpdate(
      { name },
      { socketId, isOnline: true },
      { upsert: true, new: true },
    );
  }

  async handleDisconnect(socketId: string): Promise<void> {
    await this.userModel.findOneAndUpdate(
      { socketId },
      { isOnline: false },
    );
  }

  async getOnlineUsers(): Promise<User[]> {
    return this.userModel.find({ isOnline: true }).exec();
  }

  async saveMessage(messageData: { sender: string; content: string; room?: string }): Promise<Message> {
    const newMessage = new this.messageModel(messageData);
    return newMessage.save();
  }

  async getRecentMessages(limit = 50): Promise<Message[]> {
    return this.messageModel
      .find()
      .sort({ createdAt: -1 })
      .limit(limit)
      .exec();
  }
}