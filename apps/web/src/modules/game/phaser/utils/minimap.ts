import type { RoomScene } from '../scenes/RoomScene';
import type { Direction } from '@repo/types';

export class MinimapManager {
  private scene: RoomScene;
  private graphics: Phaser.GameObjects.Graphics;
  private radius: number = 64;
  private worldRange: number = 800;
  private margin: number = 24;

  constructor(scene: RoomScene) {
    this.scene = scene;
    this.graphics = scene.add.graphics();
    this.graphics.setScrollFactor(0);
    this.graphics.setDepth(100);
  }

  public update(): void {
    const localId = this.scene.networkManager?.socket?.id;
    if (!localId) {
      this.graphics.clear();
      return;
    }

    const localPlayer = this.scene.players.get(localId);
    if (!localPlayer || !localPlayer.active) {
      this.graphics.clear();
      return;
    }

    const cx = this.scene.scale.width - this.margin - this.radius;
    const cy = this.scene.scale.height - this.margin - this.radius;

    this.graphics.clear();

    // 1. Radar Background (translucent black matching ChatBox bg-black/60)
    this.graphics.fillStyle(0x000000, 0.65);
    this.graphics.fillCircle(cx, cy, this.radius);

    // 2. Faint Crosshair Axes (subtle white matching ChatBox border-white/10)
    this.graphics.lineStyle(1, 0xffffff, 0.08);
    this.graphics.lineBetween(
      cx - this.radius + 6,
      cy,
      cx + this.radius - 6,
      cy,
    );
    this.graphics.lineBetween(
      cx,
      cy - this.radius + 6,
      cx,
      cy + this.radius - 6,
    );

    // 3. Inner Range Ring (half range)
    this.graphics.lineStyle(1, 0xffffff, 0.12);
    this.graphics.strokeCircle(cx, cy, this.radius * 0.5);

    // 4. Outer Rim Border (dark black border matching ChatBox)
    this.graphics.lineStyle(2, 0x000000, 0.9);
    this.graphics.strokeCircle(cx, cy, this.radius);
    this.graphics.lineStyle(1, 0xffffff, 0.12);
    this.graphics.strokeCircle(cx, cy, this.radius - 1);

    // 5. Other Players (Blips)
    this.scene.players.forEach((sprite, id) => {
      if (id === localId || !sprite.active) return;

      const dx = sprite.x - localPlayer.x;
      const dy = sprite.y - localPlayer.y;
      const dist = Math.hypot(dx, dy);

      if (dist <= this.worldRange) {
        // Inside range: position scaled inside radius
        const ratio = this.radius / this.worldRange;
        const bx = cx + dx * ratio;
        const by = cy + dy * ratio;

        this.graphics.fillStyle(0xfbbf24, 0.95);
        this.graphics.fillCircle(bx, by, 3);
      } else {
        // Outside range: clamp to edge along angle
        const angle = Math.atan2(dy, dx);
        const clampRadius = this.radius - 4;
        const bx = cx + Math.cos(angle) * clampRadius;
        const by = cy + Math.sin(angle) * clampRadius;

        this.graphics.fillStyle(0xfbbf24, 0.7);
        this.graphics.fillCircle(bx, by, 2.5);
      }
    });

    // 6. Local Player (Center Dot + Direction Indicator)
    this.graphics.fillStyle(0x38bdf8, 1);
    this.graphics.fillCircle(cx, cy, 4);

    const direction =
      (localPlayer.getData('direction') as Direction | undefined) || 'd';
    let dirX = 0;
    let dirY = 0;

    switch (direction) {
      case 'u':
        dirY = -8;
        break;
      case 'd':
        dirY = 8;
        break;
      case 'l':
        dirX = -8;
        break;
      case 'r':
        dirX = 8;
        break;
      default:
        dirY = 8;
    }

    this.graphics.lineStyle(2, 0x38bdf8, 1);
    this.graphics.lineBetween(cx, cy, cx + dirX, cy + dirY);
  }

  public destroy(): void {
    this.graphics.destroy();
  }
}
