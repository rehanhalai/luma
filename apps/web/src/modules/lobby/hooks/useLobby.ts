import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { getRooms, getAvatars, getAvatarCategories } from '../api/lobby.api';
import type { Room, Avatar } from '@repo/types';

export function useLobby() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('Female-01-1');
  const [rooms, setRooms] = useState<Room[]>([]);
  const [avatars, setAvatars] = useState<Avatar[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [isLoadingRooms, setIsLoadingRooms] = useState(true);
  const [isAvatarsLoading, setIsAvatarsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    async function fetchRooms() {
      try {
        setIsLoadingRooms(true);
        const data = await getRooms();
        if (isMounted) setRooms(data);
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load rooms');
        }
      } finally {
        if (isMounted) setIsLoadingRooms(false);
      }
    }

    void fetchRooms();

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchCategories() {
      try {
        const categoriesList = await getAvatarCategories();
        if (isMounted && categoriesList.length > 0) {
          setCategories(['All', ...categoriesList]);
        }
      } catch (e) {
        console.error('Failed to load avatar categories', e);
      }
    }
    void fetchCategories();
    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function fetchAvatarsList() {
      try {
        setIsAvatarsLoading(true);
        const data = await getAvatars(
          selectedCategory === 'All' ? undefined : selectedCategory,
        );
        if (isMounted) {
          setAvatars(data);
          if (data.length > 0 && !avatar) {
            setAvatar(data[0].name);
          }
        }
      } catch (err) {
        console.error('Failed to load avatars', err);
      } finally {
        if (isMounted) setIsAvatarsLoading(false);
      }
    }

    void fetchAvatarsList();
    return () => {
      isMounted = false;
    };
  }, [selectedCategory]);

  const selectedAvatarObj = useMemo(() => {
    return (
      avatars.find((a) => a.name === avatar || a.key === avatar) ||
      (avatars.length > 0 ? avatars[0] : null)
    );
  }, [avatars, avatar]);

  const handleJoinRoom = (roomCode: string) => {
    const finalName = name.trim() || 'Guest';
    const avatarToUse =
      selectedAvatarObj?.path || '/assets/sprites/Female/Female-01-1.webp';
    navigate(
      `/room?code=${encodeURIComponent(roomCode)}&name=${encodeURIComponent(finalName)}&avatar=${encodeURIComponent(avatarToUse)}`,
    );
  };

  return {
    name,
    setName,
    avatar,
    setAvatar,
    selectedAvatarObj,
    avatars,
    categories,
    selectedCategory,
    setSelectedCategory,
    rooms,
    isLoading: isLoadingRooms,
    isAvatarsLoading,
    error,
    handleJoinRoom,
  };
}
