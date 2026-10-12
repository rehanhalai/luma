**Test Date:** October 3, 2026  
**Focus:** Concurrency stress testing (50 vs 150 players) on WebSocket Gateway  
**Purpose:** Project Engineering Documentary & Architecture Log

---

## 1. Test Objective

Before implementing real-time chat and proximity-based voice communication, we conducted a stress test on our WebSocket architecture (`/game` namespace) to:

1. Determine the maximum concurrent player load the system can handle on a single server instance.
2. Verify if Socket.IO room partitioning (`town-square`, `tavern`, `park`) effectively isolates network traffic.
3. Identify the exact failure mode when the system reaches its concurrency ceiling.

---

## 2. Test Setup & Methodology

- **Server Under Test:** NestJS WebSocket Gateway running on Node.js (single event loop).
- **Map:** 3840×2880 px world with an 80×60 collision grid.
- **Client Under Test:** Phaser 3 game client running in Chrome on WebGL.
- **Load Generation Tool:** Custom bot simulator (`tools/bot-simulator`) generating simulated players with A\* collision navigation, autonomous wandering, and ~20 Hz movement updates.
- **Environment:** Single local development machine running the server, web client, and bot processes.

---

## 3. Experiment 1: Single Room Load Test (50 Players)

### Configuration

```bash
pnpm bot --code town-square --count 50
# + 1 active human player connected via browser
```

### Observations

- **Packet Volume:** Exceeded **74,000+ packets** during the run.
- **Browser Performance:** Stable **60 FPS**. Local player movement was responsive and instantaneous.
- **Remote Player Visuals:** 50 simulated bots moved smoothly across the screen with proper walk animations and collision avoidance. No stuttering or jitter.
- **Server Metrics:** Node.js CPU usage remained around **10–15%**.
- **Teardown Test:** On `Ctrl+C`, all 50 bots disconnected cleanly; server purged in-memory states with zero memory leaks.

### Outcome: **PASS**

A single room running at maximum designed capacity (50 players) operates smoothly with plenty of headroom.

---

## 4. Experiment 2: Multi-Room Stress Test (153 Players across 3 Rooms)

### Configuration

Three concurrent bot processes were launched simultaneously into three isolated database rooms:

- **Terminal 1:** `pnpm bot --code town-square --count 50`
- **Terminal 2:** `pnpm bot --code park --count 50`
- **Terminal 3:** `pnpm bot --code tavern --count 50`
- **Browser:** 1 human player navigating inside `town-square`.

### Observations

- **Packet Volume:** Rapidly scaled past **220,000+ total movement packets** across the three processes.
- **Browser Rendering:** The browser viewport itself maintained **60 FPS**. The local player character moved cleanly with zero keyboard input lag.
- **Failure Symptom (The Lag):** **Severe Rubberbanding & Teleporting.**  
  Remote players in the room would periodically freeze in place for 300–500ms, and then suddenly "snap" or teleport forward several tiles in an instant burst.

### Outcome: **FAILURE at 150 concurrent players**

While 50 players in one room was effortless, running 150 players simultaneously caused significant visual lag and position stutter.

---

## 5. Technical Root Cause Analysis

Because the browser was still rendering at 60 FPS, the bottleneck was **not** client GPU/rendering lag. It was **Node.js event loop socket buffer queueing**.

### The Flaw: The "Immediate Echo" Architecture

Currently, the gateway uses an immediate echo broadcast pattern:

```typescript
@SubscribeMessage('move')
handleMovement(@ConnectedSocket() client, @MessageBody() [x, y, direction]) {
  // Executes IMMEDIATELY on every single incoming move packet:
  client.broadcast.to(roomCode).emit('move', [client.id, player.x, player.y, direction]);
}
```

### The Math Behind the Crash:

1. **Incoming Traffic:**  
   $153\text{ players} \times 20\text{ packets/sec} = \mathbf{3,060\text{ incoming packets/sec}}$.
2. **Outgoing Broadcast Operations:**  
   For every incoming move, Socket.IO iterates over all ~50 players in that room and writes to their individual TCP socket buffers.  
   $$3\text{ rooms} \times (50\text{ players} \times 20\text{ moves/sec} \times 49\text{ peers}) \approx \mathbf{147,000\text{ socket buffer writes/second}}$$
3. **Event Loop Starvation:**  
   Node.js runs on a **single thread**. Attempting 147,000 socket writes per second saturates the event loop. Outgoing packets cannot be dispatched immediately and queue up in the OS TCP buffer.
4. **Burst Flushing & Snapping:**  
   When the event loop finally catches up, it flushes 5 to 10 queued movement packets for a player in the exact same millisecond.
5. **No Client Interpolation:**  
   Because the client directly sets `sprite.x = newX` upon receiving a packet, receiving 5 delayed packets at once causes the sprite to pause (packet delay) and then teleport (burst arrival).

---

## 6. Conclusions & Architectural Next Steps

The load test successfully identified the boundary of our current architecture and gave us two concrete requirements for scaling:

```
[Current: Immediate Echo]
150 Players  -->  3,060 In/s  -->  147,000 Out/s (Saturates Node Event Loop) 💥

[Target: Server Tick Batching]
150 Players  -->  Update In-Memory (Instant)  -->  20 Ticks/s  -->  3,000 Out/s (98% Drop!) 🚀
```

### 1. Server-Side: Implement Server Tick Batching

- Incoming client movements should **only update the player's in-memory `(x, y)` coordinates** (takes `< 0.001ms`).
- A 20 Hz server tick timer (`setInterval` every 50ms) gathers all players who moved in that room and sends **ONE batch message per room**:
  ```json
  [
    "tick",
    [
      ["bot1", 1200, 1300, "r"],
      ["bot2", 1450, 1100, "u"]
    ]
  ]
  ```
- **Result:** Reduces server socket writes from **147,000 writes/sec down to 3,000 writes/sec** (a **98% workload reduction**).

### 2. Client-Side: Linear Interpolation (`lerp`)

- Instead of snapping `sprite.x = newX` directly, the client smoothly interpolates between the previous coordinate and the new target over 50ms.
- This eliminates all visible teleporting and rubberbanding, even during minor network jitter.
