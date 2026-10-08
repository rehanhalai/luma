# Feature Specification: In-Game Chat System

## 1. Overview

Real-time text chat enabling players in the same room to communicate. Messages are broadcast to all room occupants and displayed in an overlay on the game screen.

## 2. Requirements & Behavior

- **Room Scoped**: Messages are sent only to players inside the current room.
- **Message Constraints**: Max 200 characters per message. Trim whitespace; reject empty messages.
- **Input Focus & Movement**: While the chat input is focused, Phaser keyboard controls (WASD, arrows) must be paused so the player does not move while typing.
- **Sending Messages**: Pressing `Enter` or clicking "Send" emits the message and clears the input. Pressing `Escape` or clicking outside blurs the input and restores player movement.
- **Message Feed**: Displays recent messages with sender name, message body, and timestamp. Automatically scrolls to the newest message.

## 3. Out of Scope (Non-Goals)

Do NOT implement or modify any of the following:

- **Voice / Audio / WebRTC**: No voice chat, audio streaming, or WebRTC channels. Text-only via existing Socket.io.
- **Movement & Physics Logic**: Do not alter movement physics, velocity, collisions, or tilemap systems. Only toggle the input pause state.
- **Database Persistence**: Do not store messages in the database or modify Prisma schemas. Messages live in memory for the active room session only.
- **Direct Messages (DMs)**: No private messaging or player-to-player whispering. All messages are public to the room.
- **Rich Media & Attachments**: No file uploads, image attachments, or emoji pickers. Plain text only.

## 4. Data Contracts (`packages/types/src/socket.ts`)

### Data Model

```ts
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  message: string;
  timestamp: number;
}
```

### Socket Events

- **Client to Server**:
  - `sendMessage: (message: string) => void`
- **Server to Client**:
  - `chatMessage: (data: ChatMessage) => void`

## 5. Affected Files

1. `packages/types/src/socket.ts`: Add `ChatMessage` type, update `ClientToServerEvents` and `ServerToClientEvents`.
2. `apps/api/src/rooms/rooms.gateway.ts`: Add `@SubscribeMessage('sendMessage')`, validate input, and broadcast `chatMessage` to the room.
3. `apps/web/src/modules/game/networks/NetworkManager.ts`: Add `sendMessage(text: string)` and listen for `chatMessage`.
4. `apps/web/src/modules/game/phaser/utils/input.ts`: Skip movement updates when chat input is focused.
5. `apps/web/src/modules/game/components/ChatBox.tsx`: React overlay component for message list and input.
6. `apps/web/src/modules/game/GamePage.tsx`: Mount `ChatBox` over the Phaser canvas.

## 6. Verification Checklist

- [ ] `pnpm --filter @repo/types build` passes cleanly.
- [ ] `pnpm format` and `pnpm lint` pass with no errors.
- [ ] Connect two players to the same room: messages sent from Player A appear on Player B's screen in real time.
- [ ] Typing WASD in chat does not move the player character.
