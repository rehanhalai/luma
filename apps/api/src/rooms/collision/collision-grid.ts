interface TiledProperty {
  name: string;
  type?: string;
  value: unknown;
}

interface TiledTile {
  id: number;
  properties?: TiledProperty[];
}

interface TiledTileset {
  firstgid?: number;
  name?: string;
  tiles?: TiledTile[];
}

interface TiledLayer {
  type: string;
  data?: number[];
}

interface TiledMapData {
  width?: number;
  height?: number;
  tilewidth?: number;
  tileheight?: number;
  tilesets?: TiledTileset[];
  layers?: TiledLayer[];
}

export class CollisionGrid {
  public readonly width: number;
  public readonly height: number;
  public readonly tilePixels: number;
  public readonly worldWidth: number;
  public readonly worldHeight: number;
  private readonly grid: Uint8Array; // 1 = solid, 0 = walkable

  constructor(rawMapData: unknown, scale = 3) {
    const mapData = (
      typeof rawMapData === 'string'
        ? JSON.parse(rawMapData)
        : rawMapData || {}
    ) as TiledMapData;

    this.width = mapData.width || 80;
    this.height = mapData.height || 60;
    const tileWidth = mapData.tilewidth || 16;
    const tileHeight = mapData.tileheight || 16;

    this.tilePixels = tileWidth * scale; // 16 * 3 = 48px
    this.worldWidth = this.width * this.tilePixels;
    this.worldHeight = this.height * (tileHeight * scale);

    const solidGids = this.extractSolidGids(mapData.tilesets);
    this.grid = this.buildGrid(mapData.layers, solidGids);
  }

  private extractSolidGids(tilesets?: TiledTileset[]): Set<number> {
    const solidGids = new Set<number>();
    if (!Array.isArray(tilesets)) {
      return solidGids;
    }

    for (const ts of tilesets) {
      if (!Array.isArray(ts.tiles)) {
        continue;
      }
      const firstgid = typeof ts.firstgid === 'number' ? ts.firstgid : 1;
      for (const tile of ts.tiles) {
        const isSolid = tile.properties?.some(
          (p) => p.name === 'collide' && p.value === true,
        );
        if (isSolid) {
          solidGids.add(firstgid + Number(tile.id));
        }
      }
    }

    return solidGids;
  }

  private buildGrid(
    layers: TiledLayer[] | undefined,
    solidGids: Set<number>,
  ): Uint8Array {
    const grid = new Uint8Array(this.width * this.height);
    if (!Array.isArray(layers) || solidGids.size === 0) {
      return grid;
    }

    for (const layer of layers) {
      if (layer.type !== 'tilelayer' || !Array.isArray(layer.data)) {
        continue;
      }

      for (let i = 0; i < layer.data.length; i++) {
        const rawGid = layer.data[i] ?? 0;
        const cleanGid = rawGid & 0x1fffffff;
        if (solidGids.has(cleanGid)) {
          grid[i] = 1;
        }
      }
    }

    return grid;
  }

  isSolid(tileX: number, tileY: number): boolean {
    if (tileX < 0 || tileX >= this.width || tileY < 0 || tileY >= this.height) {
      return true; // Out of bounds is considered solid
    }
    return this.grid[tileY * this.width + tileX] === 1;
  }

  isWalkableWorld(x: number, y: number): boolean {
    // Basic map bounds check
    if (x < 0 || x > this.worldWidth || y < 0 || y > this.worldHeight) {
      return false;
    }

    // Foot hitbox: 24px wide, 16px tall centered at (x, y)
    const padX = 12;
    const padY = 8;

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
