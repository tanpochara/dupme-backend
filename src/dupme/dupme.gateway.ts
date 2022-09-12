import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  ConnectedSocket,
  OnGatewayInit,
} from '@nestjs/websockets';
import { DupmeService } from './dupme.service';
import { Server, Socket } from 'socket.io';
import { Logger } from '@nestjs/common';

@WebSocketGateway(81, {
  cors: {
    origin: 'http://localhost:3000',
  },
})
export class DupmeGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnGatewayInit
{
  @WebSocketServer()
  server: Server;

  private logger = new Logger();
  constructor(private readonly dupmeService: DupmeService) {}

  afterInit() {
    this.dupmeService.clearRoom();
    this.dupmeService.clearPlayer();
  }

  handleConnection(client: Socket) {
    console.log('player connected');
    this.dupmeService.playerConnect(client.id);
  }

  handleDisconnect(client: Socket) {
    this.dupmeService.playerDisconnect(client.id);
    this.logger.log('player disconnected');
  }

  @SubscribeMessage('playerOnline')
  handlePlayerOnline() {
    this.server.emit('currentPlayer', this.dupmeService.activePlayer);
  }

  @SubscribeMessage('getRoom')
  handleRoomOnline() {
    this.server.emit('currentRoom', this.dupmeService.currentRoom);
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(@MessageBody() msg, @ConnectedSocket() client: Socket) {
    const roomOption = JSON.parse(msg);
    client.join(roomOption.name);
    this.dupmeService.createRoom(client.id, roomOption.amount, roomOption.name);
    this.server.emit('currentRoom', this.dupmeService.currentRoom);
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() roomName: string,
    @ConnectedSocket() client: Socket,
  ) {
    client.join(roomName);
    this.dupmeService.joinRoom(client.id, roomName);
    this.server.emit('currentRoom', this.dupmeService.currentRoom);
    // this.server.emit('playerJoinedRoom', this.dupmeService.currentRoom);
  }

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message, @ConnectedSocket() client: Socket) {
    this.logger.log('get message');
    client.in('helo').emit('roomMessage', 'kuyy');
  }

  @SubscribeMessage('keyPressed')
  handleKeyPressed(@MessageBody() key: string) {
    this.server.emit('opponentKeyPressed', key);
  }

  @SubscribeMessage('playerReady')
  handlePlayerReady(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomName: string,
  ) {
    this.dupmeService.playerReady(client.id, roomName);
    this.server.emit('currentRoom', this.dupmeService.currentRoom);
  }

  @SubscribeMessage('playerLeaveRoom')
  handlePlayerLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomName: string,
  ) {
    this.dupmeService.playerLeaveRoom(client.id, roomName);
    this.server.emit('currentRoom', this.dupmeService.currentRoom);
  }
}
