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
    }

    delete this.activePlayer[socketId];
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
    };
    this.currentRoom[roomName] = temp;
  }

  joinRoom(socketId: string, roomName: string): void {
    const player = this.activePlayer[socketId];
    if (!player) return;
    const room = this.currentRoom[roomName];
    if (!room) return;
    const temp = room.players.concat(player);
    room.players = temp;
  }

  clearRoom(): void {
    this.currentRoom = {};
  }
}
