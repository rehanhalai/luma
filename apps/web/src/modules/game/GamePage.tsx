import StartGame, { type RoomParams } from "@/modules/game/phaser/config";
import { useRef, useLayoutEffect, forwardRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

export const GamePage = forwardRef<IRefPhaserGame>(
  function GamePage(_props, ref) {
    const [searchParams] = useSearchParams();

    const [roomParams] = useState<RoomParams>({
      roomCode: searchParams.get("code") || "",
      name: searchParams.get("name") || "Guest",
      avatar: searchParams.get("avatar") || "Female",
    });

    const gameRef = useRef<Phaser.Game | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
      if (gameRef.current == null && containerRef.current) {
        gameRef.current = StartGame(containerRef.current, roomParams);
        if (typeof ref === "function") {
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
    }, [ref, roomParams]);

    return <div ref={containerRef} className="w-screen h-screen" />;
  }
);