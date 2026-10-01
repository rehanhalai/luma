import type { RoomScene } from '../scenes/RoomScene';

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

  const nameTag = mySprite.getData('nameTag') as
    | Phaser.GameObjects.Text
    | undefined;
  if (nameTag) {
    nameTag.setPosition(mySprite.x, mySprite.y - 36);
  }

  const prevDirection = (mySprite.getData('direction') as string) || 'stop';

  if (moved) {
    mySprite.setData('direction', direction);
    scene.networkManager.sendMovement(mySprite.x, mySprite.y, direction);
  } else if (prevDirection !== 'stop') {
    mySprite.setData('direction', 'stop');
    scene.networkManager.sendMovement(mySprite.x, mySprite.y, 'stop');
  }
}
