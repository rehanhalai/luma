import type { MainGame } from '../scenes/MainGame';

export function movementInputManager(scene: MainGame) {
  const mySprite = scene.players.get(scene.networkManager.socket.id);
  if (!mySprite || !scene.cursors) return;

  let moved = false;
  let direction: string = '';
  const speed = 4;

  if (scene.cursors.left.isDown) {
    mySprite.x -= speed;
    mySprite.anims.play('walk-left', true);
    moved = true;
    direction = 'left';
  } else if (scene.cursors.right.isDown) {
    mySprite.x += speed;
    mySprite.anims.play('walk-right', true);
    moved = true;
    direction = 'right';
  } else if (scene.cursors.up.isDown) {
    mySprite.y -= speed;
    mySprite.anims.play('walk-up', true);
    moved = true;
    direction = 'up';
  } else if (scene.cursors.down.isDown) {
    mySprite.y += speed;
    mySprite.anims.play('walk-down', true);
    moved = true;
    direction = 'down';
  } else {
    mySprite.anims.stop();
  }

  if (moved) {
    scene.networkManager.sendMovement(mySprite.x, mySprite.y, direction);
  }
}
