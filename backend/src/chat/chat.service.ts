import { Injectable } from '@nestjs/common';
import { MessageDto } from './dto/message.dto';

@Injectable()
export class ChatService {
  private messages: MessageDto[] = [];

  addMessage(message: MessageDto): MessageDto {
    message.timestamp = new Date();
    this.messages.push(message);
    
    // Keep only the last 100 messages
    if (this.messages.length > 100) {
      this.messages = this.messages.slice(-100);
    }
    
    return message;
  }

  getAllMessages(): MessageDto[] {
    return this.messages;
  }
}
