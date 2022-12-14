import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { ethers } from 'ethers';
import { Model } from 'mongoose';
import { Room } from './entities/Room.enity';
import { User } from './entities/user.enitiy';
import { User as UserModel, UserDocument } from './schemas/UserSchema';
import { stakerABI } from './abi/StakerABI';

@Injectable()
export class DupmeService {
  //use socket id as key
  activePlayer: { [key: string]: User } = {};
  //use username room as key
  currentRoom: { [key: string]: Room } = {};
  currentRoomId = 1;
  contract: ethers.Contract;

  constructor(
    @InjectModel(UserModel.name) private userModel: Model<UserDocument>,
  ) {
    const provider = new ethers.providers.JsonRpcProvider(
      process.env.RPC_PROVIDER,
    );
    const wallet = new ethers.Wallet(process.env.WALLET_PRIVATE_KEY, provider);
    console.log(stakerABI);
    this.contract = new ethers.Contract(
      process.env.STAKER_CONTRACT_ADDRESS,
      stakerABI,
      wallet,
    );
  }

  async announceWinner(roomName: string): Promise<any> {
    const room = this.currentRoom[roomName];
    const winnerAddress: string =
      room.players[0].points > room.players[1].points
        ? room.players[0].address
        : room.players[1].address;
    const tx = await this.contract.winner(roomName, winnerAddress);
    await tx.wait();
  }

  async uploadScore(roomName: string): Promise<any> {
    const room = this.currentRoom[roomName];
    for (let i = 0; i < room.players.length; i++) {
      const player = await this.userModel.findOne({
        name: room.players[i].name,
      });
      if (!player) {
        const newPlayer = new this.userModel();
        newPlayer.name = room.players[i].name;
        newPlayer.points = room.players[i].points;
        newPlayer.socketId = room.players[i].id;
        await newPlayer.save();
      } else {
        const currentScore = player.points;
        player.points = room.players[i].points + currentScore;
        await player.save();
      }
    }
  }

  async getScore(): Promise<any> {
    const scores = await this.userModel.find({}).sort({ points: 'desc' });
    return scores;
  }

  //----------- PLAYER CRUD ---------------
  playerConnect(socketId: string): void {
    const temp: User = {
      id: socketId,
      isReady: false,
      currentRoom: null,
      points: 0,
      name: '',
      address: '',
    };
    this.activePlayer[socketId] = temp;
  }

  playerDisconnect(socketId: string): void {
    const playerDC = this.activePlayer[socketId];
    const room = playerDC.currentRoom;
    if (room) {
      const roomDC = this.currentRoom[room];
      const temp = roomDC.players.filter((player) => player.id != playerDC.id);
      roomDC.players = temp;
      roomDC.isFull = false;
    }

    delete this.activePlayer[socketId];
  }

  playerReady(socketId: string): void {
    const player = this.activePlayer[socketId];
    player.isReady = true;
  }

  playerLeaveRoom(socketId: string, roomName: string): void {
    const player = this.activePlayer[socketId];
    player.isReady = false;
    player.currentRoom = null;
    player.points = 0;

    const room = this.currentRoom[roomName];
    room.players = room.players.filter((playerr) => playerr.id != player.id);
    if (room.players.length == 0) {
      delete this.currentRoom[roomName];
    }
  }

  handleRegisterName(name: string, socketId: string) {
    this.activePlayer[socketId].name = name;
  }

  handlePlayerConnectWallet(address: string, socketId: string) {
    this.activePlayer[socketId].address = address;
  }

  clearPlayer(): void {
    this.activePlayer = {};
  }

  //---------------------------------------

  createRoom(
    socketId: string,
    amount: string,
    roomName: string,
    mode: 'normal' | 'hard',
  ): void {
    const player = [];
    player.push(this.activePlayer[socketId]);
    const temp: Room = {
      name: roomName,
      bet: amount,
      players: player,
      isFull: false,
      currentRound: 0,
      rounds: {
        1: null,
        2: null,
        3: null,
        4: null,
      },
      firstPlayerIndex: 0,
      mode: mode,
    };
    this.activePlayer[socketId].currentRoom = roomName;
    this.currentRoom[roomName] = temp;
  }

  setFirstPlayer(roomName: string, firstPlayerIndex: number): void {
    this.currentRoom[roomName].firstPlayerIndex = firstPlayerIndex;
  }

  joinRoom(socketId: string, roomName: string): void {
    const player = this.activePlayer[socketId];
    if (!player) return;
    const room = this.currentRoom[roomName];
    if (!room) return;
    const temp = room.players.concat(player);
    room.players = temp;
    if (room.players.length >= 2) {
      room.isFull = true;
    }
    player.currentRoom = roomName;
  }

  clearRoom(): void {
    this.currentRoom = {};
  }

  handleRoundFinish(round: number, roomName: string, sequence: string[]) {
    const room = this.currentRoom[roomName];
    const firstPlayerIndex = room.firstPlayerIndex;
    const secondPlayerIndex = firstPlayerIndex == 0 ? 1 : 0;

    if (round % 2 == 0) {
      const point = this.updateScore(room.rounds[round - 1], sequence);
      const playerCopying =
        round == 2
          ? room.players[secondPlayerIndex]
          : room.players[firstPlayerIndex];
      this.activePlayer[playerCopying.id].points = point;
    }

    room.rounds[round] = sequence;
    room.currentRound = round + 1;
    console.log(room);
  }

  async handleSurrender(socketId: string, roomName: string) {
    const room = this.currentRoom[roomName];
    const winnerPlayerId =
      room.players[0].id == socketId ? room.players[1].id : room.players[0].id;
    this.activePlayer[winnerPlayerId].points = 150;
    await this.announceWinner(roomName);
  }

  handleRoomFinish(roomName: string) {
    const room = this.currentRoom[roomName];
    const p1Id = room.players[0].id;
    const p2Id = room.players[1].id;
    this.activePlayer[p1Id].currentRoom = null;
    this.activePlayer[p1Id].points = 0;
    this.activePlayer[p2Id].currentRoom = null;
    this.activePlayer[p2Id].points = 0;

    delete this.currentRoom[roomName];
  }

  updateScore(initialSequence: string[], copyingSequence: string[]): number {
    const point =
      (100 *
        initialSequence.filter(Set.prototype.has, new Set(copyingSequence))
          .length) /
      Math.max(initialSequence.length, copyingSequence.length);

    return point;
  }
}
