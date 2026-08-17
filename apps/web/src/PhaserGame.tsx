import StartGame from './game/main';
import { forwardRef, useLayoutEffect, useRef } from 'react';

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

export const PhaserGame = forwardRef<IRefPhaserGame>(
  function PhaserGame(_props, ref) {
    const gameRef = useRef<Phaser.Game | null>(null);
    useLayoutEffect(() => {
      if (gameRef.current == null) {
        gameRef.current = StartGame('game-container');
        if (typeof ref === 'function') {
          ref({
            game: gameRef.current,
            scene: null,
          });
        } else if (ref) {
          ref.current = { game: gameRef.current, scene: null };
        }
      }

      return () => {
        if (gameRef.current) {
          gameRef.current.destroy(true);
          gameRef.current = null;
        }
      };
    }, [ref]);

    return (
      <div
        id="game-container"
        className="w-200 h-150 rounded-lg overflow-hidden shadow-xl"
      />
    );
  },
);
