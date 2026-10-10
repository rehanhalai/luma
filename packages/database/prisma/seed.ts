import 'dotenv/config';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';
import { PrismaPg } from '@prisma/adapter-pg';
import { PrismaClient } from '../src/generated/client.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const connectionString = `${process.env.DATABASE_URL}`;
const pool = new Pool({ connectionString });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('clearing the db before seed');
  await prisma.room.deleteMany({});
  await prisma.map.deleteMany({});
  await prisma.avatar.deleteMany({});

  console.log('🌱 Starting Seed...');

  // 1. Read Tiled Map JSON from packages/database/data/town.json
  const townJsonPath = path.resolve(__dirname, '../data/town.json');
  let townJson: any = null;
  if (fs.existsSync(townJsonPath)) {
    townJson = JSON.parse(fs.readFileSync(townJsonPath, 'utf-8'));
    console.log('  ✓ Loaded town.json from packages/database/data/town.json');
  } else {
    console.warn(`  ⚠️ Could not find map file at ${townJsonPath}`);
  }

  const mapScale = 3;
  const mapWidth = townJson
    ? (townJson.width || 80) * (townJson.tilewidth || 16) * mapScale
    : 3840;
  const mapHeight = townJson
    ? (townJson.height || 60) * (townJson.tileheight || 16) * mapScale
    : 2880;

  // 2. Seed or Upsert Default Map with mapData
  const map = await prisma.map.upsert({
    where: { id: 1 },
    update: {
      name: 'Town Square',
      tilesetPath: '/assets/maps/tilemap_packed.png',
      width: mapWidth,
      height: mapHeight,
      spawnX: 100,
      spawnY: 100,
      mapData: townJson,
    },
    create: {
      name: 'Town Square',
      tilesetPath: '/assets/maps/tilemap_packed.png',
      width: mapWidth,
      height: mapHeight,
      spawnX: 1500,
      spawnY: 1300,
      mapData: townJson,
    },
  });

  // 2. Seed 3 Rooms using the same map
  const roomsToSeed = [
    {
      code: 'town-square',
      name: 'Town Square',
      description: 'Main public gathering square',
      mapId: map.id,
      maxCapacity: 50,
      isPrivate: false,
    },
    {
      code: 'tavern',
      name: 'The Tavern',
      description: 'Cozy social hangout spot',
      mapId: map.id,
      maxCapacity: 50,
      isPrivate: false,
    },
    {
      code: 'park',
      name: 'Central Park',
      description: 'Relaxing outdoor green space',
      mapId: map.id,
      maxCapacity: 50,
      isPrivate: false,
    },
  ];

  for (const r of roomsToSeed) {
    const seededRoom = await prisma.room.upsert({
      where: { code: r.code },
      update: r,
      create: r,
    });
    console.log(`🏠 Seeded room: ${seededRoom.name} (${seededRoom.code})`);
  }

  // 3. Scan sprites directory and categorize avatars
  const spritesDir = path.resolve(
    __dirname,
    '../../../apps/web/public/assets/sprites',
  );
  const avatarData: Array<{
    name: string;
    key: string;
    path: string;
    category: string;
  }> = [];

  function scanSprites(dir: string, currentCategory: string) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isFile() && entry.name.endsWith('.webp')) {
        const baseName = path.parse(entry.name).name;
        const relativePath = path
          .relative(
            path.resolve(__dirname, '../../../apps/web/public'),
            fullPath,
          )
          .replace(/\\/g, '/');

        const cleanKey = `${currentCategory.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${baseName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;

        avatarData.push({
          name: baseName,
          key: cleanKey,
          path: `/${relativePath}`,
          category: currentCategory,
        });
      } else if (entry.isDirectory()) {
        let nextCategory = currentCategory;
        if (currentCategory === 'Default') {
          nextCategory =
            entry.name === 'Japanese-school-characters'
              ? 'Japanese School'
              : entry.name;
        }
        scanSprites(fullPath, nextCategory);
      }
    }
  }

  scanSprites(spritesDir, 'Default');

  console.log(
    `🎭 Found ${avatarData.length} avatars across categories. Seeding to database...`,
  );

  const result = await prisma.avatar.createMany({
    data: avatarData,
    skipDuplicates: true,
  });

  console.log(`✅ Seeded ${result.count} new avatars!`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    await pool.end();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    await pool.end();
    process.exit(1);
  });
