import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
} from '@nestjs/websockets';
import { DupmeService } from './dupme.service';
import { CreateDupmeDto } from './dto/create-dupme.dto';
import { UpdateDupmeDto } from './dto/update-dupme.dto';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway(81, { cors: true })
export class DupmeGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private logger = new Logger();
  constructor(private readonly dupmeService: DupmeService) {}

  handleConnection(client: Socket) {
    this.dupmeService.playerConnect(client.id);
    this.logger.log('player connected');
  }

  handleDisconnect(client: Socket) {
    this.dupmeService.playerDisconnect(client.id);
    this.logger.log('player disconnected');
  }

  @SubscribeMessage('playerOnline')
  handlePlayerOnline() {
    this.server.emit('currentPlayer', this.dupmeService.activePlayer.length);
  }

  @SubscribeMessage('roomOnline')
  handleRoomOnline() {
    this.server.emit('currentRoom', this.dupmeService.currentRoom.length);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody('room') room: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(room);
    this.server.emit('playerJoinedRoom', this.dupmeService.currentRoom);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string[]) {
    this.server.emit('message', message[1]);
  }
}
