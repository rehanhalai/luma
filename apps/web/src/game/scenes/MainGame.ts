import { GameObjects, Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { io, Socket } from 'socket.io-client';

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

  private players = new Map<string, Phaser.GameObjects.Sprite>();
  private cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  private socket: Socket;
  private character: GameObjects.Sprite;

  preload() {
    this.load.spritesheet('character', '/assets/sprite/character.svg', {
      frameHeight: 95,
      frameWidth: 70,
    });
  }
  create() {
    this.socket = io('http://localhost:3000', {
      path: '/room',
      query: {
        name: 'rehan',
      },
    });
    this.cameras.main.setBackgroundColor(0x90ee90);
    this.socket.on('currentPlayers', (data: Player[]) => {
      data.forEach((player) => {
        this.setupSocketListeners(player);
      });
    });

    this.socket.on('playerJoined', (data: Player) => {
      this.setupSocketListeners(data);
    });

    this.socket.on('playerLeft', (data: Player) => {
      const rect = this.players.get(data.id);
      if (rect) {
        rect.destroy();
        this.players.delete(data.id);
      }
    });

    this.socket.on('playerMoved', (data: Partial<Player>) => {
      this.handlePlayerMovement(data.id, data.x, data.y);
    });

    this.events.on('shutdown', () => {
      this.socket.disconnect();
    });

    EventBus.emit('current-scene-ready', this);

    this.anims.create({
      key: 'walk-up',
      frames: this.anims.generateFrameNumbers('character', {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }
  }

  update() {
    const myBox = this.players.get(this.socket.id);
    if (!myBox || !this.cursors) return;

    let moved = false;
    const speed = 4;

    if (this.cursors.left.isDown) {
      myBox.x -= speed;
      moved = true;
    } else if (this.cursors.right.isDown) {
      myBox.x += speed;
      moved = true;
    }

    if (this.cursors.up.isDown) {
      myBox.y -= speed;
      moved = true;
    } else if (this.cursors.down.isDown) {
      myBox.y += speed;
      moved = true;
    }

    if (moved) {
      this.socket.emit('movement', { x: myBox.x, y: myBox.y });
    }
  }

  private setupSocketListeners(player: Player) {
    if (this.players.has(player.id)) return;
    const sprite = this.add.sprite(player.x, player.y, 'character');
    this.players.set(player.id, sprite);
  }

  private handlePlayerMovement(id: string, newX: number, newY: number) {
    const player = this.players.get(id);
    if (player) {
      player.x = newX;
      player.y = newY;
    }
  }
}
