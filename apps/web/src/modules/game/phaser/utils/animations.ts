import type { RoomScene } from '../scenes/RoomScene';
import type { Player } from '@repo/types';

import type { Direction } from '@repo/types';

const pendingAvatarLoads = new Map<string, Array<() => void>>();

export function ensureAvatarAnimations(scene: Phaser.Scene, avatarKey: string) {
  if (!scene.textures.exists(avatarKey)) {
    return;
  }

  const directions: Array<{ dir: Direction; start: number; end: number }> = [
    { dir: 'd', start: 0, end: 2 },
    { dir: 'l', start: 3, end: 5 },
    { dir: 'r', start: 6, end: 8 },
    { dir: 'u', start: 9, end: 11 },
  ];

  directions.forEach(({ dir, start, end }) => {
    const key = `${avatarKey}-walk-${dir}`;
    if (!scene.anims.exists(key)) {
      scene.anims.create({
        key,
        frames: scene.anims.generateFrameNumbers(avatarKey, {
          start,
          end,
        }),
        frameRate: 10,
        repeat: -1,
      });
    }
  });
}

export function ensureAvatarLoaded(
  scene: RoomScene,
  avatarPath: string,
  onComplete: () => void,
) {
  if (scene.textures.exists(avatarPath)) {
    ensureAvatarAnimations(scene, avatarPath);
    onComplete();
    return;
  }

  const pending = pendingAvatarLoads.get(avatarPath);
  if (pending) {
    pending.push(onComplete);
    return;
  }

  pendingAvatarLoads.set(avatarPath, [onComplete]);

  const onLoaded = () => {
    ensureAvatarAnimations(scene, avatarPath);
    const callbacks = pendingAvatarLoads.get(avatarPath) || [];
    pendingAvatarLoads.delete(avatarPath);
    callbacks.forEach((cb) => cb());
  };

  scene.load.once(`filecomplete-spritesheet-${avatarPath}`, onLoaded);
  scene.load.once('loaderror', (fileObj: { key?: string }) => {
    if (fileObj && fileObj.key === avatarPath) {
      console.warn(`Failed to load avatar spritesheet: ${avatarPath}`);
      const callbacks = pendingAvatarLoads.get(avatarPath) || [];
      pendingAvatarLoads.delete(avatarPath);
      callbacks.forEach((cb) => cb());
    }
  });

  scene.load.spritesheet(avatarPath, avatarPath, {
    frameWidth: 32,
    frameHeight: 32,
  });

  if (!scene.load.isLoading()) {
    scene.load.start();
  }
}

export function setupSocketListeners(scene: RoomScene, player: Player) {
  if (scene.players.has(player.id)) return;

  const defaultAvatar = scene.roomParams?.avatar;
  const avatarKey = player.avatar || defaultAvatar;

  const initialTexture = scene.textures.exists(avatarKey)
    ? avatarKey
    : defaultAvatar;

  const sprite = scene.physics.add.sprite(
    player.x,
    player.y,
    initialTexture,
    1,
  );
  sprite.setScale(2);
  sprite.setDepth(10);
  sprite.setData('avatarKey', avatarKey);
  scene.players.set(player.id, sprite);

  const nameTag = scene.add
    .text(player.x, player.y - 36, player.name || 'Player', {
      fontSize: '15px',
      fontFamily: 'sans-serif',
      color: '#ffffff',
      stroke: '#000000',
      strokeThickness: 4,
      align: 'center',
    })
    .setOrigin(0.5);
  nameTag.setDepth(11);
  sprite.setData('nameTag', nameTag);

  sprite.on('destroy', () => {
    nameTag.destroy();
  });

  if (player.id === scene.networkManager.socket.id) {
    scene.cameras.main.startFollow(sprite);
  }

  if (scene.textures.exists(avatarKey)) {
    ensureAvatarAnimations(scene, avatarKey);
  } else {
    ensureAvatarLoaded(scene, avatarKey, () => {
      if (sprite.active) {
        sprite.setTexture(avatarKey, 1);
        const currentDir = sprite.getData('direction') as Direction | undefined;
        if (currentDir && currentDir !== 's') {
          const animKey = `${avatarKey}-walk-${currentDir}`;
          if (scene.anims.exists(animKey)) {
            sprite.anims.play(animKey, true);
          }
        }
      }
    });
  }
}

export function handlePlayerMovement(
  scene: RoomScene,
  id: string,
  newX: number,
  newY: number,
  direction: Direction,
) {
  const sprite = scene.players.get(id);
  if (sprite) {
    sprite.x = newX;
    sprite.y = newY;
    sprite.setData('direction', direction);

    const nameTag = sprite.getData('nameTag') as
      | Phaser.GameObjects.Text
      | undefined;
    if (nameTag) {
      nameTag.setPosition(newX, newY - 36);
    }

    const avatarKey =
      (sprite.getData('avatarKey') as string) || sprite.texture.key;

    if (direction && direction !== 's') {
      const animKey = `${avatarKey}-walk-${direction}`;
      if (scene.anims.exists(animKey)) {
        sprite.anims.play(animKey, true);
      }
    } else {
      sprite.anims.stop();
      sprite.setFrame(1);
    }
  }
}

export function initAnimations(scene: RoomScene) {
  const defaultAvatar = scene.roomParams?.avatar;
  ensureAvatarAnimations(scene, defaultAvatar);

  scene.events.once('shutdown', () => {
    pendingAvatarLoads.clear();
  });
}
