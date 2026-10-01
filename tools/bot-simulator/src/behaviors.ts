export type Direction = 'up' | 'down' | 'left' | 'right' | 'stop';

export interface BotState {
  x: number;
  y: number;
  targetX: number;
  targetY: number;
  direction: Direction;
  pauseTicksRemaining: number;
  packetsSent: number;
}

export function pickNewWaypoint(
  currentX: number,
  currentY: number,
  minX = 100,
  maxX = 3500,
  minY = 100,
  maxY = 2000,
) {
  // Distance to wander per path segment (between 120 and 350 pixels)
  const distance = 120 + Math.random() * 230;
  const angle = Math.random() * Math.PI * 2;

  const rawX = Math.round(currentX + Math.cos(angle) * distance);
  const rawY = Math.round(currentY + Math.sin(angle) * distance);

  const targetX = Math.max(minX, Math.min(maxX, rawX));
  const targetY = Math.max(minY, Math.min(maxY, rawY));

  return { targetX, targetY };
}

export function computeNextStep(
  state: BotState,
  speed: number,
  minX = 50,
  maxX = 3600,
  minY = 50,
  maxY = 2100,
): { x: number; y: number; direction: Direction } {
  // If the bot is currently resting in idle pose:
  if (state.pauseTicksRemaining > 0) {
    state.pauseTicksRemaining--;
    state.direction = 'stop';
    return { x: state.x, y: state.y, direction: 'stop' };
  }

  const dx = state.targetX - state.x;
  const dy = state.targetY - state.y;
  const dist = Math.hypot(dx, dy);

  // Arrived at destination waypoint
  if (dist < speed) {
    state.x = state.targetX;
    state.y = state.targetY;

    const nextWp = pickNewWaypoint(state.x, state.y, minX, maxX, minY, maxY);
    state.targetX = nextWp.targetX;
    state.targetY = nextWp.targetY;

    // ~35% chance to stand idle for 10-25 ticks (~1.5s - 3.5s)
    if (Math.random() < 0.35) {
      state.pauseTicksRemaining = Math.floor(10 + Math.random() * 15);
      state.direction = 'stop';
      return { x: state.x, y: state.y, direction: 'stop' };
    }
  }

  // Move along the axis that has the largest delta
  let direction: Direction = 'down';
  let nextX = state.x;
  let nextY = state.y;

  if (Math.abs(dx) >= Math.abs(dy)) {
    if (dx > 0) {
      nextX = Math.min(maxX, state.x + Math.min(speed, dx));
      direction = 'right';
    } else {
      nextX = Math.max(minX, state.x - Math.min(speed, -dx));
      direction = 'left';
    }
  } else {
    if (dy > 0) {
      nextY = Math.min(maxY, state.y + Math.min(speed, dy));
      direction = 'down';
    } else {
      nextY = Math.max(minY, state.y - Math.min(speed, -dy));
      direction = 'up';
    }
  }

  state.x = nextX;
  state.y = nextY;
  state.direction = direction;

  return { x: nextX, y: nextY, direction };
}
