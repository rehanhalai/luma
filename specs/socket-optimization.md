# Feature Specification: Socket Optimization & Spatial Scalability

## 1. Overview

Enhance real-time networking performance to scale beyond the current ~85 player browser bottleneck. The goal is to support **200+ concurrent active players** on a map with smooth 60fps rendering and minimal network latency.

The optimization will be tackled in three modular phases:

1. **Phase 1**: Server Tick Movement Batching (Immediate packet rate reduction).
2. **Phase 2**: Spatial Interest Management / Area of Interest (AOI Grid) ($O(N^2) \to O(N)$ broadcast reduction).
3. **Phase 3**: Binary Payload Serialization (Bandwidth & JSON parsing CPU reduction).

---

## 2. Current Bottlenecks (Baseline at 85 Players)

1. **Unbatched WebSocket Frame Flooding**:
   - Each player/bot emits movement independently at ~15–20Hz.
   - For 85 active players, each web client receives **1,000–1,200 distinct WebSocket frames per second**.
   - The single-threaded browser event loop spends excessive time unpacking WebSocket frames.

2. **Full-Room Broadcasts ($O(N^2)$)**:
   - On a large map (3840×2880), players in opposite corners still receive every position update from each other.
   - At $N = 100$, packet volume across the room reaches $\sim 100 \times 100 \times 20 = 200,000$ messages/sec server-wide.

3. **Verbose JSON Payloads**:
   - Every movement is serialized as `[stringId, x, y, direction]`, taking ~55 bytes per individual packet (including Socket.io message framing).

---

## 3. Optimization Phases

### Phase 1: Server Tick Movement Batching

- **Mechanism**:
  - Instead of broadcasting on every incoming client message (`client.broadcast.emit`), the server records the latest position of moved players in a room buffer.
  - A fixed server tick timer (e.g., **20Hz / 50ms** or **30Hz / 33ms**) flushes the buffer and broadcasts a single batched array of moved players.
- **Impact**:
  - Drops incoming WebSocket frames from **1,200 frames/sec down to 20 frames/sec** per client.
  - Eliminates browser event-loop starvation with zero disruption to movement responsiveness.

### Phase 2: Spatial Interest Management (Area of Interest / AOI Grid)

- **Mechanism**:
  - Partition the 3840×2880 world into a spatial grid of cells (e.g., cell size $800\text{px} \times 800\text{px}$ or $960\text{px} \times 720\text{px}$).
  - Each player tracks their active cell coordinate `(cellX, cellY)`.
  - Clients only receive movement updates for players located in their current cell + the 8 adjacent surrounding cells (3×3 neighborhood).
  - Handles cell transitions: when a player enters/leaves interest range, the server emits `playerSpawn`/`playerDespawn` or reuses existing join/left events.
- **Minimap Synergy**:
  - The tactical radar uses an 800px scan radius. Players within the 3×3 AOI cells cover the entire radar radius.
- **Impact**:
  - Transforms overall network traffic from $O(N^2)$ to $O(N \cdot k)$ where $k$ is local cluster density.
  - Allows 200+ bots to wander across the map without overwhelming any single player's client.

### Phase 3: Binary Payload Serialization (`ArrayBuffer` / TypedArrays)

- **Mechanism**:
  - Assign each player a short numeric ID (`uint16` / 2 bytes) upon joining.
  - Encode batched movement updates into a binary `ArrayBuffer`:
    - Per player: `id` (2 bytes) + `x` (2 bytes) + `y` (2 bytes) + `direction` (1 byte enum: 0=u, 1=d, 2=l, 3=r, 4=s) = **7 bytes per player**.
    - Header: 1 byte player count.
  - Total frame for 20 nearby moving players in one tick: $\sim 141\text{ bytes}$ (vs 20 separate JSON packets totaling $\sim 1,100\text{ bytes}$ at $\sim 55\text{ bytes}$ each).
- **Impact**:
  - Cuts network bandwidth by **85–90%**.
  - Bypasses `JSON.parse` and `JSON.stringify` entirely on both server and client.

---

## 4. Proposed Data Contracts & Protocol Changes

### Phase 1 Contract (Batched JSON)

```ts
// packages/types/src/socket.ts
export type BatchedMovementEntry = [
  id: string,
  x: number,
  y: number,
  direction: Direction,
];

export interface ServerToClientEvents {
  // Replaces or augments single 'move' event:
  batchMove: (updates: BatchedMovementEntry[]) => void;
  // ...existing chat, join, left events unchanged
}
```

### Phase 2 Contract (AOI Interest Events)

```ts
export interface ServerToClientEvents {
  batchMove: (updates: BatchedMovementEntry[]) => void;
  playerEnterRange: (player: Player) => void;
  playerLeaveRange: (playerId: string) => void;
}
```

### Phase 3 Contract (Binary Protocol)

```ts
// Binary packet layout:
// [Count: Uint8] + Count * [ID: Uint16, X: Uint16, Y: Uint16, Dir: Uint8]
export type BinaryMovementBuffer = ArrayBuffer;
```

---

## 5. Affected Files

1. **`packages/types/src/socket.ts`**:
   - Add batched / binary movement payload types.
2. **`apps/api/src/rooms/rooms.gateway.ts`**:
   - Room tick loop management (accumulate & flush movements).
   - Spatial grid partitioning & interest subscription tracking.
3. **`apps/web/src/modules/game/networks/NetworkManager.ts`**:
   - Handle batched/binary incoming payloads and dispatch updates to scene.
4. **`apps/web/src/modules/game/phaser/scenes/RoomScene.ts` & `animations.ts`**:
   - Batch unpack player movements and interpolate positions.
5. **`tools/bot-simulator/src/BotClient.ts`**:
   - Update simulator to support new socket event protocol.

---

## 6. Implementation Sequence

1. **Step 1: Phase 1 — Server Tick Movement Batching**:
   - Implement 20Hz tick buffer in `rooms.gateway.ts`.
   - Update client listener in `NetworkManager.ts` and `handlePlayerMovement`.
   - Test with `pnpm bot --count 100` and measure packet rate.
2. **Step 2: Phase 2 — Spatial Grid / AOI**:
   - Implement spatial grid manager in API room state.
   - Broadcast batched ticks only to relevant cell neighbors.
   - Test with `pnpm bot --count 150` to `200`.
3. **Step 3: Phase 3 — Binary Buffer Encoding**:
   - Implement `ArrayBuffer` packing in gateway and unpacking in web client.
   - Verify bandwidth reduction in browser network devtools.
