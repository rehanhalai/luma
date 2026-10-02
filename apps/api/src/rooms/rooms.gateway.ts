import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RoomsService } from './rooms.service';
import type { Player, RoomStat } from '@repo/types';
import { CollisionGrid } from './collision/collision-grid';

interface ServerRoomStat extends RoomStat {
  collisionGrid?: CollisionGrid;
}

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class RoomsGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor(private readonly roomService: RoomsService) {}
  @WebSocketServer()
  server!: Server;

  private rooms = new Map<string, ServerRoomStat>();

  async handleConnection(client: Socket) {
    const Avatar = Array.isArray(client.handshake.query.avatar)
      ? client.handshake.query.avatar[0]
      : client.handshake.query.avatar;
    if (!Avatar) {
      client.emit('error', 'avatar is required');
      client.disconnect();
      return;
    }

    const PlayerName = Array.isArray(client.handshake.query.name)
      ? client.handshake.query.name[0]
      : client.handshake.query.name;
    if (!PlayerName) {
      client.emit('error', 'player name is required');
      client.disconnect();
      return;
    }

    const code = Array.isArray(client.handshake.query.code)
      ? client.handshake.query.code[0]
      : client.handshake.query.code;
    if (!code) {
      client.emit('error', 'room code is required');
      client.disconnect();
      return;
    }

    const room = await this.roomService.findOne(code);
    if (!room) {
      client.emit('error', 'room not found');
      client.disconnect();
      return;
    }

    let roomState = this.rooms.get(code);

    if (!roomState) {
      roomState = {
        width: room.map.width,
        height: room.map.height,
        players: new Map(),
        collisionGrid: room.map.mapData
          ? new CollisionGrid(room.map.mapData)
          : undefined,
      };
      this.rooms.set(code, roomState);
    }

    const newPlayer: Player = {
      id: client.id,
      name: PlayerName,
      avatar: Avatar,
      x: room.map.spawnX,
      y: room.map.spawnY,
    };
    roomState.players.set(client.id, newPlayer);

    client.join(code);
    client.data.roomCode = code;

    client.emit('currentPlayers', Array.from(roomState.players.values()));
    client.to(code).emit('playerJoined', roomState.players.get(client.id));
  }

  @SubscribeMessage('movement')
  handleMovement(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { x: number; y: number; direction: string },
  ) {
    const roomState = this.rooms.get(client.data.roomCode);
    const player = roomState?.players.get(client.id);

    if (player && roomState) {
      const isWalkable = roomState.collisionGrid
        ? roomState.collisionGrid.isWalkableWorld(data.x, data.y)
        : true;

      if (isWalkable) {
        player.x = data.x;
        player.y = data.y;

        client.broadcast.to(client.data.roomCode).emit('playerMoved', {
          id: client.id,
          x: player.x,
          y: player.y,
          direction: data.direction,
        });
      } else {
        // Move was blocked by a solid wall/obstacle.
        // Emit snapback correction to the client with their last valid coordinates
        client.emit('playerMoved', {
          id: client.id,
          x: player.x,
          y: player.y,
          direction: 'stop',
        });
      }
    }
  }

  handleDisconnect(client: Socket) {
    const code = client.data.roomCode;
    const roomState = this.rooms.get(code);
    if (roomState) {
      const player = roomState.players.get(client.id);
      roomState.players.delete(client.id);
      this.server.to(code).emit('playerLeft', player);
      if (roomState.players.size === 0) {
        this.rooms.delete(code);
      }
    }
  }
}
