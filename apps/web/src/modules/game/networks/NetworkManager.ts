import { io, Socket } from 'socket.io-client';
import type {
  ClientToServerEvents,
  ServerToClientEvents,
  Direction,
} from '@repo/types/socket';
import { RoomScene } from '../phaser/scenes/RoomScene';
import type { RoomParams } from '../phaser/config';
import {
  handlePlayerMovement,
  setupSocketListeners,
} from '../phaser/utils/animations';

export class NetworkManager {
  private scene: RoomScene;
  public socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  public roomParams: RoomParams;

  constructor(scene: RoomScene, roomParams: RoomParams) {
    this.scene = scene;
    this.roomParams = roomParams;

    const API_URL = import.meta.env.VITE_API_URL;

    this.socket = io(`${API_URL}/game`, {
      query: {
        code: this.roomParams.roomCode,
        name: this.roomParams.name,
        avatar: this.roomParams.avatar,
      },
    });
    this.initListeners();
  }

  private initListeners() {
    this.socket.on('currentPlayers', (data) => {
      data.forEach((player) => {
        setupSocketListeners(this.scene, player);
      });
    });

    this.socket.on('playerJoined', (data) => {
      setupSocketListeners(this.scene, data);
    });

    this.socket.on('playerLeft', (data) => {
      const rect = this.scene.players.get(data.id);
      if (rect) {
        rect.destroy();
        this.scene.players.delete(data.id);
      }
    });

    this.socket.on('move', ([id, x, y, direction]) => {
      handlePlayerMovement(this.scene, id, x, y, direction);
    });

    this.scene.events.on('shutdown', () => {
      this.socket.disconnect();
    });
  }

  public sendMovement(x: number, y: number, direction: Direction) {
    this.socket.emit('move', [x, y, direction]);
  }
}
