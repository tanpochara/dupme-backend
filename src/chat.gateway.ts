import {
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server } from 'http';

@WebSocketGateway(81, { transports: ['websocket'] })
export class ChatGateway {
  @WebSocketServer()
  sever: Server;

  @SubscribeMessage('message')
  handleMessage(@MessageBody() message: string): string {
    console.log(message);
    this.sever.emit('message', 'kuyyyy');
    return message + 'kuy';
  }
}
