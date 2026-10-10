# Feature Specification: In-Game Minimap (Tactical Radar)

## 1. Overview

Provides players with a real-time tactical radar minimap fixed to the bottom-right corner of the game screen. The radar is centered on the local player, scanning a local radius around them, showing nearby players as position dots and distant players clamped to the radar's edge.

The radar is rendered via Phaser Vector Graphics (`this.add.graphics`), ensuring zero network overhead, high-performance 60fps updates, and 100% dynamic compatibility with any future maps.

---

## 2. Requirements & Behavior

### A. Position & Geometry

- **Placement**: Docked in the bottom-right corner of the viewport (offset by ~24px padding), responsive to window resizing.
- **Shape & Size**: Circular radar with radius $R = 64\text{px}$ (diameter $128\text{px}$).
- **Scroll Factor**: `setScrollFactor(0)` so it remains fixed to screen coordinates as the camera moves.
- **Visual Depth**: High depth (`setDepth(100)`) so it stays above map layers and game sprites, but below modal dialogs.

### B. Visual Styling (Tactical HUD)

- **Background**: Translucent pitch black circle (`0x000000`, alpha `0.65`, matching `ChatBox` `bg-black/60`).
- **Outer Rim**: Dark black border ring (`0x000000`, 2px thickness, alpha `0.9`) with subtle inner white highlight (`0xffffff`, alpha `0.12`, matching `ChatBox` `border-white/10`).
- **Range Rings**: Subtle inner concentric circle at $R/2$ (`0xffffff`, alpha `0.12`) and faint cardinal crosshair axes (`0xffffff`, alpha `0.08`).

### C. Local Player Representation

- **Position**: Always pinned at the exact center of the radar circle `(centerX, centerY)`.
- **Marker**: Distinctive cyan/emerald dot (radius 4px).
- **Direction Pointer**: Directional tick or arrow pointing toward the player's active facing direction (`u`, `d`, `l`, `r`).

### D. Other Players Representation

- **World Range**: Radar covers a world radius of $W_{\text{range}} = 800\text{px}$ around the local player.
- **Relative Distance**: For each other player:
  $$\Delta x = x_{\text{other}} - x_{\text{local}}, \quad \Delta y = y_{\text{other}} - y_{\text{local}}$$
  $$\text{dist} = \sqrt{\Delta x^2 + \Delta y^2}$$
- **Inside Radar Range ($\text{dist} \le W_{\text{range}}$)**:
  - Scaled position:
    $$x_{\text{radar}} = \text{centerX} + \Delta x \cdot \left(\frac{R}{W_{\text{range}}}\right)$$
    $$y_{\text{radar}} = \text{centerY} + \Delta y \cdot \left(\frac{R}{W_{\text{range}}}\right)$$
  - Rendered as an amber/yellow dot (radius 3px).
- **Outside Radar Range ($\text{dist} > W_{\text{range}}$)**:
  - Directional Edge Clamping: Clamped to the radar's circumference $(R - 4\text{px})$ along angle $\theta = \text{atan2}(\Delta y, \Delta x)$:
    $$x_{\text{radar}} = \text{centerX} + (R - 4) \cos\theta$$
    $$y_{\text{radar}} = \text{centerY} + (R - 4) \sin\theta$$
  - Rendered as a smaller edge indicator dot (radius 2px, alpha `0.7`).

### E. Dynamic Map Portability

- The radar strictly operates on relative coordinate offsets $(\Delta x, \Delta y)$ and the local player's position.
- No hardcoded map dimensions or tileset dependencies: automatically works on any map loaded now or in the future.

### F. Performance & Lifecycle

- Re-draws each frame in `scene.update()` via `MinimapManager.update()`.
- Automatically destroyed when `RoomScene` shuts down or is destroyed.

---

## 3. Out of Scope (Non-Goals)

- **Tilemap Texture Baking**: No full-map snapshot rendering or secondary cameras that duplicate draw calls.
- **Interactive Clicking / Fast Travel**: Clicking the minimap does not move the player or open full-screen maps.
- **Fog of War**: All players in the room are tracked based on their broadcasted socket coordinates.

---

## 4. Architecture & Data Flow

```text
RoomScene.ts (update loop)
    │
    ▼
MinimapManager.update()
    ├── 1. Get local player sprite from scene.players.get(localSocketId)
    ├── 2. Calculate dynamic screen position (viewport width/height - margin)
    ├── 3. Clear and draw radar background & rings
    ├── 4. Draw local player marker at center with facing direction
    └── 5. Iterate scene.players:
            ├── Skip local player
            ├── Calculate offset (Δx, Δy) and distance
            └── Draw dot (inside range) or clamped edge indicator (outside range)
```

---

## 5. Affected Files

1. `apps/web/src/modules/game/phaser/utils/minimap.ts`: New file implementing `MinimapManager` class.
2. `apps/web/src/modules/game/phaser/scenes/RoomScene.ts`:
   - Initialize `this.minimapManager = new MinimapManager(this)` in `create()`.
   - Call `this.minimapManager.update()` in `update()`.
   - Clean up `this.minimapManager.destroy()` on scene shutdown/destroy.

---

## 6. Verification Checklist

- [x] `pnpm build` passes with 0 TypeScript errors.
- [x] `pnpm format` and `pnpm lint` pass cleanly.
- [ ] Minimap appears in bottom-right corner when entering any room.
- [ ] Center dot follows local player and updates directional indicator with WASD movement.
- [ ] Moving toward another player shows their dot moving closer to the center of the radar.
- [ ] Moving away from another player causes their dot to clamp to the rim of the radar.
- [ ] Leaving the room and returning cleans up and recreates the radar without memory leaks.
