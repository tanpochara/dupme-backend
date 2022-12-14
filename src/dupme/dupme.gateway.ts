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

  @SubscribeMessage('getRoom')
  handleRoomOnline() {
    this.server.emit('currentRoom', this.dupmeService.currentRoom);
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(@MessageBody() msg, @ConnectedSocket() client: Socket) {
    const roomOption = JSON.parse(msg);
    client.join(roomOption.name);
    this.dupmeService.createRoom(
      client.id,
      roomOption.amount,
      roomOption.name,
      roomOption.mode,
    );
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

  @SubscribeMessage('registerName')
  handleRegisterName(
    @MessageBody() name: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.dupmeService.handleRegisterName(name, client.id);
    this.server.emit('currentPlayer', this.dupmeService.activePlayer);
    this.server.emit('currentRoom', this.dupmeService.currentRoom);
  }

  @SubscribeMessage('connectWallet')
  handlePlayerConnectWallet(
    @MessageBody() address: string,
    @ConnectedSocket() client: Socket,
  ) {
    this.dupmeService.handlePlayerConnectWallet(address, client.id);
    this.server.emit('currentPlayer', this.dupmeService.activePlayer);
    this.server.emit('currentRoom', this.dupmeService.currentRoom);
  }

  @SubscribeMessage('playerReady')
  handlePlayerReady(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomName: string,
  ) {
    this.dupmeService.playerReady(client.id);
    this.server.emit('currentRoom', this.dupmeService.currentRoom);
    const players = this.dupmeService.currentRoom[roomName].players;
    const randomFirstPlayer = Math.round(Math.random());
    this.logger.verbose(randomFirstPlayer);
    if (players[0].isReady && players[1].isReady) {
      this.dupmeService.setFirstPlayer(roomName, randomFirstPlayer);
      const params = {
        round: 1,
        playerPlaying: players[randomFirstPlayer],
        time: 10,
      };
      // client.to(roomName).emit('gameStart', params);
      console.log(roomName);
      console.log(params);
      this.server.to(roomName).emit('gameStart', params);
    }
  }

  @SubscribeMessage('playerLeaveRoom')
  handlePlayerLeaveRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() roomName: string,
  ) {
    this.dupmeService.playerLeaveRoom(client.id, roomName);
    this.server.emit('currentRoom', this.dupmeService.currentRoom);
  }

  @SubscribeMessage('getCurrentPlayer')
  handleGetPlayer() {
    const players = this.dupmeService.activePlayer;
    this.server.emit('currentPlayer', players);
  }

  @SubscribeMessage('playerSurrender')
  handleSurrender(
    @ConnectedSocket() cliect: Socket,
    @MessageBody() roomName: string,
  ) {
    console.log('incoming surrender');
    this.dupmeService.handleSurrender(cliect.id, roomName).then((data) => {
      console.log(data);
      this.server.emit('gameFinish', 'hello world');
      this.server.emit('currentRoom', this.dupmeService.currentRoom);
    });
  }

  @SubscribeMessage('roundFinish')
  handleRoundFinish(
    @ConnectedSocket() client: Socket,
    @MessageBody() msg: string,
  ) {
    const params = JSON.parse(msg);
    console.log('round finish', params.round);
    this.dupmeService.handleRoundFinish(
      params.round,
      params.roomName,
      params.sequence,
    );

    const players = this.dupmeService.currentRoom[params.roomName].players;
    const round = this.dupmeService.currentRoom[params.roomName].currentRound;
    const indexOfFirstPlayer =
      this.dupmeService.currentRoom[params.roomName].firstPlayerIndex;
    const indexOfSecondPlyaer = indexOfFirstPlayer == 0 ? 1 : 0;
    const playerPlaying =
      round == 1 || round == 4
        ? players[indexOfFirstPlayer]
        : players[indexOfSecondPlyaer];
    let time = round % 2 == 1 ? 10 : 20;
    const mode = this.dupmeService.currentRoom[params.roomName].mode;
    if (mode == 'hard') {
      time = 10;
    }

    const args = {
      round,
      playerPlaying,
      time,
    };

    this.server.emit('currentRoom', this.dupmeService.currentRoom);

    console.log(args);
    if (round > 4) {
      this.dupmeService.announceWinner(params.roomName).then((data) => {
        console.log(data);
        this.dupmeService.uploadScore(params.roomName);
        this.server.to(params.roomName).emit('gameFinish', 'hello world');
      });
    } else {
      this.server.to(params.roomName).emit('gameStart', args);
    }
  }

  @SubscribeMessage('getScore')
  async handleGetScore() {
    this.dupmeService.getScore().then((score) => {
      this.server.emit('leaderboardScore', score);
    });
  }
}
