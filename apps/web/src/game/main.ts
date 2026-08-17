import { AUTO, Game } from 'phaser';
import { MainGame } from './scenes/MainGame';
import Phaser from 'phaser';

const config: Phaser.Types.Core.GameConfig = {
  type: AUTO,
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
  canvasStyle: `display: block; width: 100%; height: 100%;`,
  backgroundColor: '#028c78',
  scene: [MainGame],
};

const StartGame = (parent: string) => {
  return new Game({ ...config, parent });
};
export default StartGame;
