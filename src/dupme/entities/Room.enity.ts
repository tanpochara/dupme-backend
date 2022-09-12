import { User } from './user.enitiy';

export class Room {
  name: string;
  players: User[];
  bet: string;
  isFull: boolean;
}
