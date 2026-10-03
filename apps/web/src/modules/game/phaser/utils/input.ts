import type { RoomScene } from '../scenes/RoomScene';

const THROTTLE_MS = 50;

export function movementInputManager(scene: RoomScene) {
  const mySprite = scene.players.get(scene.networkManager.socket.id!);
  if (!mySprite || !scene.cursors || !scene.keys) return;

  let moved = false;
  let direction: string = '';
  const speed = 200;
  mySprite.setVelocity(0);

  const avatarKey = mySprite.getData('avatarKey') as string;

  if (scene.cursors.left.isDown || scene.keys.a.isDown) {
    mySprite.setVelocityX(-speed);
    mySprite.anims.play(`${avatarKey}-walk-left`, true);
    moved = true;
    direction = 'left';
  } else if (scene.cursors.right.isDown || scene.keys.d.isDown) {
    mySprite.setVelocityX(speed);
    mySprite.anims.play(`${avatarKey}-walk-right`, true);
    moved = true;
    direction = 'right';
  } else if (scene.cursors.up.isDown || scene.keys.w.isDown) {
    mySprite.setVelocityY(-speed);
    mySprite.anims.play(`${avatarKey}-walk-up`, true);
    moved = true;
    direction = 'up';
  } else if (scene.cursors.down.isDown || scene.keys.s.isDown) {
    mySprite.setVelocityY(speed);
    mySprite.anims.play(`${avatarKey}-walk-down`, true);
    moved = true;
    direction = 'down';
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
  const prevDirection = (mySprite.getData('direction') as string) || 'stop';

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
  } else if (prevDirection !== 'stop') {
    mySprite.setData('direction', 'stop');
    mySprite.setData('lastNetworkSent', now);
    scene.networkManager.sendMovement(
      Math.round(mySprite.x),
      Math.round(mySprite.y),
      'stop',
    );
  }
}
