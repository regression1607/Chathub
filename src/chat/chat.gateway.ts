// chat/chat.gateway.ts
import {
    WebSocketGateway,
    WebSocketServer,
    SubscribeMessage,
    OnGatewayConnection,
    OnGatewayDisconnect,
  } from '@nestjs/websockets';
  import { Server, Socket } from 'socket.io';
  import { ChatService } from './chat.service';
  
  @WebSocketGateway({
    cors: {
      origin: '*',
    },
  })
  export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
    @WebSocketServer()
    server: Server;
  
    private userSocketMap: Map<string, string> = new Map(); // socketId -> username
  
    constructor(private readonly chatService: ChatService) {}
  
    async handleConnection(client: Socket) {
      console.log(`Client connected: ${client.id}`);
    }
  
    async handleDisconnect(client: Socket) {
      console.log(`Client disconnected: ${client.id}`);
      
      // Get username of disconnected user
      const username = this.userSocketMap.get(client.id);
      
      if (username) {
        await this.chatService.handleDisconnect(client.id);
        this.server.emit('userList', await this.chatService.getOnlineUsers());
        this.server.emit('userLeft', { username });
        
        // Remove from user map
        this.userSocketMap.delete(client.id);
      }
    }
  
    @SubscribeMessage('join')
    async handleJoin(client: Socket, username: string) {
      // Save the mapping
      this.userSocketMap.set(client.id, username);
      
      // Register user in database
      await this.chatService.registerUser(username, client.id);
      
      // Send recent messages to new user
      client.emit('messages', await this.chatService.getRecentMessages());
      
      // Send updated user list to all clients
      this.server.emit('userList', await this.chatService.getOnlineUsers());
      
      // Notify others that a new user joined
      this.server.emit('userJoined', { username, timestamp: new Date() });
    }
  
    @SubscribeMessage('sendMessage')
    async handleMessage(client: Socket, payload: { sender: string; content: string; room?: string }) {
      const message = await this.chatService.saveMessage(payload);
      this.server.emit('newMessage', message);
    }
  
    @SubscribeMessage('typing')
    handleTyping(client: Socket, data: { username: string }) {
      client.broadcast.emit('typing', data);
    }
  
    @SubscribeMessage('stopTyping')
    handleStopTyping(client: Socket, data: { username: string }) {
      client.broadcast.emit('stopTyping', data);
    }
  }