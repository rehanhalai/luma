import {
  ConnectedSocket,
  MessageBody,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

export interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
}

@WebSocketGateway({ path: '/room' })
export class GameGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server!: Server;

  private players = new Map<string, Player>();
  private readonly Max_Width = 800;
  private readonly Max_Height = 600;

  handleConnection(client: Socket) {
    const PlayerName = Array.isArray(client.handshake.query.name)
      ? client.handshake.query.name[0]
      : client.handshake.query.name;
    if (PlayerName) {
      console.log(`player ${PlayerName} connected to socket server`);

      const newPlayer: Player = {
        id: client.id,
        name: PlayerName,
        x: Math.floor(Math.random() * (this.Max_Width - 100)),
        y: Math.floor(Math.random() * (this.Max_Height - 100)),
      };

      this.players.set(client.id, newPlayer);
      client.emit('currentPlayers', Array.from(this.players.values()));
      client.broadcast.emit('playerJoined', newPlayer);
    }
  }

  @SubscribeMessage('movement')
  handleMovement(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { x: number; y: number },
  ) {
    const player = this.players.get(client.id);
    if (player) {
      player.x = Math.max(0, Math.min(this.Max_Width, data.x));
      player.y = Math.max(0, Math.min(this.Max_Height, data.y));

      client.broadcast.emit('playerMoved', {
        id: client.id,
        x: player.x,
        y: player.y,
      });
    }
  }

  handleDisconnect(client: Socket) {
    this.players.delete(client.id);
    this.server.emit('playerLeft', client.id);
  }
}
