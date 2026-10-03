import process from 'node:process';
import { parseArgs, printHelp, SAMPLE_AVATARS, BOT_NAMES } from './config.js';
import { BotClient, RoomBounds } from './BotClient.js';
import { BotCollisionGrid } from './collision.js';

interface RoomResponse {
  id: number;
  code: string;
  name: string;
  mapId: number;
}

interface MapResponse {
  id: number;
  width: number;
  height: number;
  mapData: any;
}

async function fetchMap(
  apiUrl: string,
  mapId: number,
): Promise<MapResponse | null> {
  try {
    const res = await fetch(`${apiUrl}/maps/${mapId}`);
    if (res.ok) {
      return res.json();
    }
  } catch {
    // fallback
  }
  return null;
}

async function resolveRoom(
  apiUrl: string,
  explicitCode?: string,
): Promise<{ code: string; bounds: RoomBounds; mapData?: any }> {
  const defaultBounds: RoomBounds = {
    minX: 60,
    maxX: 3500,
    minY: 60,
    maxY: 2000,
  };

  if (explicitCode) {
    try {
      const res = await fetch(
        `${apiUrl}/rooms/${encodeURIComponent(explicitCode)}`,
      );
      if (res.ok) {
        const room: RoomResponse = await res.json();
        const map = await fetchMap(apiUrl, room.mapId);
        const bounds: RoomBounds = {
          minX: 60,
          maxX: Math.max(300, (map?.width || 3600) - 60),
          minY: 60,
          maxY: Math.max(300, (map?.height || 2100) - 60),
        };
        return {
          code: explicitCode,
          bounds,
          mapData: map?.mapData,
        };
      }
    } catch {
      // API might not have HTTP open or custom room
    }
    return { code: explicitCode, bounds: defaultBounds };
  }

  // Auto-detect room
  try {
    const res = await fetch(`${apiUrl}/rooms`);
    if (!res.ok) {
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }
    const rooms: RoomResponse[] = await res.json();
    if (!Array.isArray(rooms) || rooms.length === 0) {
      throw new Error(
        'No rooms currently exist in the database. Please create a room from the UI first.',
      );
    }

    const firstRoom = rooms[0];
    if (!firstRoom) {
      throw new Error('First room not found in room list');
    }

    const map = await fetchMap(apiUrl, firstRoom.mapId);

    const bounds: RoomBounds = {
      minX: 60,
      maxX: Math.max(300, (map?.width || 3600) - 60),
      minY: 60,
      maxY: Math.max(300, (map?.height || 2100) - 60),
    };

    return {
      code: firstRoom.code,
      bounds,
      mapData: map?.mapData,
    };
  } catch (err: any) {
    throw new Error(
      `Could not auto-detect active rooms from ${apiUrl}/rooms (${err.message}).\n` +
        `Ensure the NestJS API is running, or explicitly provide a room code: pnpm bot --code <ROOM_CODE>`,
    );
  }
}

async function fetchAvatars(apiUrl: string): Promise<string[]> {
  try {
    const res = await fetch(`${apiUrl}/avatars`);
    if (res.ok) {
      const data = await res.json();
      if (Array.isArray(data) && data.length > 0) {
        return data.map((a: any) => a.path).filter(Boolean);
      }
    }
  } catch {
    // Fall back to SAMPLE_AVATARS
  }
  return SAMPLE_AVATARS;
}

async function main() {
  const config = parseArgs();

  if (config.showHelp) {
    printHelp();
    process.exit(0);
  }

  console.log('\n🤖 \x1b[1m\x1b[36mLuma Automated Bot Simulator\x1b[0m');
  console.log(`📡 Connecting to API: \x1b[33m${config.apiUrl}\x1b[0m`);

  const {
    code: roomCode,
    bounds,
    mapData,
  } = await resolveRoom(config.apiUrl, config.roomCode);
  const avatars = await fetchAvatars(config.apiUrl);

  let collision: BotCollisionGrid | undefined;
  if (mapData) {
    try {
      collision = new BotCollisionGrid(mapData);
      console.log(
        `🛡️  Collision Grid: \x1b[32m${collision.width}x${collision.height} tiles\x1b[0m (${collision.worldWidth}x${collision.worldHeight}px world)`,
      );
    } catch (err: any) {
      console.warn(
        `⚠️  Could not initialize collision grid: ${err.message}`,
      );
    }
  }

  console.log(`📍 Target Room: \x1b[32m${roomCode}\x1b[0m`);
  console.log(
    `🗺️ Map Boundaries: X [${bounds.minX} - ${bounds.maxX}], Y [${bounds.minY} - ${bounds.maxY}]`,
  );
  console.log(
    `👥 Spawning \x1b[35m${config.botCount}\x1b[0m simulated players...\n`,
  );

  const bots: BotClient[] = [];

  for (let i = 0; i < config.botCount; i++) {
    const name =
      BOT_NAMES[i % BOT_NAMES.length] +
      (i >= BOT_NAMES.length ? `-${i + 1}` : '');
    const avatar =
      avatars[i % avatars.length] || '/assets/sprites/Female/Female-01-1.webp';

    const bot = new BotClient(
      name,
      avatar,
      roomCode,
      config.apiUrl,
      config.stepSpeed,
      config.intervalMs,
      bounds,
      collision,
    );

    try {
      await bot.connect();
      bots.push(bot);
      console.log(
        `  \x1b[32m✓\x1b[0m \x1b[1m${name}\x1b[0m connected [avatar: \x1b[90m${avatar}\x1b[0m]`,
      );
    } catch (err: any) {
      console.error(
        `  \x1b[31m✗\x1b[0m Failed to connect ${name}: ${err.message}`,
      );
    }

    // Stagger joins by 150ms for realistic entry
    await new Promise((r) => setTimeout(r, 150));
  }

  if (bots.length === 0) {
    console.error('\n❌ No bots were able to connect. Exiting.');
    process.exit(1);
  }

  console.log(
    '\n🎮 \x1b[32mAll bots are wandering with collision navigation!\x1b[0m',
  );
  console.log(
    '   Open your browser at \x1b[4mhttp://localhost:5173\x1b[0m to see them running visually.',
  );
  console.log(
    '   Press \x1b[1mCtrl+C\x1b[0m to cleanly disconnect all bots.\n',
  );

  // Periodic heartbeat / status output every 3 seconds
  const statusTimer = setInterval(() => {
    const activeCount = bots.filter((b) => b.isConnected).length;
    const totalPackets = bots.reduce((acc, b) => acc + b.state.packetsSent, 0);
    const summary = bots
      .map(
        (b) => `${b.name}: (${b.state.x}, ${b.state.y}) [${b.state.direction}]`,
      )
      .join(' | ');

    process.stdout.write(
      `\r📊 Active: ${activeCount}/${bots.length} | Packets: ${totalPackets} | ${summary.slice(0, 100)}...`,
    );
  }, 3000);

  // Graceful shutdown handling
  let isShuttingDown = false;
  const shutdown = () => {
    if (isShuttingDown) return;
    isShuttingDown = true;
    clearInterval(statusTimer);

    console.log('\n\n🛑 Disconnecting all simulated bots from room...');
    bots.forEach((bot) => bot.disconnect());
    console.log('✓ All bots disconnected cleanly.');
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}

main().catch((err) => {
  console.error('\n❌ Error:', err.message);
  process.exit(1);
});
