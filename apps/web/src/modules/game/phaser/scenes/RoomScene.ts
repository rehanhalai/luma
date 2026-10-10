import { Scene } from 'phaser';
import { EventBus } from '../EventBus';
import { initAnimations } from '../utils/animations';
import { NetworkManager } from '../../networks/NetworkManager';
import { movementInputManager } from '../utils/input';
import { MinimapManager } from '../utils/minimap';
import type { RoomParams } from '../config';

export class RoomScene extends Scene {
  constructor() {
    super('RoomScene');
  }

  public roomParams!: RoomParams;
  public players = new Map<string, Phaser.Physics.Arcade.Sprite>();
  public networkManager!: NetworkManager;
  public cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  public keys!: Record<'w' | 's' | 'a' | 'd', Phaser.Input.Keyboard.Key>;
  public mapLayers: Phaser.Tilemaps.TilemapLayer[] = [];
  public minimapManager?: MinimapManager;

  init() {
    this.roomParams = this.registry.get('roomParams') as RoomParams;
  }

  preload() {
    const avatarPath = this.roomParams?.avatar;

    this.load.spritesheet(avatarPath, avatarPath, {
      frameWidth: 32,
      frameHeight: 32,
    });
    const mapData = this.roomParams?.map;
    if (mapData) {
      this.load.image('tiles', mapData.tilesetPath);
      const rawMap = mapData.mapData;
      if (rawMap && typeof rawMap === 'object') {
        this.load.tilemapTiledJSON('map', rawMap);
      }
    }
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
    this.networkManager = new NetworkManager(this, this.roomParams);
    this.minimapManager = new MinimapManager(this, map);

    if (this.input.keyboard) {
      this.cursors = this.input.keyboard.createCursorKeys();
      this.keys = this.input.keyboard.addKeys('w,s,a,d', false) as Record<
        string,
        Phaser.Input.Keyboard.Key
      >;
    }

    const handleChatFocus = (isFocused: boolean) => {
      if (!this.sys?.isActive() || !this.input?.keyboard?.manager) {
        return;
      }
      this.registry.set('isChatFocused', isFocused);
      if (isFocused) {
        this.input.keyboard.disableGlobalCapture();
        this.input.keyboard.enabled = false;
      } else {
        this.input.keyboard.enableGlobalCapture();
        this.input.keyboard.enabled = true;
      }
    };
    EventBus.on('chat-focus-changed', handleChatFocus);
    this.events.once('shutdown', () => {
      EventBus.off('chat-focus-changed', handleChatFocus);
    });
    this.events.once('destroy', () => {
      EventBus.off('chat-focus-changed', handleChatFocus);
    });

    EventBus.emit('current-scene-ready', this);
  }

  update() {
    movementInputManager(this);
    this.minimapManager?.update();
  }
}
