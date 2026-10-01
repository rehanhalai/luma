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
    },
    {
      code: 'tavern',
      name: 'The Tavern',
      description: 'Cozy social hangout spot',
      mapId: map.id,
      maxCapacity: 30,
    },
    {
      code: 'park',
      name: 'Central Park',
      description: 'Relaxing outdoor green space',
      mapId: map.id,
      maxCapacity: 40,
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

  const rootEntries = fs.readdirSync(spritesDir, { withFileTypes: true });
  for (const entry of rootEntries) {
    if (entry.isFile() && entry.name.endsWith('.webp')) {
      const baseName = path.parse(entry.name).name;
      avatarData.push({
        name: baseName,
        key: baseName.toLowerCase(),
        path: `/assets/sprites/${entry.name}`,
        category: 'Default',
      });
    } else if (entry.isDirectory()) {
      const category = entry.name;
      const categoryDir = path.join(spritesDir, category);
      const spriteFiles = fs.readdirSync(categoryDir);

      for (const file of spriteFiles) {
        if (file.endsWith('.webp')) {
          const baseName = path.parse(file).name;
          avatarData.push({
            name: baseName,
            key: `${category.toLowerCase()}-${baseName.toLowerCase()}`,
            path: `/assets/sprites/${category}/${file}`,
            category: category,
          });
        }
      }
    }
  }

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
