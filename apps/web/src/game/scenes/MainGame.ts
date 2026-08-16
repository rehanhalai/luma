import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { io } from 'socket.io-client';

export interface Player {
  id: string;
  name: string;
  x: number;
  y: number;
}

export class MainGame extends Scene {
  constructor() {
    super('MainGame');
  }

  private getRandomHexColor = (): number => {
    return Math.floor(Math.random() * 16777215);
  };

  private players = new Map<string, Phaser.GameObjects.Rectangle>();

  create() {
    const socket = io('http://localhost:3000', {
      path: '/room',
      query: {
        name: 'rehan',
      },
    });
    this.cameras.main.setBackgroundColor(0x90ee90);

    socket.on('currentPlayers', (data: Player[]) => {
      data.forEach((player) => {
        this.setupSocketListeners(player);
      });
    });

    socket.on('playerJoined', (data: Player) => {
      this.setupSocketListeners(data);
    });

    socket.on('playerLeft', (data: Player) => {
      const rect = this.players.get(data.id);
      if (rect) {
        rect.destroy();
        this.players.delete(data.id);
      }
    });

    socket.on('movement', (data: Partial<Player>) => {
      this.handlePlayerMovement(data.id, data.x, data.y);
    });

    this.events.on('shutdown', () => {
      socket.disconnect();
    });
    EventBus.emit('current-scene-ready', this);
  }

  private setupSocketListeners(player: Player) {
    if (this.players.has(player.id)) return;
    const rect = this.add.rectangle(
      player.x,
      player.y,
      32,
      32,
      this.getRandomHexColor(),
    );
    this.players.set(player.id, rect);
  }

  private handlePlayerMovement(id: string, newX: number, newY: number) {
    const player = this.players.get(id);
    if (player) {
      player.setPosition(newX, newY);
    }
  }
}
