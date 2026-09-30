import StartGame from "@/modules/game/phaser/config";
import { useRef, useLayoutEffect, forwardRef } from "react";

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

export const GamePage = forwardRef<IRefPhaserGame>(
    function GamePage(_props, ref) {
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

    return <div id="game-container" className="w-vw h-vh" />;
  }
);