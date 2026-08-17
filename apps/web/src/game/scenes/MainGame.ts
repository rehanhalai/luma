import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { initAnimations } from '../utils/animations';
import { NetworkManager } from '../networks/NetworkManager';
import { movementInputManager } from '../utils/input';

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

  public players = new Map<string, Phaser.GameObjects.Sprite>();
  public networkManager: NetworkManager;
  public cursors: Phaser.Types.Input.Keyboard.CursorKeys;

  preload() {
    this.load.spritesheet('character', '/assets/sprite/character.svg', {
      frameWidth: 64,
      frameHeight: 96,
    });
  }
  create() {
    this.cameras.main.setBackgroundColor(0x90ee90);

    initAnimations(this);
    this.networkManager = new NetworkManager(this);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
    }

    EventBus.emit('current-scene-ready', this);
  }

  update() {
    movementInputManager(this);
  }
}
