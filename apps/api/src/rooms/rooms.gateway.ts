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

const AOI_CELL_SIZE = 1200;

function getCellCoord(val: number): number {
  return Math.floor(val / AOI_CELL_SIZE);
}

function getCellKey(x: number, y: number): string {
  return `${getCellCoord(x)}_${getCellCoord(y)}`;
}

function getNeighborCellKeys(x: number, y: number): string[] {
  const cx = getCellCoord(x);
  const cy = getCellCoord(y);
  const keys: string[] = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      keys.push(`${cx + dx}_${cy + dy}`);
    }
  }
  return keys;
}

function getNeighborCellKeysFromKey(cellKey: string): string[] {
  const parts = cellKey.split('_');
  const cx = Number(parts[0]);
  const cy = Number(parts[1]);
  const keys: string[] = [];
  for (let dx = -1; dx <= 1; dx++) {
    for (let dy = -1; dy <= 1; dy++) {
      keys.push(`${cx + dx}_${cy + dy}`);
    }
  }
  return keys;
}

interface ServerRoomStat extends RoomStat {
  collisionGrid: CollisionGrid;
  spawnX: number;
  spawnY: number;
  isPrivate: boolean;
  pendingMoves: Map<string, PlayerMovedPayload>;
  playerCells: Map<string, string>;
  sockets: Map<string, ClientSocket>;
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
    for (const [, roomState] of this.rooms) {
      if (roomState.pendingMoves.size === 0) continue;

      // Group pending moves by cell key
      const movesByCell = new Map<string, PlayerMovedPayload[]>();
      for (const move of roomState.pendingMoves.values()) {
        const cellKey = getCellKey(move[1], move[2]);
        let list = movesByCell.get(cellKey);
        if (!list) {
          list = [];
          movesByCell.set(cellKey, list);
        }
        list.push(move);
      }
      roomState.pendingMoves.clear();

      // Gather updates from 3x3 neighbor cells for each connected client
      for (const [clientId, player] of roomState.players) {
        const clientSocket = roomState.sockets.get(clientId);
        if (!clientSocket) continue;

        const neighborKeys = getNeighborCellKeys(player.x, player.y);
        let clientUpdates: PlayerMovedPayload[] | null = null;

        for (let i = 0; i < neighborKeys.length; i++) {
          const cellMoves = movesByCell.get(neighborKeys[i]!);
          if (cellMoves && cellMoves.length > 0) {
            if (!clientUpdates) clientUpdates = [];
            for (let j = 0; j < cellMoves.length; j++) {
              clientUpdates.push(cellMoves[j]!);
            }
          }
        }

        if (clientUpdates && clientUpdates.length > 0) {
          clientSocket.emit('batchMove', clientUpdates);
        }
      }
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
        playerCells: new Map(),
        sockets: new Map(),
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
    roomState.sockets.set(client.id, client);
    roomState.playerCells.set(client.id, getCellKey(newPlayer.x, newPlayer.y));

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

        const newCell = getCellKey(player.x, player.y);
        const prevCell = roomState.playerCells.get(client.id);

        if (prevCell && prevCell !== newCell) {
          // Player crossed into a new cell!
          const prevNeighbors = new Set(getNeighborCellKeysFromKey(prevCell));
          const newNeighbors = getNeighborCellKeys(player.x, player.y);
          const enteredCells = newNeighbors.filter(
            (k) => !prevNeighbors.has(k),
          );

          // Collect positions of players in the newly entered cells
          const syncUpdates: PlayerMovedPayload[] = [];
          for (const [otherId, otherPlayer] of roomState.players) {
            if (otherId === client.id) continue;
            const otherCell = roomState.playerCells.get(otherId);
            if (otherCell && enteredCells.includes(otherCell)) {
              syncUpdates.push([otherId, otherPlayer.x, otherPlayer.y, 's']);
            }
          }

          if (syncUpdates.length > 0) {
            client.emit('batchMove', syncUpdates);
          }
        }
        roomState.playerCells.set(client.id, newCell);

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
      roomState.playerCells.delete(client.id);
      roomState.sockets.delete(client.id);
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
