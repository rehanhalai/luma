import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRooms } from './lobby.api';
import type { Room } from '@repo/types';

export function useLobby() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('Female');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchRooms() {
      try {
        setIsLoading(true);
        const data = await getRooms();
        if (isMounted) setRooms(data);
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load rooms');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    void fetchRooms();

    return () => {
      isMounted = false;
    };
  }, []);

  const handleJoinRoom = (roomCode: string) => {
    const finalName = name.trim() || 'Guest';
    navigate(`/room/${roomCode}?name=${encodeURIComponent(finalName)}&avatar=${encodeURIComponent(avatar)}`);
  };

  return {
    name,
    setName,
    avatar,
    setAvatar,
    rooms,
    isLoading,
    error,
    handleJoinRoom,
  };
}
