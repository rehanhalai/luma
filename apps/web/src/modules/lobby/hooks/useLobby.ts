import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  getRooms,
  getAvatars,
  getAvatarCategories,
  createPrivateRoom,
} from '../api/lobby.api';

export function useLobby() {
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [avatar, setAvatar] = useState('Female-01-1');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [code, setCode] = useState('');

  // 1. Rooms Query
  const {
    data: rooms = [],
    isLoading: isLoadingRooms,
    error: roomsError,
  } = useQuery({
    queryKey: ['rooms'],
    queryFn: getRooms,
  });

  // 2. Avatar Categories Query
  const { data: rawCategories = [] } = useQuery({
    queryKey: ['avatarCategories'],
    queryFn: getAvatarCategories,
  });

  const categories = useMemo(() => {
    return rawCategories.length > 0 ? ['All', ...rawCategories] : ['All'];
  }, [rawCategories]);

  // 3. Avatars Query
  const { data: avatars = [], isLoading: isAvatarsLoading } = useQuery({
    queryKey: ['avatars', selectedCategory],
    queryFn: () =>
      getAvatars(selectedCategory === 'All' ? undefined : selectedCategory),
  });

  // Keep first avatar selected if none active
  useEffect(() => {
    if (!avatar && avatars.length > 0) {
      setAvatar(avatars[0].name);
    }
  }, [avatar, avatars]);

  const selectedAvatarObj = useMemo(() => {
    return (
      avatars.find((a) => a.name === avatar || a.key === avatar) ||
      (avatars.length > 0 ? avatars[0] : null)
    );
  }, [avatars, avatar]);

  const handleJoinRoom = (roomCode: string) => {
    if (!selectedAvatarObj) return;

    const trimmedCode = roomCode.trim();
    if (!trimmedCode) return;

    const finalName = name.trim() || 'Guest';
    const avatarToUse = selectedAvatarObj.path;
    navigate(
      `/room?code=${encodeURIComponent(trimmedCode)}&name=${encodeURIComponent(finalName)}&avatar=${encodeURIComponent(avatarToUse)}`,
    );
  };

  // 4. Create Private Room Mutation
  const createRoomMutation = useMutation({
    mutationFn: () => createPrivateRoom(),
    onSuccess: (room) => {
      handleJoinRoom(room.code);
    },
  });

  const handleCreatePrivateRoom = () => {
    createRoomMutation.mutate();
  };

  const handleJoinByCode = () => {
    if (code.trim()) {
      handleJoinRoom(code.trim());
    }
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
    error: roomsError instanceof Error ? roomsError.message : null,
    code,
    setCode,
    handleJoinRoom,
    handleJoinByCode,
    handleCreatePrivateRoom,
    isCreatingRoom: createRoomMutation.isPending,
    createRoomError:
      createRoomMutation.error instanceof Error
        ? createRoomMutation.error.message
        : null,
  };
}
