import { Injectable } from '@nestjs/common';
import { Room } from './entities/Room.enity';
import { User } from './entities/user.enitiy';

@Injectable()
export class DupmeService {
  //use socket id as key
  activePlayer: { [key: string]: User } = {};
  //use username room as key
  currentRoom: { [key: string]: Room } = {};
  currentRoomId = 1;

  //----------- PLAYER CRUD ---------------
  playerConnect(socketId: string): void {
    const temp: User = {
      id: socketId,
      isReady: false,
      currentRoom: null,
      points: 0,
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

  playerReady(socketId: string, roomName: string): void {
    const player = this.activePlayer[socketId];
    player.isReady = true;
  }

  playerLeaveRoom(socketId: string, roomName: string): void {
    const player = this.activePlayer[socketId];
    player.isReady = false;
    player.currentRoom = null;

    const room = this.currentRoom[roomName];
    room.players = room.players.filter((playerr) => playerr.id != player.id);
    if (room.players.length == 0) {
      delete this.currentRoom[roomName];
    }
  }

  clearPlayer(): void {
    this.activePlayer = {};
  }

  //---------------------------------------

  createRoom(socketId: string, amount: string, roomName: string): void {
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
    };
    this.activePlayer[socketId].currentRoom = roomName;
    this.currentRoom[roomName] = temp;
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

    if (round % 2 == 0) {
      const point = this.updateScore(room.rounds[round - 1], sequence);
      const playerCopying = round == 2 ? room.players[1] : room.players[0];
      this.activePlayer[playerCopying.id].points = point;
    }

    room.rounds[round] = sequence;
    room.currentRound = round + 1;
    console.log(room);
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
