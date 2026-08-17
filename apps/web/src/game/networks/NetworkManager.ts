import { io, Socket } from 'socket.io-client';
import type { Player } from '../scenes/MainGame';
import { MainGame } from '../scenes/MainGame';
import {
  handlePlayerMovement,
  setupSocketListeners,
} from '../utils/animations';

export class NetworkManager {
  private scene: MainGame;
  public socket: Socket;

  constructor(scene: MainGame) {
    this.scene = scene;
    this.socket = io('http://localhost:3000', {
      path: '/room',
      query: {
        name: 'rehan',
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
