import { useState, useEffect, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getRoom, getMap, type RoomWithMap } from '../api/game.api';
import type { RoomParams } from '../phaser/config';

export function useRoom() {
  const [searchParams] = useSearchParams();

  const roomCode = searchParams.get('code') || '';
  const name = searchParams.get('name') || 'Guest';
  const avatar = searchParams.get('avatar') || '';

  const [roomData, setRoomData] = useState<RoomWithMap | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchRoomDetails() {
      if (!roomCode) {
        setError('Room code is required');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        const room = await getRoom(roomCode);
        const map = await getMap(room.mapId);
        if (isMounted) {
          setRoomData({ ...room, map });
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load room');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    }

    void fetchRoomDetails();

    return () => {
      isMounted = false;
    };
  }, [roomCode]);

  const roomParams: RoomParams | null = useMemo(() => {
    if (!roomData) return null;
    return {
      roomCode,
      name,
      avatar,
      map: roomData.map,
    };
  }, [roomData, roomCode, name, avatar]);

  return {
    roomCode,
    name,
    avatar,
    roomData,
    roomParams,
    isLoading,
    error,
  };
}
