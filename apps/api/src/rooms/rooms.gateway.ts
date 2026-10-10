import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
} from '@nestjs/websockets';
import type { OnModuleDestroy } from '@nestjs/common';
import { Server, Socket } from 'socket.io';
import { randomUUID } from 'node:crypto';
import { RoomsService } from './rooms.service';
import type { Player, RoomStat } from '@repo/types/game';
import type {
  ServerToClientEvents,
  ClientToServerEvents,
  MovementPayload,
  PlayerMovedPayload,
  ChatMessage,
} from '@repo/types/socket';
import { CollisionGrid } from './collision/collision-grid';

interface ClientSocketData {
  roomCode: string;
  lastChatTime?: number;
}

type ClientSocket = Socket<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  ClientSocketData
>;

type GameServer = Server<
  ClientToServerEvents,
  ServerToClientEvents,
  Record<string, never>,
  ClientSocketData
>;

interface ServerRoomStat extends RoomStat {
  collisionGrid: CollisionGrid;
  spawnX: number;
  spawnY: number;
  isPrivate: boolean;
  pendingMoves: Map<string, PlayerMovedPayload>;
}

@WebSocketGateway({
  namespace: '/game',
  cors: {
    origin: '*',
  },
})
export class RoomsGateway
  implements
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleDestroy
{
  constructor(private readonly roomService: RoomsService) {}
  @WebSocketServer()
  server!: GameServer;

  private rooms = new Map<string, ServerRoomStat>();
  private deletionTimers = new Map<string, NodeJS.Timeout>();
  private tickInterval: NodeJS.Timeout | null = null;

  afterInit() {
    this.tickInterval = setInterval(() => this.tick(), 50);
  }

  onModuleDestroy() {
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  private tick() {
    for (const [code, roomState] of this.rooms) {
      if (roomState.pendingMoves.size === 0) continue;
      const updates = Array.from(roomState.pendingMoves.values());
      roomState.pendingMoves.clear();
      this.server.to(code).emit('batchMove', updates);
    }
  }

  async handleConnection(client: ClientSocket) {
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

    const pendingTimer = this.deletionTimers.get(code);
    if (pendingTimer) {
      clearTimeout(pendingTimer);
      this.deletionTimers.delete(code);
    }

    let roomState = this.rooms.get(code);

    if (!roomState) {
      const room = await this.roomService.findOneWithMap(code);
      if (!room) {
        client.emit('error', 'room not found');
        client.disconnect();
        return;
      }
      roomState = {
        width: room.map.width,
        height: room.map.height,
        players: new Map(),
        spawnX: room.map.spawnX,
        spawnY: room.map.spawnY,
        collisionGrid: new CollisionGrid(room.map.mapData),
        isPrivate: room.isPrivate,
        pendingMoves: new Map(),
      };
      this.rooms.set(code, roomState);
    }

    const newPlayer: Player = {
      id: client.id,
      name: PlayerName,
      avatar: Avatar,
      x: roomState.spawnX,
      y: roomState.spawnY,
    };
    roomState.players.set(client.id, newPlayer);

    void client.join(code);
    client.data.roomCode = code;

    client.emit('currentPlayers', Array.from(roomState.players.values()));
    client.to(code).emit('playerJoined', newPlayer);
  }

  @SubscribeMessage('move')
  handleMovement(
    @ConnectedSocket() client: ClientSocket,
    @MessageBody() [x, y, direction]: MovementPayload,
  ) {
    const roomCode = client.data.roomCode || '';
    const roomState = this.rooms.get(roomCode);
    const player = roomState?.players.get(client.id);

    if (player && roomState) {
      const isWalkable = roomState.collisionGrid
        ? roomState.collisionGrid.isWalkableWorld(x, y)
        : true;

      if (isWalkable) {
        player.x = x;
        player.y = y;

        roomState.pendingMoves.set(client.id, [
          client.id,
          player.x,
          player.y,
          direction,
        ]);
      } else {
        client.emit('move', [client.id, player.x, player.y, 's']);
      }
    }
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(
    @ConnectedSocket() client: ClientSocket,
    @MessageBody() message: string,
  ) {
    if (
      client.data.lastChatTime &&
      Date.now() - client.data.lastChatTime < 2000
    ) {
      return;
    }

    const roomCode = client.data.roomCode;
    if (!roomCode || typeof message !== 'string') return;

    const trimmed = message.trim();
    if (!trimmed || trimmed.length > 200) return;
    client.data.lastChatTime = Date.now();

    const roomState = this.rooms.get(roomCode);
    const player = roomState?.players.get(client.id);
    if (!player) return;

    const chatPayload: ChatMessage = {
      id: randomUUID(),
      senderId: client.id,
      senderName: player.name,
      message: trimmed,
    };

    this.server.to(roomCode).emit('chatMessage', chatPayload);
  }

  handleDisconnect(client: ClientSocket) {
    const code = client.data.roomCode;
    if (!code) return;
    const roomState = this.rooms.get(code);
    if (roomState) {
      const player = roomState.players.get(client.id);
      roomState.players.delete(client.id);
      roomState.pendingMoves.delete(client.id);
      if (player) {
        this.server.to(code).emit('playerLeft', player);
      }
      if (roomState.players.size === 0) {
        if (roomState.isPrivate) {
          const existingTimer = this.deletionTimers.get(code);
          if (existingTimer) {
            clearTimeout(existingTimer);
          }

          const timer = setTimeout(
            async () => {
              this.deletionTimers.delete(code);
              this.rooms.delete(code);
              await this.roomService.deleteRoom(code);
            },
            3 * 60 * 1000,
          );

          this.deletionTimers.set(code, timer);
        } else {
          this.rooms.delete(code);
        }
      }
    }
  }
}
