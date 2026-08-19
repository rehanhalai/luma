import type { MainGame, Player } from '../scenes/MainGame';

export function setupSocketListeners(scene: MainGame, player: Player) {
  if (scene.players.has(player.id)) return;
  const sprite = scene.physics.add.sprite(player.x, player.y, 'character');
  sprite.setScale(2);
  scene.players.set(player.id, sprite);
  scene.mapLayers.forEach((layer) => {
    scene.physics.add.collider(sprite, layer);
  });
  if (player.id === scene.networkManager.socket.id) {
    scene.cameras.main.startFollow(sprite);
  }
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
      end: 2,
    }),
    frameRate: 10,
  });
  scene.anims.create({
    key: 'walk-left',
    frames: scene.anims.generateFrameNumbers('character', {
      start: 3,
      end: 5,
    }),
    frameRate: 10,
  });
  scene.anims.create({
    key: 'walk-right',
    frames: scene.anims.generateFrameNumbers('character', {
      start: 6,
      end: 8,
    }),
    frameRate: 10,
  });
  scene.anims.create({
    key: 'walk-up',
    frames: scene.anims.generateFrameNumbers('character', {
      start: 9,
      end: 11,
    }),
    frameRate: 10,
  });
}
