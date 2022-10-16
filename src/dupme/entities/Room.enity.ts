import { User } from './user.enitiy';

export class Room {
  name: string;
  players: User[];
  bet: string;
  isFull: boolean;
  currentRound: number;
  rounds: Rounds;
  firstPlayerIndex: number;
  mode: 'normal' | 'hard';
}

interface Rounds {
  '1': Round | null;
  '2': Round | null;
  '3': Round | null;
  '4': Round | null;
}

interface Round {
  player: string;
  sequence: string[];
}
