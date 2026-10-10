import Phaser from 'phaser';
import type { RoomScene } from '../scenes/RoomScene';

export class MinimapManager {
  private scene: RoomScene;
  public camera!: Phaser.Cameras.Scene2D.Camera;
  private graphics!: Phaser.GameObjects.Graphics;
  private border!: Phaser.GameObjects.Graphics;
  private size = 180;
  private padding = 16;
  private zoom = 1;
  private worldWidth: number;
  private worldHeight: number;
  public isVisible = true;
  private readonly headerHeight = 28;
  private readonly panelPadding = 6;
  private header!: Phaser.GameObjects.Text;
  private playerCount!: Phaser.GameObjects.Text;

  constructor(scene: RoomScene, tilemap: Phaser.Tilemaps.Tilemap) {
    this.scene = scene;

    // Tilemap layers in RoomScene are scaled by 3
    this.worldWidth = tilemap.widthInPixels * 3;
    this.worldHeight = tilemap.heightInPixels * 3;

    this.initCamera();
    this.initGraphics();
    this.initListeners();
    this.initHeader();
  }

  private getLayout() {
    const x = this.scene.scale.width - this.size - this.padding;
    const panelY =
      this.scene.scale.height -
      this.size -
      this.headerHeight -
      this.panelPadding * 2 -
      this.padding;

    return {
      x,
      panelY,
      mapY: panelY + this.headerHeight + this.panelPadding,
      panelHeight: this.headerHeight + this.panelPadding * 2 + this.size,
    };
  }

  private initCamera() {
    const { x, mapY } = this.getLayout();
    this.camera = this.scene.cameras.add(x, mapY, this.size, this.size);

    // Calculate dynamic zoom to fit the entire world within the minimap viewport
    const zoomX = this.size / this.worldWidth;
    const zoomY = this.size / this.worldHeight;
    this.zoom = Math.min(zoomX, zoomY);

    this.camera.setZoom(this.zoom);
    this.camera.centerOn(this.worldWidth / 2, this.worldHeight / 2);
    this.camera.setBackgroundColor(0x111118);
    this.camera.setRoundPixels(true);

    // Ignore existing player name tags in minimap camera
    this.scene.players.forEach((sprite) => {
      const nameTag = sprite.getData('nameTag') as
        | Phaser.GameObjects.Text
        | undefined;
      if (nameTag) {
        this.camera.ignore(nameTag);
      }
    });
  }

  private initGraphics() {
    // 1. World-space graphics for minimap indicators (dots + viewport box)
    this.graphics = this.scene.add.graphics();
    this.graphics.setDepth(999);
    // Main game camera ignores the minimap indicators
    this.scene.cameras.main.ignore(this.graphics);

    // 2. Screen-space border around the minimap viewport
    this.border = this.scene.add.graphics();
    this.border.setScrollFactor(0);
    this.border.setDepth(1000);
    // Minimap camera ignores its own border
    this.camera.ignore(this.border);

    this.drawBorder();
  }

  private drawBorder() {
    this.border.clear();

    const { x, panelY, panelHeight } = this.getLayout();

    // Panel background
    this.border.fillStyle(0x10131b, 0.96);
    this.border.fillRoundedRect(
      x - this.panelPadding,
      panelY,
      this.size + this.panelPadding * 2,
      panelHeight,
      10,
    );

    // Subtle outline
    this.border.lineStyle(1, 0x343b4b, 0.9);
    this.border.strokeRoundedRect(
      x - this.panelPadding,
      panelY,
      this.size + this.panelPadding * 2,
      panelHeight,
      10,
    );

    // Header separator
    this.border.lineStyle(1, 0xffffff, 0.08);
    this.border.lineBetween(
      x - this.panelPadding + 8,
      panelY + this.headerHeight,
      x + this.size + this.panelPadding - 8,
      panelY + this.headerHeight,
    );
  }

  private initHeader() {
    const { x, panelY } = this.getLayout();

    this.header = this.scene.add.text(
      x - this.panelPadding + 8,
      panelY + 7,
      'CAMPUS',
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        fontStyle: 'bold',
        color: '#78716c',
        letterSpacing: 1.5,
      },
    );

    this.playerCount = this.scene.add.text(
      x + this.size + this.panelPadding - 8,
      panelY + 7,
      '0 PLAYERS',
      {
        fontFamily: 'Arial, sans-serif',
        fontSize: '10px',
        color: '#94a3b8',
      },
    );

    this.playerCount.setOrigin(1, 0);

    for (const text of [this.header, this.playerCount]) {
      text.setScrollFactor(0);
      text.setDepth(1001);

      // Prevent the text from appearing inside either camera's world.
      this.scene.cameras.main.ignore(text);
      this.camera.ignore(text);
    }
  }

  private initListeners() {
    // Handle window resize
    this.scene.scale.on('resize', this.handleResize, this);

    // Toggle with 'M' key
    if (this.scene.input.keyboard) {
      const keyM = this.scene.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.M,
      );
      keyM.on('down', () => {
        if (this.scene.registry.get('isChatFocused')) {
          return;
        }
        this.toggle();
      });
    }

    // Cleanup on scene shutdown or destroy
    this.scene.events.once('shutdown', this.destroy, this);
    this.scene.events.once('destroy', this.destroy, this);
  }

  private handleResize(gameSize: Phaser.Structs.Size) {
    if (!this.camera || !this.border) return;

    const x = gameSize.width - this.size - this.padding;
    const y = gameSize.height - this.size - this.padding;

    this.camera.setPosition(x, y);
    this.drawBorder();
  }

  public toggle() {
    this.isVisible = !this.isVisible;
    this.camera.setVisible(this.isVisible);
    this.graphics.setVisible(this.isVisible);
    this.border.setVisible(this.isVisible);
  }

  public update() {
    if (!this.isVisible || !this.graphics || !this.camera) return;

    this.graphics.clear();

    // 1. Draw Viewport Box (where main camera is currently looking)
    const mainCam = this.scene.cameras.main;
    const view = mainCam.worldView;

    // Viewport box stroke
    this.graphics.lineStyle(2.5 / this.zoom, 0xffffff, 0.85);
    this.graphics.strokeRect(view.x, view.y, view.width, view.height);

    // 2. Draw Players
    const localSocketId = this.scene.networkManager?.socket?.id;

    this.scene.players.forEach((sprite, id) => {
      if (!sprite.active) return;

      const isLocal = id === localSocketId;

      if (isLocal) {
        // Local Player: Bright neon emerald green with outer glow
        this.graphics.fillStyle(0x00ff88, 0.35);
        this.graphics.fillCircle(sprite.x, sprite.y, 9 / this.zoom);
        this.graphics.fillStyle(0x00ff88, 1);
        this.graphics.fillCircle(sprite.x, sprite.y, 6 / this.zoom);
      } else {
        // Remote Players: Golden yellow
        this.graphics.fillStyle(0xffcc00, 0.35);
        this.graphics.fillCircle(sprite.x, sprite.y, 7.5 / this.zoom);
        this.graphics.fillStyle(0xffcc00, 1);
        this.graphics.fillCircle(sprite.x, sprite.y, 5 / this.zoom);
      }
    });
  }

  public destroy() {
    this.scene.scale.off('resize', this.handleResize, this);

    if (this.camera) {
      this.scene.cameras.remove(this.camera);
    }
    if (this.graphics) {
      this.graphics.destroy();
    }
    if (this.border) {
      this.border.destroy();
    }
  }
}
