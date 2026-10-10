import { useLobby } from './hooks/useLobby';
import { AvatarSelectorCard } from './components/AvatarSelectorCard';
import { PlayerNameCard } from './components/PlayerNameCard';
import { RoomList } from './components/RoomList';
import { PrivateRoomCard } from './components/PrivateRoomCard';

export function LobbyPage() {
  const {
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
    isLoading,
    isAvatarsLoading,
    error,
    code,
    setCode,
    handleJoinRoom,
    handleJoinByCode,
    handleCreatePrivateRoom,
    isCreatingRoom,
    createRoomError,
  } = useLobby();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 md:p-8">
      <div className="w-full max-w-6xl space-y-6">
        <header className="text-center space-y-1.5">
          <h1 className="text-4xl font-extrabold tracking-tight">Luma</h1>
          <p className="text-muted-foreground text-sm">
            Choose your avatar, enter your display name, and join a room.
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
          <div className="lg:col-span-2">
            <AvatarSelectorCard
              avatars={avatars}
              categories={categories}
              selectedCategory={selectedCategory}
              onSelectCategory={setSelectedCategory}
              selectedAvatar={avatar}
              onSelectAvatar={setAvatar}
              isLoading={isAvatarsLoading}
            />
          </div>

          <div className="lg:col-span-1 flex flex-col gap-5">
            <PlayerNameCard
              name={name}
              onNameChange={setName}
              selectedAvatar={avatar}
              selectedAvatarObj={selectedAvatarObj}
            />

            <PrivateRoomCard
              code={code}
              onCodeChange={setCode}
              onCreatePrivateRoom={handleCreatePrivateRoom}
              onJoinByCode={handleJoinByCode}
              isCreating={isCreatingRoom}
              error={createRoomError}
            />

            <RoomList
              rooms={rooms}
              isLoading={isLoading}
              error={error}
              onJoinRoom={handleJoinRoom}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
