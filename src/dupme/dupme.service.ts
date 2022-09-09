import { Injectable } from '@nestjs/common';
import { CreateDupmeDto } from './dto/create-dupme.dto';
import { UpdateDupmeDto } from './dto/update-dupme.dto';

@Injectable()
export class DupmeService {
  activePlayer: string[] = [];
  currentRoom: string[] = [];
  currentRoomId = 1;

  playerConnect(socketId: string): void {
    this.activePlayer.push(socketId);
  }

  playerDisconnect(socketId: string): void {
    const temp = this.activePlayer.filter((playerId) => playerId != socketId);
    this.activePlayer = temp;
  }

  createRoom(): void {
    const roomName = `room${this.currentRoomId}`;
    this.currentRoom.push(roomName);
  }
}
