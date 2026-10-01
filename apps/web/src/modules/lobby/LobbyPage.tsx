import { useLobby } from './useLobby';
import { PlayerSetupCard } from './components/PlayerSetupCard';
import { RoomList } from './components/RoomList';

export function LobbyPage() {
  const {
    name,
    setName,
    avatar,
    setAvatar,
    rooms,
    isLoading,
    error,
    handleJoinRoom,
  } = useLobby();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        <header className="text-center space-y-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Luma</h1>
          <p className="text-muted-foreground text-sm">
            Choose your character and select a virtual room to explore.
          </p>
        </header>

        <PlayerSetupCard
          name={name}
          onNameChange={setName}
          avatar={avatar}
          onAvatarChange={setAvatar}
        />

        <RoomList
          rooms={rooms}
          isLoading={isLoading}
          error={error}
          onJoinRoom={handleJoinRoom}
        />
      </div>
    </div>
  );
}
