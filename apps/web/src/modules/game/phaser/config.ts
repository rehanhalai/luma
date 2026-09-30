import { AUTO, Game } from 'phaser';
import { MainGame } from './scenes/MainGame';
import Phaser from 'phaser';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { x: 0, y: 0 },
    },
  },
  scale: {
    mode: Phaser.Scale.ScaleModes.NONE,
    width: window.innerWidth,
    height: window.innerHeight,
  },
  parent: 'game-container',
  render: {
    antialiasGL: false,
    pixelArt: true,
  },
  scene: [MainGame],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};
export default StartGame;
