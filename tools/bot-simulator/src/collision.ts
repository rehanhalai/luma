export class BotCollisionGrid {
  public readonly width: number;
  public readonly height: number;
  public readonly tilePixels: number;
  public readonly worldWidth: number;
  public readonly worldHeight: number;
  private readonly grid: Uint8Array;

  constructor(rawMapData: any, scale = 3) {
    const mapData =
      typeof rawMapData === 'string'
        ? JSON.parse(rawMapData)
        : rawMapData || {};

    this.width = mapData.width || 80;
    this.height = mapData.height || 60;
    const tileWidth = mapData.tilewidth || 16;
    const tileHeight = mapData.tileheight || 16;

    this.tilePixels = tileWidth * scale; // 48px
    this.worldWidth = this.width * this.tilePixels;
    this.worldHeight = this.height * (tileHeight * scale);

    const solidGids = this.extractSolidGids(mapData.tilesets);
    this.grid = this.buildGrid(mapData.layers, solidGids);
  }

  private extractSolidGids(tilesets: any): Set<number> {
    const solidGids = new Set<number>();
    if (!Array.isArray(tilesets)) {
      return solidGids;
    }

    for (const ts of tilesets) {
      if (!Array.isArray(ts.tiles)) {
        continue;
      }
      const firstgid = ts.firstgid ?? 1;
      for (const tile of ts.tiles) {
        const isSolid = tile.properties?.some(
          (p: any) => p.name === 'collide' && p.value === true,
        );
        if (isSolid) {
          solidGids.add(firstgid + tile.id);
        }
      }
    }

    return solidGids;
  }

  private buildGrid(layers: any, solidGids: Set<number>): Uint8Array {
    const grid = new Uint8Array(this.width * this.height);
    if (!Array.isArray(layers) || solidGids.size === 0) {
      return grid;
    }

    for (const layer of layers) {
      if (layer.type !== 'tilelayer' || !Array.isArray(layer.data)) {
        continue;
      }

      for (let i = 0; i < layer.data.length; i++) {
        const cleanGid = layer.data[i] & 0x1fffffff;
        if (solidGids.has(cleanGid)) {
          grid[i] = 1;
        }
      }
    }

    return grid;
  }

  isSolid(tileX: number, tileY: number): boolean {
    if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
      return true;
    }
    return this.grid[tileY * this.width + tileX] === 1;
  }

  isWalkable(x: number, y: number): boolean {
    if (
      x < 30 ||
      x > this.worldWidth - 30 ||
      y < 30 ||
      y > this.worldHeight - 30
    ) {
      return false;
    }

    const padX = 14;
    const padY = 10;
    const corners = [
      { cx: x - padX, cy: y - padY },
      { cx: x + padX, cy: y - padY },
      { cx: x - padX, cy: y + padY },
      { cx: x + padX, cy: y + padY },
    ];

    for (const { cx, cy } of corners) {
      const tx = Math.floor(cx / this.tilePixels);
      const ty = Math.floor(cy / this.tilePixels);
      if (this.isSolid(tx, ty)) {
        return false;
      }
    }

    return true;
  }
}
