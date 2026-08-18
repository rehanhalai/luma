import type { MainGame } from '../scenes/MainGame';

export function movementInputManager(scene: MainGame) {
  const mySprite = scene.players.get(scene.networkManager.socket.id);
  if (!mySprite || !scene.cursors) return;

  let moved = false;
  let direction: string = '';
  const speed = 200;
  mySprite.setVelocity(0);

  if (scene.cursors.left.isDown || scene.keys.a.isDown) {
    mySprite.setVelocityX(-speed);
    mySprite.anims.play('walk-left', true);
    moved = true;
    direction = 'left';
  } else if (scene.cursors.right.isDown || scene.keys.d.isDown) {
    mySprite.setVelocityX(speed);
    mySprite.anims.play('walk-right', true);
    moved = true;
    direction = 'right';
  } else if (scene.cursors.up.isDown || scene.keys.w.isDown) {
    mySprite.setVelocityY(-speed);
    mySprite.anims.play('walk-up', true);
    moved = true;
    direction = 'up';
  } else if (scene.cursors.down.isDown || scene.keys.s.isDown) {
    mySprite.setVelocityY(speed);
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
