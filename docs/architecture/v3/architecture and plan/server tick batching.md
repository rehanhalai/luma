in short, instead of broadcasting each player's move individually and multiple time, we will collect all the changes/udpates for 50ms and then broadcase them all at the same time as single broadcast message.

ex: if 10 players are moving, for 1 second. it would broadcase 200 event each player per second \* 10 = 2000 payloads in socket!
but instead of that we will collect all the messages for 50ms and broadcasting them will results as, only 20 broadcast payloads per second in total, regardless of how many players are moving.

```mermaid
sequenceDiagram

autonumber

actor P1 as Player 1

actor P2 as Player 2

actor P3 as Player 3

participant S as Server Buffer (50ms)

participant C as Other Clients



Note over P1,P3: Within a 50ms window...

P1->>S: move (x: 120, y: 300)

P2->>S: move (x: 840, y: 110)

P1->>S: move (x: 125, y: 300) [overwrites P1]

P3->>S: move (x: 450, y: 620)



Note over S: ⏱️ 50ms Tick Fires!

S->>C: batchMove [ [P1, 125, 300], [P2, 840, 110], [P3, 450, 620] ]

Note over S: Buffer Cleared for next 50ms
```
