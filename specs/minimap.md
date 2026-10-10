# Feature Specification: Dynamic Minimap

## 1. Overview

Adds a real-time, dynamic minimap to the bottom-right corner of the game screen using Phaser's multi-camera system (`this.cameras.add()`). The minimap provides a scaled-down, full-world bird's-eye view of the active map and all players.

It automatically computes scale and zoom based on the loaded map dimensions, ensuring it works dynamically with the default Town Square map and any future maps.

---

## 2. Requirements & Behavior

### A. Secondary Camera Architecture

- Implemented natively via Phaser's `this.cameras.add(x, y, width, height)`.
- Renders the actual live tilemap layers and player sprites.
- Ignored elements: Main camera ignores minimap HUD graphics; minimap camera ignores player floating nametags to prevent visual clutter.

### B. Dynamic Full-Map Fit

- Minimap viewport: Fixed HUD dimension (e.g., `180x180` px or `200x200` px).
- Zoom level is dynamically derived from map bounds:
  $$\text{zoom} = \min\left(\frac{\text{minimapWidth}}{\text{worldWidth}}, \frac{\text{minimapHeight}}{\text{worldHeight}}\right)$$
  where $\text{worldWidth} = \text{tilemap.widthInPixels} \times 3$ and $\text{worldHeight} = \text{tilemap.heightInPixels} \times 3$.
- Center point: Centered on the geometric center of the world so the full map is visible at all times.

### C. Screen Placement & Responsiveness

- Docked in the **bottom-right corner** with 16px padding from screen edges, opposite the bottom-left chat box.
- Listens to Phaser scale resize events (`this.scale.on('resize')`) to maintain bottom-right anchoring when resizing the browser window.
- Styled with a sleek semi-transparent dark border and background (`#111116` with thin border).

### D. High-Visibility Player Markers & Viewport Box

- Drawn on a dedicated `minimapGraphics` layer (ignored by the main camera):
  - **Local Player**: Bright emerald green indicator dot (`#00ff88`).
  - **Remote Players**: Golden yellow indicator dots (`#ffcc00`).
  - **Viewport Box**: A high-contrast stroke rectangle showing the main camera's current visible viewing frustum (`cameras.main.worldView`).
- Indicator sizes scale inversely with zoom ($r \propto 1 / \text{zoom}$) so markers remain clear and readable on any map resolution.

### E. Interactivity & Toggling

- **'M' Hotkey**: Toggles the minimap visibility (show/hide).
- **Chat Guard**: When the player is focused on chat input (`registry.get('isChatFocused') === true`), typing the letter 'M' must NOT toggle the minimap.
- **HUD Toggle Button**: A subtle toggle icon button overlaid on/near the minimap for mouse users.

---

## 3. Out of Scope (Non-Goals)

- **Fog of War / Discovery Masking**: Full map is visible immediately.
- **Click-to-Move / Click-to-Pan**: Minimap is display-only with toggle; clicking it does not move the player character or change camera scroll.
- **Server-Side Networking Changes**: The minimap runs entirely client-side using existing socket player position streams (`scene.players`). No backend or socket protocol changes needed.
- **Custom Map Editor**: Minimap reads existing Tiled JSON map metadata dynamically.

---

## 4. Technical Design (`apps/web`)

### Component Breakdown

1. **`MinimapManager.ts`** (`apps/web/src/modules/game/phaser/utils/minimap.ts`):
   - Encapsulates secondary camera creation, dynamic zoom calculation, window resize handling, indicator drawing, and toggle logic.
   - Cleans up camera and listeners on scene shutdown/destroy.
2. **`RoomScene.ts`**:
   - Instantiates `MinimapManager` in `create()` after map layers and network manager are ready.
   - Calls `minimapManager.update()` inside `update()` to redraw player dots and viewport frustum.
3. **`animations.ts`**:
   - Ensures newly spawned player nametags are ignored by the minimap camera.

---

## 5. Affected Files

1. `specs/minimap.md`: Feature specification.
2. `apps/web/src/modules/game/phaser/utils/minimap.ts`: [NEW] `MinimapManager` class.
3. `apps/web/src/modules/game/phaser/scenes/RoomScene.ts`: Initialize and update minimap.
4. `apps/web/src/modules/game/phaser/utils/animations.ts`: Ignore nametags on minimap camera.

---

## 6. Verification Checklist

- [x] `pnpm build` passes with zero type errors.
- [x] `pnpm format` and `pnpm lint` pass with no errors.
- [x] Minimap renders in the bottom-right corner showing the full town map.
- [x] Local player is marked with a green indicator dot; remote players are marked with yellow dots.
- [x] Viewport box moves and tracks the main camera scroll as the player moves.
- [x] Pressing `M` toggles the minimap on and off.
- [x] Typing `M` in the chat input does NOT toggle the minimap.
- [x] Resizing the browser window keeps the minimap docked cleanly in the bottom-right.
- [x] Leaving the room and returning does not crash or leak camera instances.
