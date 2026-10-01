import { io, Socket } from 'socket.io-client';
import type { Player } from '@repo/types';
import { RoomScene } from '../phaser/scenes/RoomScene';
import type { RoomParams } from '../phaser/config';
import {
  handlePlayerMovement,
  setupSocketListeners,
} from '../phaser/utils/animations';

export class NetworkManager {
  private scene: RoomScene;
  public socket: Socket;
  public roomParams: RoomParams;

  constructor(scene: RoomScene, roomParams: RoomParams) {
    this.scene = scene;
    this.roomParams = roomParams;

    const API_URL = import.meta.env.VITE_API_URL;

    this.socket = io(API_URL, {
      query: {
        code: this.roomParams.roomCode,
        name: this.roomParams.name,
        avatar: this.roomParams.avatar,
      },
    });
    this.initListeners();
  }

  private initListeners() {
    this.socket.on('currentPlayers', (data: Player[]) => {
      data.forEach((player) => {
        setupSocketListeners(this.scene, player);
      });
    });

    this.socket.on('playerJoined', (data: Player) => {
      setupSocketListeners(this.scene, data);
    });

    this.socket.on('playerLeft', (data: Player) => {
      const rect = this.scene.players.get(data.id);
      if (rect) {
        rect.destroy();
        this.scene.players.delete(data.id);
      }
    });

    this.socket.on(
      'playerMoved',
      (data: { id: string; x: number; y: number; direction: string }) => {
        handlePlayerMovement(
          this.scene,
          data.id,
          data.x,
          data.y,
          data.direction,
        );
      },
    );

    this.scene.events.on('shutdown', () => {
      this.socket.disconnect();
    });
  }

  public sendMovement(x: number, y: number, direction: string) {
    this.socket.emit('movement', {
      x,
      y,
      direction,
    });
  }
}
