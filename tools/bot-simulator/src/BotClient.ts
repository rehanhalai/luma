import { io, Socket } from 'socket.io-client';
import {
  BotState,
  computeNextStep,
  pickNewWaypoint,
  Direction,
} from './behaviors.js';

export interface RoomBounds {
  minX: number;
  maxX: number;
  minY: number;
  maxY: number;
}

export class BotClient {
  public socket: Socket | null = null;
  public state: BotState;
  private intervalTimer: NodeJS.Timeout | null = null;
  public isConnected = false;

  constructor(
    public name: string,
    public avatar: string,
    public roomCode: string,
    public apiUrl: string,
    private stepSpeed: number,
    private intervalMs: number,
    private bounds: RoomBounds = { minX: 50, maxX: 3500, minY: 50, maxY: 2000 },
  ) {
    this.state = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      direction: 'stop',
      pauseTicksRemaining: 0,
      packetsSent: 0,
    };
  }

  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.apiUrl, {
        query: {
          code: this.roomCode,
          name: this.name,
          avatar: this.avatar,
        },
        transports: ['websocket'],
        reconnection: false,
      });

      this.socket.once('connect', () => {
        this.isConnected = true;
        resolve();
      });

      this.socket.once('connect_error', (err) => {
        this.isConnected = false;
        reject(err);
      });

      // Capture initial spawn point from the server's currentPlayers list
      this.socket.on('currentPlayers', (players: any[]) => {
        const me = players.find((p) => p.id === this.socket?.id);
        if (me) {
          this.state.x = me.x;
          this.state.y = me.y;
        } else {
          // Fallback spawn position if not found
          this.state.x = 200 + Math.floor(Math.random() * 400);
          this.state.y = 200 + Math.floor(Math.random() * 400);
        }

        const wp = pickNewWaypoint(
          this.state.x,
          this.state.y,
          this.bounds.minX,
          this.bounds.maxX,
          this.bounds.minY,
          this.bounds.maxY,
        );
        this.state.targetX = wp.targetX;
        this.state.targetY = wp.targetY;

        this.startMovementLoop();
      });

      this.socket.on('error', (errMsg) => {
        console.error(`  ⚠️ [${this.name}] Server error: ${errMsg}`);
      });
    });
  }

  private startMovementLoop() {
    let prevDirection: Direction = 'stop';

    this.intervalTimer = setInterval(() => {
      if (!this.socket?.connected) return;

      const { x, y, direction } = computeNextStep(
        this.state,
        this.stepSpeed,
        this.bounds.minX,
        this.bounds.maxX,
        this.bounds.minY,
        this.bounds.maxY,
      );

      // Emit movement when moving, or emit 'stop' once when halting
      if (direction !== 'stop' || prevDirection !== 'stop') {
        this.socket.emit('movement', { x, y, direction });
        this.state.packetsSent++;
        prevDirection = direction;
      }
    }, this.intervalMs);
  }

  disconnect() {
    if (this.intervalTimer) {
      clearInterval(this.intervalTimer);
      this.intervalTimer = null;
    }
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.isConnected = false;
  }
}
