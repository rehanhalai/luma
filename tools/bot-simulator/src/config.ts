import process from 'node:process';

export interface BotConfig {
  apiUrl: string;
  roomCode?: string;
  botCount: number;
  intervalMs: number;
  stepSpeed: number;
  showHelp: boolean;
}

export const SAMPLE_AVATARS: string[] = [
  '/assets/sprites/Female/Female-01-1.webp',
  '/assets/sprites/Male/Male-01-1.webp',
  '/assets/sprites/Female/Female-02-1.webp',
  '/assets/sprites/Male/Male-02-1.webp',
  '/assets/sprites/Female/Female-03-1.webp',
  '/assets/sprites/Male/Male-03-1.webp',
  '/assets/sprites/Animal/Animal-01-1.webp',
  '/assets/sprites/Soldier/Soldier-01-1.webp',
  '/assets/sprites/Enemy/Enemy-01-1.webp',
  '/assets/sprites/Boss/Boss-01-1.webp',
];

export const BOT_NAMES: string[] = [
  'Bot-Alpha',
  'Bot-Bravo',
  'Bot-Echo',
  'Bot-Nova',
  'Bot-Vortex',
  'Bot-Blaze',
  'Bot-Kitsune',
  'Bot-Shadow',
  'Bot-Pixel',
  'Bot-Titan',
  'Bot-Zephyr',
  'Bot-Cyber',
];

export function parseArgs(): BotConfig {
  const args = process.argv.slice(2);
  const getArg = (flag: string) => {
    const idx = args.indexOf(flag);
    return idx !== -1 ? args[idx + 1] : undefined;
  };

  const showHelp = args.includes('--help') || args.includes('-h');

  return {
    apiUrl: getArg('--url') || 'http://localhost:3000',
    roomCode: getArg('--code'),
    botCount: Math.max(1, parseInt(getArg('--count') || '4', 10)),
    intervalMs: Math.max(50, parseInt(getArg('--interval') || '150', 10)),
    stepSpeed: Math.max(1, parseInt(getArg('--speed') || '16', 10)),
    showHelp,
  };
}

export function printHelp() {
  console.log(`
Luma Bot Simulator
Simulate realistic players connected to the NestJS WebSocket Gateway.

Usage:
  pnpm bot [options]

Options:
  --code <roomCode>   Room code to join (auto-detects first active room if omitted)
  --count <number>    Number of bots to spawn (default: 4)
  --url <url>         API & WebSocket server URL (default: http://localhost:3000)
  --interval <ms>     Movement emit interval in milliseconds (default: 150)
  --speed <pixels>    Movement distance per step tick (default: 16)
  --help, -h          Show this help message

Examples:
  pnpm bot
  pnpm bot --code ROOM-123 --count 6
  pnpm bot --count 10 --interval 100 --speed 20
`);
}
