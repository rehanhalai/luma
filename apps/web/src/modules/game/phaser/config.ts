import { AUTO, Game } from 'phaser';
import { RoomScene } from './scenes/RoomScene';
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
  scene: [RoomScene],
};

import type { Map as GameMap } from '@repo/types';

export interface RoomParams {
  roomCode: string;
  name: string;
  avatar: string;
  map?: GameMap;
}

const StartGame = (parent: HTMLElement, roomParams?: RoomParams) => {
  return new Game({
    ...config,
    parent,
    callbacks: {
      preBoot: (game) => {
        if (roomParams) {
          game.registry.set('roomParams', roomParams);
        }
      },
    },
  });
};
export default StartGame;
