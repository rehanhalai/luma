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

  public players = new Map<string, Phaser.Physics.Arcade.Sprite>();
  public networkManager: NetworkManager;
  public cursors: Phaser.Types.Input.Keyboard.CursorKeys;
  public keys: Record<string, Phaser.Input.Keyboard.Key>;
  public mapLayers: Phaser.Tilemaps.TilemapLayer[] = [];

  preload() {
    this.load.baseURL = '/assets';
    this.load.spritesheet('character', '/sprite/character.svg', {
      frameWidth: 64,
      frameHeight: 96,
    });
    this.load.image('tiles', '/maps/tilemap_packed.png');
    this.load.tilemapTiledJSON('map', '/maps/town.json');
  }
  create() {
    this.cameras.main.setBackgroundColor(0x90ee90);
    initAnimations(this);
    const map = this.make.tilemap({
      key: 'map',
      tileWidth: 16,
      tileHeight: 16,
    });

    const tileset = map.addTilesetImage('tilemap_packed', 'tiles');
    if (tileset) {
      map.layers.forEach((layer) => {
        const l = map.createLayer(layer.name, tileset, 0, 0);
        l?.setScale(3);
        l?.setCollisionByProperty({ collide: true });
        this.mapLayers.push(l as Phaser.Tilemaps.TilemapLayer);
      });
    }
    this.networkManager = new NetworkManager(this);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keys = this.input.keyboard.addKeys('w,s,a,d') as Record<
        string,
        Phaser.Input.Keyboard.Key
      >;
    }

    EventBus.emit('current-scene-ready', this);
  }

  update() {
    movementInputManager(this);
  }
}
