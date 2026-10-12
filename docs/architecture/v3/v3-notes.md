### **_date: 3rd Oct, 2026_**

v2 is done and now its time for some chit chat features.
in this version. we are gonna implement

- real-time chat
- private room generation and connection
- proxitimity based voice communication
- minimap on corner with all player's realtime location on the map

things is done today

- the length of payloads of socket
- **Before**
  - uploading :
    - up -> 84
    - down ->86
    - right -> 73
    - left -> 59
  - getting :
    - up -> 105
    - down -> 118
    - right -> 119
    - left -> 118
- **After**
  - uploading :
    - up -> 32
    - down -> 32
    - right -> 32
    - left -> 32
  - getting :
    - up -> 55
    - down -> 55
    - right -> 55
    - left -> 55

#### Steps to reduce the payload and optimize the socket connection/communicaiton

- math.round to share non-floating values only
- add throttling to emit events with few milisecond interval
- shrinking the payload from object to array. and removing the key and sharing the values only in a perticular order

#### Results :

Here is the complete **Before vs. After** breakdown combining all 3 optimizations:

1. **Throttling** (~60 packets/sec $\rightarrow$ ~18 packets/sec)
2. **Positional Arrays + Rounded Integers** (no object keys or 16-digit floats)
3. **Event Name Shortening (`"move"`) + 1-Letter Direction (`"r"`, `"s"`)**

---

### 1. Payload Size Comparison on the Wire

#### Client $\rightarrow$ Server (Upload)

```json
BEFORE (88 bytes):
42/game,["movement",{"x":1863.333333333325,"y":1323.3333333333328,"direction":"right"}]

AFTER (32 bytes):
42/game,["move",[1863,1323,"r"]]
```

> 📉 **Size reduced by 64%** (32 bytes vs 88 bytes)

#### Server $\rightarrow$ Client Broadcast (Download)

```json
BEFORE (118 bytes):
42/game,["playerMoved",{"id":"cWMpBjhC1V2t-ExBAAAr","x":1863.333333333325,"y":1323.3333333333328,"direction":"right"}]

AFTER (58 bytes):
42/game,["move",["cWMpBjhC1V2t-ExBAAAr",1863,1323,"r"]]
```

> 📉 **Size reduced by 51%** (58 bytes vs 118 bytes)

### 2. Single Player Moving

| Metric               | Before All Changes | After All 3 Changes | Overall Savings             |
| :------------------- | :----------------- | :------------------ | :-------------------------- |
| **Emit Frequency**   | ~60 msgs / sec     | ~18 msgs / sec      | 📉 **70% fewer packets**    |
| **Packet Size**      | 88 bytes           | 32 bytes            | 📉 **64% smaller**          |
| **Upload Bandwidth** | **~5.28 KB / sec** | **~0.58 KB / sec**  | 📉 **89% less upload data** |

### 3. Server Impact: 10 Players Moving in a Room

The server broadcasts every moving player's position to the other 9 players:

| Metric                         | Before All Changes            | After All 3 Changes           | Real Impact                       |
| :----------------------------- | :---------------------------- | :---------------------------- | :-------------------------------- |
| **Incoming Packets to Server** | 600 packets / sec             | 180 packets / sec             | 420 fewer packet reads/sec        |
| **Outgoing Broadcast Packets** | **5,400 packets / sec**       | **1,620 packets / sec**       | **3,780 fewer socket writes/sec** |
| **Outgoing Server Bandwidth**  | **~637 KB / sec** (~5.1 Mbps) | **~94 KB / sec** (~0.75 Mbps) | 📉 **85.3% bandwidth saved**      |

### 4. Server Impact: 20 Players Moving in a Room

| Metric                         | Before All Changes              | After All 3 Changes            | Savings                      |
| :----------------------------- | :------------------------------ | :----------------------------- | :--------------------------- |
| **Outgoing Broadcast Packets** | **22,800 packets / sec**        | **6,840 packets / sec**        | **-15,960 packets / sec**    |
| **Outgoing Server Bandwidth**  | **~2.69 MB / sec** (~21.5 Mbps) | **~397 KB / sec** (~3.17 Mbps) | 📉 **85.2% bandwidth saved** |

more details in : [[50p-3room test]]

### **_date: 8th Oct, 2026_**

so today i realized that i'm not utilizing the AI capabilities enough, and that is why i'm implementing some AI pair programming advice in the code base such as agent.mt and .skills as per the requirements.
also trying out the specs driven development (SDD) as well!

- implemented the chatting feature!

### **_date: 10th Oct, 2026_**

- create a private room feature where the user can create their own private room and invite others to play with a room code.
- now any player can play with their own friend privately!

##### Socket optimization! (yes once again :))

The optimization will be tackled in three modular phases:

1. **Phase 1**: Server Tick Movement Batching (Immediate packet rate reduction).
2. **Phase 2**: Spatial Interest Management / Area of Interest (AOI Grid) (O(N2)→O(N)O(N2)→O(N) broadcast reduction).
3. **Phase 3**: Binary Payload Serialization (Bandwidth & JSON parsing CPU reduction).
   **Note** : detailed info can be found in repo's spec folder...
