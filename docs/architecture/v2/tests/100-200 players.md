## **_date: 2nd oct,2026_**

- so i just ran the bot simulator with 200 players and here is the results
  - The Node.js crashed: The NestJS API process crashed and exited with 
  - `Error: Connection terminated unexpectedly`

![[Pasted image 20261002195504.png]]

---

![[Pasted image 20261002194216.png]]

### What happened? (The Math of 200 Bots)

#### 1. The Event Loop Flood ($O(N^2)$ Broadcasting)

At bot #133:

- 133 bots were each sending a movement packet every 150ms (~886 moves per second).
- Whenever a bot moves, the server broadcasts that move to all other clients in the room:
  $$\text{886 moves/sec} \times 133 \text{ clients} = \mathbf{\sim 118,000 \text{ WebSocket messages/sec!}}$$
- Your terminal shows **165,212 packets** processed in just a few seconds!

#### 2. Event Loop Starvation

Node.js runs on a **single thread**. Serializing 118,000 JSON messages per second completely clogged the Node event loop (CPU spiked to 100%, leaving 0ms of CPU time for other tasks).

#### 3. Postgres Handshake Timeout

While the event loop was frozen processing those 165k WebSocket messages:

- New bots (Bot #134, #135...) were still trying to connect.
- In `handleConnection()`, every new bot connection triggers:

`const room = await this.roomService.findOneWithMap(code); // Database query!`

- The connection to Postgres hung because Node's event loop was too busy to process the TCP packets.
- Postgres waited, gave up, and logged:

`2026-10-02 14:03:55 FATAL: canceling authentication due to timeout`

- Postgres forcibly severed the TCP socket.

#### 4. The Crash

When Postgres closed the socket, `@prisma/adapter-pg` / `pg-pool` emitted: `Error: Connection terminated unexpectedly` ➔ because it wasn't caught in an error handler, **Node.js crashed**.

---

# Things to optimize

#### the handleConnection issue.

- currently the server is quering the db for room data on each player connection. in high traffic of frequent players connecting to the room, this single query is is overwhelming the node's event loop and causing the timeout error from db.
- fix: we can prevent the query on each connection and use the cached data from the memory and query only when there is no data of that room in the RAM.
