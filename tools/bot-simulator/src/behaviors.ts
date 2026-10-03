import type { BotCollisionGrid } from './collision.js';

export type Direction = 'u' | 'd' | 'l' | 'r' | 's';

export interface BotState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  direction: Direction;
  pauseTicksRemaining: number;
  packetsSent: number;
  stuckTicks?: number;
}

export function pickNewWaypoint(
  currentX: number,
  currentY: number,
  collision?: BotCollisionGrid,
  minX = 100,
  maxX = 3500,
  minY = 100,
  maxY = 2000,
): { targetX: number; targetY: number } {
  // If collision grid is available, pick a candidate that is guaranteed walkable
  const maxAttempts = 30;
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    // Distance to wander per path segment (between 100 and 300 pixels)
    const distance = 100 + Math.random() * 200;
    const angle = Math.random() * Math.PI * 2;

    const rawX = Math.round(currentX + Math.cos(angle) * distance);
    const rawY = Math.round(currentY + Math.sin(angle) * distance);

    const targetX = Math.max(minX, Math.min(maxX, rawX));
    const targetY = Math.max(minY, Math.min(maxY, rawY));

    if (!collision || collision.isWalkable(targetX, targetY)) {
      return { targetX, targetY };
    }
  }

  // Fallback directional searches if random attempts hit obstacles
  if (collision) {
    const angles = [
      0,
      Math.PI / 4,
      Math.PI / 2,
      (3 * Math.PI) / 4,
      Math.PI,
      (5 * Math.PI) / 4,
      (3 * Math.PI) / 2,
      (7 * Math.PI) / 4,
    ];
    for (const d of [120, 80, 50]) {
      for (const a of angles) {
        const tx = Math.max(
          minX,
          Math.min(maxX, Math.round(currentX + Math.cos(a) * d)),
        );
        const ty = Math.max(
          minY,
          Math.min(maxY, Math.round(currentY + Math.sin(a) * d)),
        );
        if (collision.isWalkable(tx, ty)) {
          return { targetX: tx, targetY: ty };
        }
      }
    }
  }

  return { targetX: currentX, targetY: currentY };
}

export function computeNextStep(
  state: BotState,
  speed: number,
  collision?: BotCollisionGrid,
  minX = 50,
  maxX = 3600,
  minY = 50,
  maxY = 2100,
): { x: number; y: number; direction: Direction } {
  // If the bot is currently resting in idle pose:
  if (state.pauseTicksRemaining > 0) {
    state.pauseTicksRemaining--;
    state.direction = 's';
    return { x: state.x, y: state.y, direction: 's' };
  }

  const dx = state.targetX - state.x;
  const dy = state.targetY - state.y;
  const dist = Math.hypot(dx, dy);

  // Arrived at destination waypoint
  if (dist < speed) {
    state.x = state.targetX;
    state.y = state.targetY;
    state.stuckTicks = 0;

    const nextWp = pickNewWaypoint(
      state.x,
      state.y,
      collision,
      minX,
      maxX,
      minY,
      maxY,
    );
    state.targetX = nextWp.targetX;
    state.targetY = nextWp.targetY;

    // ~35% chance to stand idle for 10-25 ticks (~1.5s - 3.5s)
    if (Math.random() < 0.35) {
      state.pauseTicksRemaining = Math.floor(10 + Math.random() * 15);
      state.direction = 's';
      return { x: state.x, y: state.y, direction: 's' };
    }
  }

  // Attempt movement along primary axis first, or slide along secondary axis if blocked
  const preferX = Math.abs(dx) >= Math.abs(dy);

  // Candidate move along X
  let candX = state.x;
  let dirX: Direction = 'r';
  if (dx > 0) {
    candX = Math.min(maxX, state.x + Math.min(speed, dx));
    dirX = 'r';
  } else if (dx < 0) {
    candX = Math.max(minX, state.x - Math.min(speed, -dx));
    dirX = 'l';
  }

  // Candidate move along Y
  let candY = state.y;
  let dirY: Direction = 'd';
  if (dy > 0) {
    candY = Math.min(maxY, state.y + Math.min(speed, dy));
    dirY = 'd';
  } else if (dy < 0) {
    candY = Math.max(minY, state.y - Math.min(speed, -dy));
    dirY = 'u';
  }

  let finalX = state.x;
  let finalY = state.y;
  let finalDir: Direction = 's';
  let moved = false;

  if (preferX) {
    // Try primary X
    if (candX !== state.x && (!collision || collision.isWalkable(candX, state.y))) {
      finalX = candX;
      finalY = state.y;
      finalDir = dirX;
      moved = true;
    } else if (
      candY !== state.y &&
      (!collision || collision.isWalkable(state.x, candY))
    ) {
      // Slide along Y
      finalX = state.x;
      finalY = candY;
      finalDir = dirY;
      moved = true;
    }
  } else {
    // Try primary Y
    if (candY !== state.y && (!collision || collision.isWalkable(state.x, candY))) {
      finalX = state.x;
      finalY = candY;
      finalDir = dirY;
      moved = true;
    } else if (
      candX !== state.x &&
      (!collision || collision.isWalkable(candX, state.y))
    ) {
      // Slide along X
      finalX = candX;
      finalY = state.y;
      finalDir = dirX;
      moved = true;
    }
  }

  if (moved) {
    state.x = finalX;
    state.y = finalY;
    state.direction = finalDir;
    state.stuckTicks = 0;
    return { x: finalX, y: finalY, direction: finalDir };
  }

  // If blocked in both directions, handle obstacle
  state.stuckTicks = (state.stuckTicks || 0) + 1;
  if (state.stuckTicks >= 2) {
    const newWp = pickNewWaypoint(
      state.x,
      state.y,
      collision,
      minX,
      maxX,
      minY,
      maxY,
    );
    state.targetX = newWp.targetX;
    state.targetY = newWp.targetY;
    state.stuckTicks = 0;
  }

  state.direction = 's';
  return { x: state.x, y: state.y, direction: 's' };
}
