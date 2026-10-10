import type { RoomScene } from '../scenes/RoomScene';
import type { Direction } from '@repo/types';

const THROTTLE_MS = 75;

export function movementInputManager(scene: RoomScene) {
  const mySprite = scene.players.get(scene.networkManager.socket.id!);
  if (!mySprite || !scene.cursors || !scene.keys) return;

  if (scene.registry.get('isChatFocused')) {
    mySprite.setVelocity(0);
    mySprite.anims.stop();
    mySprite.setFrame(1);
    const prevDirection = (mySprite.getData('direction') as Direction) || 's';
    if (prevDirection !== 's') {
      mySprite.setData('direction', 's');
      mySprite.setData('lastNetworkSent', performance.now());
      scene.networkManager.sendMovement(
        Math.round(mySprite.x),
        Math.round(mySprite.y),
        's',
      );
    }
    return;
  }

  let moved = false;
  let direction: Direction = 's';
  const speed = 200;
  mySprite.setVelocity(0);

  const avatarKey = mySprite.getData('avatarKey') as string;

  if (scene.cursors.left.isDown || scene.keys.a.isDown) {
    mySprite.setVelocityX(-speed);
    mySprite.anims.play(`${avatarKey}-walk-l`, true);
    moved = true;
    direction = 'l';
  } else if (scene.cursors.right.isDown || scene.keys.d.isDown) {
    mySprite.setVelocityX(speed);
    mySprite.anims.play(`${avatarKey}-walk-r`, true);
    moved = true;
    direction = 'r';
  } else if (scene.cursors.up.isDown || scene.keys.w.isDown) {
    mySprite.setVelocityY(-speed);
    mySprite.anims.play(`${avatarKey}-walk-u`, true);
    moved = true;
    direction = 'u';
  } else if (scene.cursors.down.isDown || scene.keys.s.isDown) {
    mySprite.setVelocityY(speed);
    mySprite.anims.play(`${avatarKey}-walk-d`, true);
    moved = true;
    direction = 'd';
  } else {
    mySprite.anims.stop();
    mySprite.setFrame(1);
  }

  const nameTag = mySprite.getData('nameTag') as Phaser.GameObjects.Text;
  if (nameTag) {
    nameTag.setPosition(mySprite.x, mySprite.y - 36);
  }

  const now = performance.now();
  const lastSent = mySprite.getData('lastNetworkSent') as number;
  const prevDirection = (mySprite.getData('direction') as Direction) || 's';

  if (moved) {
    const directionChanged = direction !== prevDirection;
    const timeToEmit = now - lastSent >= THROTTLE_MS;

    // Send ONLY IF:
    // 1. Player changed direction (e.g. turned from left to up)
    // OR
    // 2. 50ms have passed since the last packet

    if (directionChanged || timeToEmit) {
      mySprite.setData('direction', direction);
      mySprite.setData('lastNetworkSent', now);
      scene.networkManager.sendMovement(
        Math.round(mySprite.x),
        Math.round(mySprite.y),
        direction,
      );
    }
  } else if (prevDirection !== 's') {
    mySprite.setData('direction', 's');
    mySprite.setData('lastNetworkSent', now);
    scene.networkManager.sendMovement(
      Math.round(mySprite.x),
      Math.round(mySprite.y),
      's',
    );
  }
}
