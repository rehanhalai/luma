# Feature Specification: Private Rooms

## 1. Overview

Allows players to create temporary, private game rooms with randomly generated alphanumeric codes (e.g. `7K9X2B`). The room creator can share the room code or direct invite link with friends.

All user-generated rooms are strictly private by design. They are never listed in the public room directory to prevent orphaned rooms. When all players leave a private room, a 3-minute grace period timer starts; if no one rejoins within 3 minutes, the room is deleted from both memory and the database.

TanStack Query (`@tanstack/react-query`) is introduced on the frontend to manage query caching and server-state mutations.

---

## 2. Requirements & Behavior

### A. Room Creation (`POST /rooms`)

- All rooms created via this endpoint are **strictly private** (`isPrivate: true` hardcoded by the server).
- Generates a unique, non-guessable 6-character uppercase alphanumeric code (e.g. `K9X2B4`).
- Associates the room with default Town Square map (`mapId: 1`) and capacity (default: 10).
- Sets `isPrivate: true` in the database record.
- Returns the created `Room` object.

### B. Room Discovery & Visibility

- `GET /rooms`: Returns only public rooms (`where: { isPrivate: false }`).
- Existing seeded rooms (`town-square`, `tavern`, `park`) remain permanently public.
- User-generated rooms are excluded from the public directory.

### C. Joining a Private Room

- **Direct Link**: Navigating to `/room?code=K9X2B4&name=Alice&avatar=...` validates the room exists and connects the player.
- **Lobby Code Input**: Players can enter a 6-character room code in the lobby to join.
- If the room does not exist, return `404 Not Found` (REST) or `'room not found'` error event (Socket).

### D. In-Game Room Sharing

- When inside a private room, the UI displays the room code and a "Copy Invite Link" button so the host/players can easily share it.

### E. Inactivity & Lifecycle Management (Grace Period)

- Active game sessions remain stored in memory (`RoomsGateway.rooms`).
- When a player disconnects:
  - If `roomState.players.size === 0` and `room.isPrivate === true`:
    - Server starts a 3-minute grace countdown.
- If any player joins that room before the 3 minutes expire:
  - The server cancels the countdown immediately; the room stays alive.
- If the 3-minute countdown completes without any joins:
  - Server removes the room from memory (`this.rooms.delete(code)`).
  - Server deletes the room row from the database (`prisma.room.delete`).
- Permanent public rooms (`isPrivate: false`) are never scheduled for deletion.

### F. Frontend State Management (TanStack Query)

- Install `@tanstack/react-query` in `apps/web`.
- Cache room queries (`useQuery({ queryKey: ['rooms'], queryFn: getRooms })`).
- Cache avatar and category queries.
- Use `useMutation` for `createPrivateRoom` to handle pending states and navigation.

---

## 3. Out of Scope (Non-Goals)

- **User-Created Public Rooms**: Users can only create private rooms. Public rooms are curated/seeded.
- **Passwords / PINs**: Unnecessary friction; 6-character random entropy provides over 2 billion combinations and acts as the capability secret.
- **Custom Map Selection / Uploads**: Private rooms use the default Town Square map (`mapId: 1`).
- **User Accounts / Auth**: Luma uses guest display names and avatar selections.
- **Room Expiry for Public Rooms**: Seeded public rooms are permanent and never deleted.

---

## 4. Data Contracts

### Database (`packages/database/prisma/schema.prisma`)

```prisma
model Room {
  id          Int      @id @default(autoincrement())
  name        String
  code        String   @unique
  description String?
  maxCapacity Int      @default(50)
  isPrivate   Boolean  @default(true)
  mapId       Int
  map         Map      @relation(fields: [mapId], references: [id], onDelete: Restrict)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### Shared Types (`packages/types`)

```ts
export interface CreateRoomDto {
  name?: string;
  maxCapacity?: number;
}
```

### REST Endpoints (`apps/api`)

- `GET /rooms`: Returns `Room[]` where `isPrivate === false`.
- `GET /rooms/:code`: Returns `Room` (public or private).
- `POST /rooms`: Creates and returns new private `Room` (`isPrivate: true` enforced).

---

## 5. Affected Files

1. `packages/database/prisma/schema.prisma`: Add `isPrivate Boolean @default(false)` to `Room`.
2. `packages/types/src/models.ts`: Add `CreateRoomDto`.
3. `apps/api/src/rooms/rooms.service.ts`:
   - Filter `findAll()` by `isPrivate: false`.
   - Add `createPrivateRoom(dto)` generating unique 6-char code and setting `isPrivate: true`.
   - Add `deleteRoom(code)` for grace period teardown.
4. `apps/api/src/rooms/rooms.controller.ts`:
   - Add `@Post()` endpoint to call `roomsService.createPrivateRoom()`.
5. `apps/api/src/rooms/rooms.gateway.ts`:
   - Cancel scheduled deletion on connection if pending.
   - Schedule 3-minute deletion on last disconnect if room is private.
6. `apps/web/package.json`: Add `@tanstack/react-query`.
7. `apps/web/src/App.tsx`: Provide `QueryClientProvider`.
8. `apps/web/src/modules/lobby/api/lobby.api.ts`: Add `createPrivateRoom()`.
9. `apps/web/src/modules/lobby/hooks/useLobby.ts`: Refactor to use `useQuery` and `useMutation`.
10. `apps/web/src/modules/lobby/components/RoomList.tsx` or `LobbyPage.tsx`:

- Add "Create Private Room" action and "Join via Code" input.

11. `apps/web/src/modules/game/GamePage.tsx`:

- Add top-right HUD pill showing room code and "Copy Link" button.

---

## 6. Verification Checklist

- [ ] `pnpm --filter @repo/database db:generate` passes.
- [ ] `pnpm --filter @repo/types build` passes.
- [ ] `pnpm format` and `pnpm lint` pass cleanly with no errors.
- [ ] Public rooms list displays only seeded public rooms.
- [ ] Clicking "Create Private Room" creates a private room using TanStack Query mutation and navigates in.
- [ ] Entering code in "Join via Code" navigates into that private room.
- [ ] Disconnecting all players starts grace period; reconnecting within 3 minutes cancels teardown; leaving empty for 3 minutes deletes it.
