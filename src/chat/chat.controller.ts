import { Controller, Get, Param } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Get('messages')
  async getMessages() {
    return this.chatService.getRecentMessages();
  }

  @Get('users')
  async getUsers() {
    return this.chatService.getOnlineUsers();
  }
}