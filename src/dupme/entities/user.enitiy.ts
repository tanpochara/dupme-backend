import { Socket } from 'socket.io';
export class user {
  id: string;
  name: string;
  socketInstance: Socket;
}
