import {
    WebSocketGateway,
    SubscribeMessage,
    MessageBody,
    WebSocketServer,
    ConnectedSocket,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { ChatService } from './chat.service';
  import { UsersService } from '../users/users.service';
  import { MessageDto } from './dto/message.dto';
  import { JoinRoomDto } from './dto/join-room.dto';
  
  @WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
  export class ChatGateway {
    @WebSocketServer() server: Server;
    
    constructor(
      private readonly chatService: ChatService,
      private readonly usersService: UsersService,
    ) {}
  
    @SubscribeMessage('join')
    async handleJoin(
      @MessageBody() joinRoomDto: JoinRoomDto,
      @ConnectedSocket() client: Socket,
    ): Promise<void> {
      // Create or update user
      const user = await this.usersService.create({ username: joinRoomDto.username });
      
      // Store user ID in the socket
      client.data.userId = user._id;
      client.data.username = user.username;
      
      // Notify others about new user
      this.server.emit('userJoined', {
        id: user._id,
        username: user.username,
      });
      
      // Send all existing messages to the new user
      client.emit('previousMessages', this.chatService.getAllMessages());
    }
  
    @SubscribeMessage('sendMessage')
    handleMessage(
      @MessageBody() messageDto: MessageDto,
      @ConnectedSocket() client: Socket,
    ): void {
      const message = this.chatService.addMessage(messageDto);
      this.server.emit('newMessage', message);
    }
  
    async handleDisconnect(@ConnectedSocket() client: Socket) {
      if (client.data.userId) {
        await this.usersService.setUserOffline(client.data.userId);
        this.server.emit('userLeft', {
          username: client.data.username,
        });
      }
    }
  }