import StartGame from '@/modules/game/phaser/config';
import { useRef, useLayoutEffect, forwardRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { useRoom } from './hooks/useRoom';
import { ChatBox } from './components/ChatBox';

export interface IRefPhaserGame {
  game: Phaser.Game | null;
  scene: Phaser.Scene | null;
}

export const GamePage = forwardRef<IRefPhaserGame>(
  function GamePage(_props, ref) {
    const navigate = useNavigate();
    const { roomParams, isLoading, error } = useRoom();

    const gameRef = useRef<Phaser.Game | null>(null);
    const containerRef = useRef<HTMLDivElement | null>(null);

    useLayoutEffect(() => {
      if (
        !isLoading &&
        roomParams &&
        containerRef.current &&
        gameRef.current == null
      ) {
        gameRef.current = StartGame(containerRef.current, roomParams);
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
    }, [isLoading, roomParams, ref]);

    if (isLoading) {
      return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center space-y-3">
          <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-muted-foreground">Joining room...</p>
        </div>
      );
    }

    if (error || !roomParams) {
      return (
        <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center space-y-4 p-4 text-center">
          <p className="text-destructive font-medium text-sm">
            {error || 'Room not found'}
          </p>
          <Button variant="outline" size="sm" onClick={() => navigate('/')}>
            Back to Lobby
          </Button>
        </div>
      );
    }

    return (
      <div className="relative w-screen h-screen overflow-hidden">
        <div ref={containerRef} className="w-full h-full" />
        <ChatBox />
      </div>
    );
  },
);
