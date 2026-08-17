import type { MainGame, Player } from '../scenes/MainGame';

export function setupSocketListeners(scene: MainGame, player: Player) {
  if (scene.players.has(player.id)) return;
  const sprite = scene.add.sprite(player.x, player.y, 'character');
  sprite.setScale(1);
  scene.players.set(player.id, sprite);
}

export function handlePlayerMovement(
  scene: MainGame,
  id: string,
  newX: number,
  newY: number,
  direction: string,
) {
  const player = scene.players.get(id);
  if (player) {
    player.x = newX;
    player.y = newY;
    player.anims.play(`walk-${direction}`, true);
  }
}

export function initAnimations(scene: MainGame) {
  scene.anims.create({
    key: 'walk-down',
    frames: scene.anims.generateFrameNumbers('character', {
      start: 0,
      end: 3,
    }),
    frameRate: 10,
  });
  scene.anims.create({
    key: 'walk-up',
    frames: scene.anims.generateFrameNumbers('character', {
      start: 4,
      end: 7,
    }),
    frameRate: 10,
  });
  scene.anims.create({
    key: 'walk-left',
    frames: scene.anims.generateFrameNumbers('character', {
      start: 8,
      end: 11,
    }),
    frameRate: 10,
  });
  scene.anims.create({
    key: 'walk-right',
    frames: scene.anims.generateFrameNumbers('character', {
      start: 12,
      end: 15,
    }),
    frameRate: 10,
  });
}
